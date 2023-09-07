import json
import sys
from typing import Tuple

from spacebridge_grpc.grpc_pb2_grpc import AuthenticationCodeRegistrationV2Stub
from spacebridge_protocol.http_pb2 import EnvironmentMetadata
from spacebridge_protocol.registration_v2_pb2 import (
    CLIENT_ID_V1,
    ClientRegistration,
    ClientRegistrationRequest,
    KeyBundle,
    RegistrarQueryRequest,
    RegistrarQueryResponse,
    RegistrarResult,
    RegistrarResultRequest
)

from cloudgateway.auth import SimpleUserCredentials
from cloudgateway.device import DeviceInfo
from cloudgateway.encryption_context import EncryptionContext
from cloudgateway.private.exceptions.registration_exceptions import RegistrationError
from cloudgateway.private.registration.registration_utils import (
    build_device_encryption_info
)
from cloudgateway.private.registration.registration_utils import derive_auth_params
from cloudgateway.private.registration.registration_utils_grpc import (
    get_grpc_channel,
    get_grpc_metadata,
    send_public_keys,
    enable_routing
)
from cloudgateway.private.sodium_client.pysodium import (
    crypto_box_seal,
    crypto_sign_detached
)
from cloudgateway.private.util.config import SplunkConfig
from cloudgateway.registration_auth_v2 import (
    build_registrar_result,
    decrypt_client_registration_payload,
    validate_registrar_query_response
)


def authenticate_code_v2(auth_code: str,
                         encryption_context: EncryptionContext,
                         resolve_app_name,
                         config: SplunkConfig = SplunkConfig(),
                         mdm_signing_public_key: bytes = None,
                         enforce_mdm: bool = False,
                         channel = None) -> DeviceInfo:
    """
    Part 1/2 of the registration process using GRPC
    Submit an auth code to spacebridge, and retrieve the encryption credentials for the device associated to
    that auth code

    :param auth_code: auth code shown on mobile device
    :param encryption_context: EncryptionContext object. Can be a regular EncryptionContext or a subclass such
    as SplunkEncryptionContext depending on whether you want to run in standalone mode or not.
    :param resolve_app_name: A function that, given an app id, will return a human friendly app name
    :param config: CloudgatewaySdkConfig object
    :param mdm_signing_public_key: A signing key for mdm (default None)
    :param enforce_mdm: A flag that enforces mdm (default False)
    :param channel: (Optional) A custom channel for the grpc request
    :return: DeviceInfo object
    """

    sb_key_bundle = KeyBundle(
        clientIdVersion=CLIENT_ID_V1,
        publicKeyForEncryption=encryption_context.encrypt_public_key(),
        publicKeyForSigning=encryption_context.sign_public_key()
    )

    send_public_keys(encryption_context, config, sb_key_bundle, channel)

    _, auth_id, shared_encryption_key = derive_auth_params(encryption_context, auth_code)

    payload, client_registration = fetch_and_validate_auth_code(auth_id,
                                                                shared_encryption_key,
                                                                encryption_context,
                                                                config,
                                                                num_retries=5,
                                                                channel=channel)

    return build_device_encryption_info(client_registration,
                                        encryption_context,
                                        resolve_app_name,
                                        enforce_mdm,
                                        payload,
                                        mdm_signing_public_key)


def pair_device_v2(auth_code: str,
                   user_auth_credentials: SimpleUserCredentials,
                   device_encryption_info: DeviceInfo,
                   encryption_context: EncryptionContext,
                   server_name: str = "",
                   server_app_id: str = "",
                   server_app_version: str = "",
                   config: SplunkConfig = SplunkConfig(),
                   env_metadata: EnvironmentMetadata = None,
                   channel = None):
    """
     Part 2/2 of the registration process using GRPC.
     Send splunk app's public key and registration information to the registrar to confirm the client registration and
     upload registrar pairing data

     :param auth_code:  auth code of the device
     :param user_auth_credentials: UserAuthCredentials object interface which captures different forms of session tokens
     :param device_encryption_info: DeviceInfo object which was returned in the authenticate_code api call
     :param encryption_context: EncryptionContext object. Can be a regular EncryptionContext or a subclass such
     as SplunkEncryptionContext depending on whether you want to run in standalone mode or not.
     :param server_name: optional parameter for name of server so that device can identify which instance it is paired
     with
     :param server_app_id: optional parameter for id of the server application, used by the device for identification
     :param server_app_version: optional parameter that allows the device to confirm app version
     :param config: CloudgatewaySdkConfig object
     :param key_bundle: optional parameter for Client KeyBundle proto object containing clientIdVersion and both public keys
     :param env_metadata: optional EnvironmentMetadata proto object
     :param channel: (Optional) A custom channel for the grpc request
     :return:
     """

    # Validate Auth Credentials
    user_auth_credentials.validate()

    # Enable routing server side
    enable_routing(encryption_context, device_encryption_info.device_id, config, channel=channel)

    # Build Client KeyBundle
    key_bundle = KeyBundle(
        clientIdVersion=CLIENT_ID_V1,
        publicKeyForEncryption=encryption_context.encrypt_public_key(),
        publicKeyForSigning=encryption_context.sign_public_key()
    )

    # Parse session metadata
    session_token = user_auth_credentials.get_credentials() \
        if sys.version_info < (3, 0) else str.encode(user_auth_credentials.get_credentials())

    token_expires_at = user_auth_credentials.get_expiration()
    token_type = user_auth_credentials.get_token_type()
    encrypted_session_token = encryption_context.secure_session_token(session_token)

    # Generate auth_id from auth_code
    _, auth_id, _ = derive_auth_params(encryption_context, auth_code)

    # Build encrypted payload and sign the message
    registrar_result = build_registrar_result(user_auth_credentials.get_username(),
                                              encrypted_session_token,
                                              server_app_id,
                                              server_app_version,
                                              server_name=server_name,
                                              key_bundle=key_bundle,
                                              token_type=token_type,
                                              token_expires_at=token_expires_at,
                                              env_metadata=env_metadata)

    # Confirm client registration and upload registrar pairing data
    query_registration_confirmation(auth_id,
                                    encryption_context,
                                    device_encryption_info.encrypt_public_key,
                                    registrar_result,
                                    config,
                                    channel=channel)


def query_client_registration(config: SplunkConfig,
                              auth_id: bytes,
                              encryption_context: EncryptionContext,
                              num_retries: int = 0,
                              channel = None) -> RegistrarQueryResponse:
    retry_config = json.dumps(
        {
            "methodConfig": [
                {
                    "name": [{"service": "spacebridge_grpc.grpc_pb2_grpc"}],
                    "retryPolicy": {
                        "maxAttempts": min(5, num_retries),
                        "initialBackoff": "0.1s",
                        "maxBackoff": "15s",
                        "backoffMultiplier": 2,
                        "retryableStatusCodes": ["UNAVAILABLE", "UNKNOWN"],
                    },
                }
            ]
        }
    )

    channel = channel or get_grpc_channel(config, options=[("grpc.service_config", retry_config)])
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    request = RegistrarQueryRequest(authId=auth_id)

    response_pb = stub.QueryClientRegistration(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error from QueryClientRegistration',
                                code=response_pb.error.code,
                                message=response_pb.error.message)

    return response_pb


def query_registration_confirmation(auth_id: bytes,
                                    encryption_context: EncryptionContext,
                                    device_public_key: bytes,
                                    registrar_result: RegistrarResult,
                                    config: SplunkConfig,
                                    channel = None) -> None:
    encrypted_registrar_result = crypto_box_seal(registrar_result.SerializeToString(),
                                                 device_public_key)
    signature = crypto_sign_detached(encrypted_registrar_result,
                                     encryption_context.sign_private_key())
    request = RegistrarResultRequest(
        encryptedRegistrarResult=encrypted_registrar_result,
        signature=signature,
        authId=auth_id
    )

    channel = channel or get_grpc_channel(config)
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    response_pb = stub.ConfirmClientRegistration(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error from ConfirmClientRegistration',
                                code=response_pb.error.code,
                                message=response_pb.error.message)


def fetch_and_validate_auth_code(auth_id: bytes,
                                 shared_encryption_key: bytes,
                                 encryption_context: EncryptionContext,
                                 config: SplunkConfig,
                                 num_retries: int = 0,
                                 channel = None) \
        -> Tuple[ClientRegistrationRequest.Payload, ClientRegistration]:
    # Query the client registration
    query_response = query_client_registration(config, auth_id, encryption_context, num_retries, channel)

    # Unpack client registration payload
    client_registration_request = query_response.clientRegistration
    serialized_payload = client_registration_request.serializedPayload

    payload = ClientRegistrationRequest.Payload()
    payload.ParseFromString(serialized_payload)

    # Decrypt client registration payload
    client_registration = decrypt_client_registration_payload(payload, shared_encryption_key)
    device_sign_key = client_registration.keyBundle.publicKeyForSigning

    # Validate registration query response signature
    validate_registrar_query_response(query_response, device_sign_key)

    # Return payload and decrypted client_registration
    return payload, client_registration
