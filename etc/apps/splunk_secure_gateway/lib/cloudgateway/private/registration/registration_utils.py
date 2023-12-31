import requests

from typing import Tuple, Optional

from cloudgateway.device import DeviceInfo
from cloudgateway.splunk.auth import SplunkJWTCredentials
from cloudgateway.private.exceptions.registration_exceptions import RegistrationError
from cloudgateway.encryption_context import EncryptionContext
from cloudgateway.private.util.constants import MDM, NOT_MDM
from cloudgateway.private.registration.authenticate import is_mdm_signature_valid, verify_mdm_signature
from cloudgateway.private.sodium_client.pysodium import (
    crypto_secretbox,
    crypto_sign_verify_detached,
    crypto_box_seal_open,
    crypto_secretbox_NONCEBYTES,
    randombytes
)
from spacebridge_protocol.http_pb2 import EnvironmentMetadata
from cloudgateway.private.util.config import SplunkConfig
from cloudgateway.private.util.constants import (
    APPLICATION_PROTOBUF,
    HEADER_AUTHORIZATION,
    HEADER_CONTENT_TYPE,
    HEADER_SPACEBRIDGE_AUTH_ID,
    REGISTRATION_V2_PATH
)
from http import HTTPStatus
from spacebridge_protocol.registration_v2_pb2 import (
    CLIENT_ID_V1,
    ClientRegistration,
    ClientRegistrationRequest,
    ClientRegistrationResponse,
    ClientResultResponse,
    EntropyGenerationResponse,
    KeyBundle,
    RegisterPublicKeysRequest,
    RegisterPublicKeysResponse,
    RegistrarResult,
    RoutingEnableRequest,
    RoutingEnableResponse,
)


def build_device_encryption_info(client_registration: ClientRegistration,
                                 encryption_context: EncryptionContext,
                                 resolve_app_name,
                                 enforce_mdm: bool,
                                 payload: ClientRegistrationRequest.Payload,
                                 mdm_signing_public_key: bytes = b"") -> DeviceInfo:
    # Builds a DeviceInfo with the payload from a client's registration
    device_sign_key = client_registration.keyBundle.publicKeyForSigning
    device_encrypt_key = client_registration.keyBundle.publicKeyForEncryption
    device_id = encryption_context.generichash_raw(device_sign_key)
    confirmation_code = encryption_context.generichash_hex(device_sign_key).upper()[:8]
    app_id = client_registration.clientInfo.appId
    app_friendly_name = client_registration.clientInfo.appFriendlyName
    app_name = app_friendly_name if app_friendly_name else resolve_app_name(app_id)
    platform = client_registration.clientInfo.operatingSystemName

    if enforce_mdm:
        # attempt to verify, throw exception on failure
        verify_mdm_signature(payload, mdm_signing_public_key, encryption_context)
        device_management_method = MDM
    else:
        # attempt to verify, save whether verification was successful
        mdm_valid = is_mdm_signature_valid(payload, mdm_signing_public_key, encryption_context)
        device_management_method = MDM if mdm_valid else NOT_MDM

    device_encryption_info = DeviceInfo(encrypt_public_key=device_encrypt_key,
                                        sign_public_key=device_sign_key,
                                        device_id=device_id,
                                        confirmation_code=confirmation_code,
                                        app_id=app_id,
                                        app_name=app_name,
                                        platform=platform,
                                        device_management_method=device_management_method)

    return device_encryption_info


def build_client_registration_request(auth_code: str,
                                      encryption_context: EncryptionContext,
                                      jwt: Optional[SplunkJWTCredentials] = None,
                                      environment_metadata: Optional[EnvironmentMetadata] = None,
                                      key_bundle: Optional[KeyBundle] = None) -> Tuple[
    ClientRegistrationRequest, bytes]:
    # Build the ClientRegistration and ClientRegistrationRequest protos
    nonce, auth_id, shared_encryption_key = derive_auth_params(encryption_context, auth_code)

    client_registration = ClientRegistration(
        keyBundle=key_bundle
    )

    if jwt:
        client_registration.credentials.sessionToken = encryption_context.secure_session_token(  # type: ignore
            jwt.get_credentials().encode())
        client_registration.credentials.userName = jwt.get_username()
        client_registration.credentials.tokenType = jwt.get_token_type()  # type: ignore
        client_registration.credentials.tokenExpiresAt = jwt.get_expiration()

    if environment_metadata:
        client_registration.clientInfo.environmentMetadata.serializedMetadata = environment_metadata.serializedMetadata
        client_registration.clientInfo.environmentMetadata.id = environment_metadata.id

    encrypted_client_registration = crypto_secretbox(client_registration.SerializeToString(),
                                                     nonce,
                                                     shared_encryption_key)

    client_registration_payload = ClientRegistrationRequest.Payload(
        authId=auth_id,
        nonce=nonce,
        encryptedClientRegistration=encrypted_client_registration
    )

    serialized_payload = client_registration_payload.SerializeToString()
    signature = encryption_context.sodium_client.sign_detached(serialized_payload,
                                                               encryption_context.sign_private_key())

    request = ClientRegistrationRequest(
        serializedPayload=serialized_payload,
        signature=signature
    )

    return request, auth_id


def initial_registration_request(auth_code: str,
                                 encryption_context: EncryptionContext,
                                 config: SplunkConfig = SplunkConfig(),
                                 jwt: Optional[SplunkJWTCredentials] = None,
                                 environment_metadata: Optional[EnvironmentMetadata] = None):
    key_bundle = KeyBundle(
        clientIdVersion=CLIENT_ID_V1,
        publicKeyForEncryption=encryption_context.encrypt_public_key(),
        publicKeyForSigning=encryption_context.sign_public_key()
    )

    # Send both pub keys to spacebridge
    send_public_keys(encryption_context, config, key_bundle)

    request, auth_id = build_client_registration_request(auth_code, encryption_context, jwt,
                                                         environment_metadata, key_bundle)

    response = requests.post(
        url=f'https://{config.get_spacebridge_server()}/{REGISTRATION_V2_PATH}/initiate',
        headers={
            HEADER_AUTHORIZATION: encryption_context.sign_public_key(transform=encryption_context.generichash_hex),
            HEADER_CONTENT_TYPE: APPLICATION_PROTOBUF,
            HEADER_SPACEBRIDGE_AUTH_ID: auth_id.hex(),
        },
        data=request.SerializeToString(),
        proxies=config.get_proxies()
    )

    if response.status_code != HTTPStatus.OK:
        raise RegistrationError(prefix='HTTP error during ClientRegistrationRequest',
                                code=response.status_code,
                                message=response.text)
    response_pb = ClientRegistrationResponse()
    response_pb.ParseFromString(response.content)
    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error during ClientRegistrationRequest',
                                code=response_pb.error.code,
                                message=response_pb.error.message)


def derive_auth_params(encryption_context: EncryptionContext, auth_code: str) -> Tuple[bytes, bytes, bytes]:
    """
    This generates a random auth code for use by both registration parties.

    Additionally this derives a shared encryption key and auth ID from the randomly generated and hashed auth code.
    Along with a randomly generated nonce, these values are used to encrypt and decrypt client specific registration
    information from both ends.

    See https://en.wikipedia.org/wiki/Key_derivation_function for high level information on how key derivation works.
    """
    nonce = randombytes(crypto_secretbox_NONCEBYTES)

    master_key = encryption_context.sodium_client.pwhash_easy(auth_code)
    auth_id = encryption_context.sodium_client.crypto_kdf_derive_authid(master_key)
    shared_encryption_key = encryption_context.sodium_client.crypto_kdf_derive_encryption(master_key)

    return nonce, auth_id, shared_encryption_key


def enable_routing(encryption_context: EncryptionContext,
                   device_client_id: bytes,
                   config: SplunkConfig):
    signature = encryption_context.sodium_client.sign_detached(device_client_id, encryption_context.sign_private_key())

    request = RoutingEnableRequest(
        senderClientId=device_client_id,
        signature=signature
    )
    response = requests.post(
        url=f'https://{config.get_spacebridge_server()}/{REGISTRATION_V2_PATH}/route',
        headers={
            HEADER_AUTHORIZATION: encryption_context.sign_public_key(transform=encryption_context.generichash_hex),
            HEADER_CONTENT_TYPE: APPLICATION_PROTOBUF
        },
        data=request.SerializeToString(),
        proxies=config.get_proxies()
    )
    if not response.ok:
        raise RegistrationError(prefix='HTTP error while enabling routing',
                                code=response.status_code,
                                message=response.text)
    response_pb = RoutingEnableResponse()
    response_pb.ParseFromString(response.content)
    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error while enabling routing',
                                code=response_pb.error.code,
                                message=response_pb.error.message)


def send_public_keys(encryption_context: EncryptionContext,
                     config: SplunkConfig,
                     key_bundle: KeyBundle):
    serialized_key_bundle = key_bundle.SerializeToString()
    signature = encryption_context.sodium_client.sign_detached(serialized_key_bundle,
                                                               encryption_context.sign_private_key())
    request = RegisterPublicKeysRequest(
        serializedKeyBundle=serialized_key_bundle,
        signature=signature
    )
    response = requests.post(
        url=f'https://{config.get_spacebridge_server()}/{REGISTRATION_V2_PATH}/public_keys',
        headers={
            HEADER_AUTHORIZATION: encryption_context.sign_public_key(transform=encryption_context.generichash_hex),
            HEADER_CONTENT_TYPE: APPLICATION_PROTOBUF
        },
        data=request.SerializeToString(),
        proxies=config.get_proxies()
    )
    if response.status_code != HTTPStatus.OK:
        raise RegistrationError(prefix='HTTP error during RegisterPublicKeysRequest',
                                code=response.status_code,
                                message=response.text)
    response_pb = RegisterPublicKeysResponse()
    response_pb.ParseFromString(response.content)
    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error during RegisterPublicKeysRequest',
                                code=response_pb.error.code,
                                message=response_pb.error.message)


def query_for_completion(auth_code: str,
                         encryption_context: EncryptionContext,
                         config: SplunkConfig = SplunkConfig()):
    nonce, auth_id, shared_encryption_key = derive_auth_params(encryption_context, auth_code)

    response = requests.get(
        url=f'https://{config.get_spacebridge_server()}/{REGISTRATION_V2_PATH}/result',
        headers={
            HEADER_AUTHORIZATION: encryption_context.sign_public_key(transform=encryption_context.generichash_hex),
            HEADER_SPACEBRIDGE_AUTH_ID: auth_id.hex()
        },
        proxies=config.get_proxies()
    )
    if response.status_code != HTTPStatus.OK:
        raise RegistrationError(prefix='HTTP error during ClientResultRequest',
                                code=response.status_code,
                                message=response.text)
    response_pb = ClientResultResponse()
    response_pb.ParseFromString(response.content)

    payload = response_pb.registrarResult.encryptedRegistrarResult
    signature = response_pb.registrarResult.signature

    decrypted_payload = crypto_box_seal_open(payload,
                                             encryption_context.encrypt_public_key(),
                                             encryption_context.encrypt_private_key())
    registrar_result = RegistrarResult()
    registrar_result.ParseFromString(decrypted_payload)

    public_signing_key = registrar_result.confirmation.keyBundle.publicKeyForSigning

    # Ensure Signature match
    crypto_sign_verify_detached(signature, payload, public_signing_key)

    return registrar_result


def entropy_request(encryption_context: EncryptionContext,
                    config: SplunkConfig = SplunkConfig()):
    response = requests.get(
        url=f'https://{config.get_spacebridge_server()}/{REGISTRATION_V2_PATH}/entropy',
        headers={
            HEADER_AUTHORIZATION: encryption_context.sign_public_key(transform=encryption_context.generichash_hex),
        },
        proxies=config.get_proxies()
    )

    response_pb = EntropyGenerationResponse()
    response_pb.ParseFromString(response.content)

    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error from EntropyGenerationResponse',
                                code=response_pb.error.code,
                                message=response_pb.error.message)

    return response_pb
