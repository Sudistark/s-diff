import base64
from typing import Tuple

import grpc
from spacebridge_grpc.grpc_pb2_grpc import AuthenticationCodeRegistrationV2Stub
from spacebridge_protocol.http_pb2 import EnvironmentMetadata
from spacebridge_protocol.registration_v2_pb2 import (
    CLIENT_ID_V1,
    ClientResultRequest,
    KeyBundle,
    RegisterPublicKeysRequest,
    RegistrarResult,
    RoutingEnableRequest,
)

from cloudgateway.encryption_context import EncryptionContext
from cloudgateway.private.exceptions.registration_exceptions import RegistrationError
from cloudgateway.private.registration.registration_utils import derive_auth_params, build_client_registration_request
from cloudgateway.private.sodium_client.pysodium import (
    crypto_sign_verify_detached,
    crypto_box_seal_open,
)
from cloudgateway.private.util.config import SplunkConfig
from cloudgateway.private.util.constants import HEADER_CLIENT_ID
from cloudgateway.splunk.auth import SplunkJWTCredentials


def get_grpc_metadata(encryption_context: EncryptionContext) -> [Tuple[str, bytes]]:
    return [(HEADER_CLIENT_ID,
             base64.b64encode(encryption_context.sign_public_key(encryption_context.generichash_raw)))]


def get_grpc_channel(config: SplunkConfig,
                     options: [Tuple[str, str]] = [],
                     interceptor: grpc.UnaryUnaryClientInterceptor = None):
    credentials = grpc.ssl_channel_credentials()
    channel = grpc.secure_channel(config.get_spacebridge_grpc_server(), credentials=credentials, options=options)
    if interceptor:
        channel = grpc.intercept_channel(channel, interceptor)

    return channel


def initial_registration_request(auth_code: str,
                                 encryption_context: EncryptionContext,
                                 config: SplunkConfig = SplunkConfig(),
                                 jwt: SplunkJWTCredentials = None,
                                 environment_metadata: EnvironmentMetadata = None,
                                 channel = None) -> None:
    key_bundle = KeyBundle(
        clientIdVersion=CLIENT_ID_V1,
        publicKeyForEncryption=encryption_context.encrypt_public_key(),
        publicKeyForSigning=encryption_context.sign_public_key()
    )

    # Send both pub keys to spacebridge
    send_public_keys(encryption_context, config, key_bundle, channel=channel)

    request, auth_id = build_client_registration_request(auth_code, encryption_context, jwt,
                                                         environment_metadata, key_bundle)

    channel = channel or get_grpc_channel(config)
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    response_pb = stub.RegisterClient(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error during ClientRegistrationRequest',
                                code=response_pb.error.code,
                                message=response_pb.error.message)


def send_public_keys(encryption_context: EncryptionContext,
                     config: SplunkConfig,
                     key_bundle: KeyBundle,
                     channel = None) -> None:
    serialized_key_bundle = key_bundle.SerializeToString()
    signature = encryption_context.sodium_client.sign_detached(serialized_key_bundle,
                                                               encryption_context.sign_private_key())
    request = RegisterPublicKeysRequest(
        serializedKeyBundle=serialized_key_bundle,
        signature=signature
    )

    channel = channel or get_grpc_channel(config)
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    response_pb = stub.RegisterPublicKey(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error during RegisterPublicKeysRequest',
                                code=response_pb.error.code,
                                message=response_pb.error.message)


def enable_routing(encryption_context: EncryptionContext,
                   device_client_id: bytes, config: SplunkConfig,
                   channel = None) -> None:
    signature = encryption_context.sodium_client.sign_detached(device_client_id, encryption_context.sign_private_key())
    request = RoutingEnableRequest(
        senderClientId=device_client_id,
        signature=signature
    )

    channel = channel or get_grpc_channel(config)
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    response_pb = stub.EnableRouting(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix='Application error while enabling routing',
                                code=response_pb.error.code,
                                message=response_pb.error.message)


def query_for_completion(auth_code: str,
                         encryption_context: EncryptionContext,
                         config: SplunkConfig = SplunkConfig(),
                         channel = None) -> RegistrarResult:
    nonce, auth_id, shared_encryption_key = derive_auth_params(encryption_context, auth_code)

    request = ClientResultRequest(authId=auth_id)

    channel = channel or get_grpc_channel(config)
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    response_pb = stub.QueryRegistration(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix="Application error during QueryRegistration",
                                code=response_pb.error.code,
                                message=response_pb.error.message)

    decrypted_payload = crypto_box_seal_open(response_pb.registrarResult.encryptedRegistrarResult,
                                             encryption_context.encrypt_public_key(),
                                             encryption_context.encrypt_private_key())

    registrar_result = RegistrarResult()
    registrar_result.ParseFromString(decrypted_payload)

    signature = response_pb.registrarResult.signature
    public_signing_key = registrar_result.confirmation.keyBundle.publicKeyForSigning
    payload = response_pb.registrarResult.encryptedRegistrarResult

    crypto_sign_verify_detached(signature, payload, public_signing_key)

    return registrar_result
