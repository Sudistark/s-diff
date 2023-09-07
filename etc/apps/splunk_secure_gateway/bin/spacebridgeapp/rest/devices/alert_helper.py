"""
Copyright (C) 2009-2021 Splunk Inc. All Rights Reserved.

Helper methods for mobile alerts.
"""
import logging
import os
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'
import warnings
from base64 import b64decode

from spacebridgeapp.dashboard.generate_dashboard import create_dashboard_description_table
from spacebridgeapp.dashboard.parse_search import get_string_field
from spacebridgeapp.data.dashboard_data import DashboardVisualizationId
from spacebridgeapp.request.dashboard_request_processor import fetch_dashboard_description, get_list_dashboard_data, \
    get_search_job_content, get_search_job_dashboard_data
from spacebridgeapp.search.input_token_support import set_default_token_values

warnings.filterwarnings('ignore', '.*service_identity.*', UserWarning)

from spacebridgeapp.util import py23


import jsonpickle
import json
import asyncio

from cloudgateway.device import EncryptionKeys
from cloudgateway.encryption_context import EncryptionContext
from cloudgateway.private.sodium_client.sharedlib_sodium_client import SodiumClient, SodiumOperationError
from http import HTTPStatus
from spacebridgeapp.util import constants
from spacebridgeapp.data.alert_data import CallToAction, Notification, Alert, Detail, RecipientDevice, ScopedSnooze
from spacebridgeapp.util.app_info import fetch_display_app_name
from spacebridgeapp.alerts import notifications
from spacebridgeapp.rest.services.kvstore_service import KVStoreCollectionAccessObject as KvStoreAccessor
from spacebridgeapp.messages.request_context import RequestContext
from spacebridgeapp.request.request_processor import SpacebridgeAuthHeader
from cloudgateway.private.encryption.encryption_handler import encrypt_for_send, sign_detached
from functools import partial
from spacebridgeapp.rest.devices.util import public_keys_for_device
from spacebridgeapp.exceptions.key_not_found_exception import KeyNotFoundError
from spacebridgeapp.exceptions.splunk_api_exceptions import EncryptionKeyError
from spacebridgeapp.util.constants import ALERT_MESSAGE, CONFIGURATION, ALERT_SUBJECT, SIGN_PUBLIC_KEY

from spacebridgeapp.rest.clients.async_kvstore_client import AsyncKvStoreClient
from spacebridgeapp.util.time_utils import get_current_timestamp


async def should_send(log: logging.Logger,
                      request_context: RequestContext,
                      async_kvstore_client: AsyncKvStoreClient,
                      notification: Notification,
                      device_id: str):
    """
    should_send determines if a notification should be sent to a particular device.
    If the alert is snoozed for that device, then we shouldn't send it.

    :param log:
    :param request_context: Context for authenticating with KVStore
    :param async_kvstore_client: Client to talk with KVStore
    :param notification: Notification which is going to be sent to the device
    :param device_id: ID of the device in question
    :return: True if the notification should be sent, else False
    """

    current_timestamp = str(get_current_timestamp())

    # First we will check for snoozing, and if the alert is snoozed, we will ignore it
    # Query fetches all snoozes with the correct device ID, and are not expired yet, i.e. end_time > now
    query = {constants.AND_OPERATOR: [{constants.DEVICE_ID: device_id},
                                      {constants.END_TIME: {constants.GREATER_THAN_OPERATOR: current_timestamp}}]}
    params = {constants.QUERY: json.dumps(query)}
    log.debug('Fetching scoped snoozes with params %s', params)

    snoozed_scopes = await async_kvstore_client.async_kvstore_get_request(
        collection=constants.SNOOZED_SCOPES_COLLECTION_NAME,
        auth_header=request_context.auth_header,
        params=params
    )
    if snoozed_scopes.code != HTTPStatus.OK:
        err_text = await snoozed_scopes.text()
        log.info('Failed to fetch snoozes while sending notifications with message %s', err_text)
        return True

    snoozed_scopes_json = await snoozed_scopes.json()
    for snoozed_scopes in snoozed_scopes_json:
        snoozed_scope = ScopedSnooze.from_json(snoozed_scopes)
        if snoozed_scope.scope == constants.SNOOZE_ALL_SCOPE:
            log.debug('Not sending notification as all alerts are snoozed for device with id %s', device_id)
            return False

    return True

async def send_push_notification(log: logging.Logger,
                                 request_context,
                                 notification,
                                 recipient_devices,
                                 async_kvstore_client,
                                 async_spacebridge_client,
                                 async_splunk_client):
    """
    Given a notification object and a list of device ids, sends a post request to the Spacebridge notif API
    for each device id
    :param log:
    :param request_context:
    :param notification: notification object to be sent
    :param recipient_devices: list of device id strings
    :param async_kvstore_client: AsyncKVStoreClient
    :param async_spacebridge_client: AsyncSpacebridgeClient
    :param async_splunk_client: AsyncSpacebridgeClient
    :return:
    """

    sodium_client = SodiumClient(log.getChild('sodium_client'))
    deployment_info = await async_splunk_client.async_get_deployment_info(request_context.auth_header)

    # fetch sign public key from deployment info endpoint
    if deployment_info.code == HTTPStatus.OK:
        response = await deployment_info.json()
        sign_public_key = b64decode(response.get(SIGN_PUBLIC_KEY, ""))
        encryption_keys = EncryptionKeys(sign_public_key, None, None, None)
        encryption_context = EncryptionContext(encryption_keys)

    else:
        error = await deployment_info.text()
        log.exception("Unable to fetch signing public key with error_code=%s", str(deployment_info.code))
        raise EncryptionKeyError(error, deployment_info.code)


    sender_id = encryption_context.sign_public_key(transform=encryption_context.generichash_raw)
    sender_id_hex = py23.encode_hex_str(sender_id)

    headers = {'Content-Type': 'application/x-protobuf', 'Authorization': sender_id_hex}
    async_sign_payload = partial(async_splunk_client.sign_payload, request_context.auth_header)

    successes = []
    exceptions = []

    for device_id_str in recipient_devices:
        log.debug(f'Attempting to send push notification to device={device_id_str}')
        device_id = device_id_str.encode('utf-8')
        device_id_raw = b64decode(device_id)

        try:
            if not await should_send(log, request_context, async_kvstore_client, notification, device_id_str):
                continue
            _, receiver_encrypt_public_key = await public_keys_for_device(device_id_raw,
                                                                          request_context.auth_header,
                                                                          async_kvstore_client)

            encryptor = partial(encrypt_for_send,
                                sodium_client,
                                receiver_encrypt_public_key)

            notification_request = await notifications.async_build_notification_request(log,
                                                                            device_id, device_id_raw, sender_id,
                                                                            notification,
                                                                            encryptor, async_sign_payload)

            # Send post request asynchronously
            r = await async_spacebridge_client.async_send_notification_request(
                auth_header=SpacebridgeAuthHeader(sender_id),
                data=notification_request.SerializeToString(),
                headers=headers)
            successes.append({"Recipient device id": device_id_str, "Status": r.code })

        except KeyNotFoundError:
            log.info("Public key not found for device_id=%s", device_id)
            exceptions.append({"Recipient device id": device_id_str, "Response": r.code})

        except SodiumOperationError:
            log.warning("Sodium operation failed! device_id=%s", device_id)
            exceptions.append({"Recipient device id": device_id_str, "Response": r.code})
        except Exception as e:
            log.exception(f'unexpected error when sending push notification for device_id={device_id}')
            exceptions.append({"Recipient device id": device_id_str, "Response": r.code})

    log.info("Finished sending push notifications with responses=%s", str(successes))

    if exceptions:
        log.error("Encountered exceptions sending pushing notifications to devices=%s", str(exceptions))

    return [successes, exceptions]


