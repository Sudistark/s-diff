import uuid

from spacebridge_grpc.grpc_pb2_grpc import AuthenticationCodeRegistrationV2Stub, SessionStub
from spacebridge_grpc.registration_v2_pb2 import (
    ClientResultRequest,
    RegistrarResult,
)
from spacebridge_protocol.http_pb2 import EnvironmentMetadata, HttpError
from spacebridge_protocol.registration_v2_pb2 import DeleteClientRegistrationRequest

from cloudgateway.encryption_context import EncryptionContext
from cloudgateway.private.encryption.encryption_handler import decrypt_for_receive
from cloudgateway.private.exceptions.registration_exceptions import RegistrationError, RegistrationTimeout
from cloudgateway.private.registration import unregister
from cloudgateway.private.registration.registration_utils_grpc import (
    initial_registration_request,
    enable_routing,
    get_grpc_metadata, get_grpc_channel
)
from cloudgateway.private.sodium_client.pysodium import crypto_sign_detached
from cloudgateway.private.util.config import SplunkConfig
from cloudgateway.registration_v2 import DeviceInfo
from cloudgateway.splunk.auth import SplunkJWTCredentials


# -------------------------------------------------- Start public API --------------------------------------------------


def start_registration(encryption_context: EncryptionContext,
                       jwt: SplunkJWTCredentials,
                       environment_metadata: EnvironmentMetadata = None,
                       config: SplunkConfig = None,
                       channel = None) -> str:
    """
    Initiates a Spacebridge registration using the GRPC protos and returns the auth code associated with the pairing.

    :param environment_metadata: environment metadata, serialized version get request
    :param encryption_context: the public and private signing / encryption keys of the initiator
    :param jwt: a token for authentication the user owning the device to be registered
    :param config: (Optional) a config for determining which Spacebridge host to use
    :param channel: (Optional) A custom channel for the grpc request

    :raises RegistrationError: If Spacebridge fails to accept a new pairing request. For more specific debug
                               information, see the "code" attribute of the returned exception.

    :returns: the auth code for the registration
    """

    config = config or SplunkConfig()

    auth_code = str(uuid.uuid4()).upper()

    initial_registration_request(auth_code=auth_code,
                                 encryption_context=encryption_context,
                                 config=config,
                                 jwt=jwt,
                                 environment_metadata=environment_metadata,
                                 channel=channel)

    return auth_code


def complete_registration(auth_id: bytes,
                          encryption_context: EncryptionContext,
                          config: SplunkConfig = None,
                          channel = None) -> DeviceInfo:
    """
    Waits for the registration identified by "auth_id" to complete and returns a DeviceInfo for the paired device using
    the GRPC protos for spacebridge.

    :param auth_id: the auth ID derived from the auth code of the registration
    :param encryption_context: the encryption context of the initiating party
    :param config: (Optional) a config to specify which Spacebridge hostname to use
    :param channel: (Optional) A custom channel for the grpc request

    :raises RegistrationTimeout: When Spacebridge responds to the long pull with anything other than a 200. The caller
                                 should retry this assuming the calling context still wants to wait for the
                                 registration to complete.
    :raises RegistrationError: When Spacebridge responds with an unexpected error from either the query for completion
                               API or the enable routing API. Inspect the "code" attribute of the returned exception
                               for more info.

    :returns: A DeviceInfo instance with relevant information about the newly registered client device.
    """
    config = config or SplunkConfig()

    channel = channel or get_grpc_channel(config)
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    response_pb = stub.QueryRegistration(request=ClientResultRequest(authId=auth_id),
                                         metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        if response_pb.error.code == HttpError.ERROR_TIMEOUT:
            raise RegistrationTimeout()

        raise RegistrationError(prefix="Application error during QueryRegistration",
                                code=response_pb.error.code,
                                message=response_pb.error.message)

    decrypted_payload = decrypt_for_receive(encryption_context.sodium_client,
                                            encryption_context.encrypt_public_key(),
                                            encryption_context.encrypt_private_key(),
                                            response_pb.registrarResult.encryptedRegistrarResult)

    registrar_result = RegistrarResult()
    registrar_result.ParseFromString(decrypted_payload)

    if registrar_result.HasField('error'):
        raise RegistrationError(prefix='Application error while confirming registration',
                                code=registrar_result.error.code,
                                message=registrar_result.error.message)

    device_info = DeviceInfo(
        encryption_public_key=registrar_result.confirmation.keyBundle.publicKeyForEncryption,
        signing_public_key=registrar_result.confirmation.keyBundle.publicKeyForSigning,
        name=registrar_result.confirmation.registrarInfo.name,
        app_id=registrar_result.confirmation.registrarInfo.typeId,
    )

    enable_routing(encryption_context, device_info.client_id(encryption_context), config, channel=channel)
    return device_info


def unregister_device(device_id: bytes, encryption_context: EncryptionContext,
                      config: SplunkConfig = None, channel = None):
    request = unregister.build_device_unregister_req(device_id, encryption_context)

    channel = channel or get_grpc_channel(config)
    stub = SessionStub(channel)

    response_pb = stub.unregisterClientPairing(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix="Application error during DeviceUnregistrationRequest",
                                code=response_pb.error.code,
                                message=response_pb.error.message)

    return response_pb


def delete_registration(auth_id: bytes, encryption_context: EncryptionContext,
                        config: SplunkConfig = None, channel = None):
    signature = crypto_sign_detached(auth_id,
                                     encryption_context.sign_private_key())
    request = DeleteClientRegistrationRequest(authId=auth_id, authIdSignature=signature)

    channel = channel or get_grpc_channel(config)
    stub = AuthenticationCodeRegistrationV2Stub(channel)

    response_pb = stub.DeleteClientRegistration(request=request, metadata=get_grpc_metadata(encryption_context))

    if response_pb.HasField('error'):
        raise RegistrationError(prefix="Application error during DeleteClientRegistration",
                                code=response_pb.error.code,
                                message=response_pb.error.message)

    return response_pb
