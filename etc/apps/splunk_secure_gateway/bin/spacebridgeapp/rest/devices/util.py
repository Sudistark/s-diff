"""
Copyright (C) 2009-2021 Splunk Inc. All Rights Reserved.

Utilities for devices handlers
"""

import base64
from http import HTTPStatus
from spacebridgeapp.util import py23
from spacebridgeapp.util.constants import DEVICE_PUBLIC_KEYS_COLLECTION_NAME
from spacebridgeapp.exceptions.key_not_found_exception import KeyNotFoundError


__public_key_cache = {}


async def public_keys_for_device(device_id, auth_header, async_kvstore_client):
    """
    Fetch the public keys for a given device, which can be then used to verify signatures or encrypt messages before
    sending.
    :param device_id: An un-encoded device id of the device
    :param auth_header: A valid splunk header, e.g. SplunkAuthHeader, BasicAuthHeader or JWTAuthHeader
    :param async_kvstore_client: AsyncKvStoreClient
    :return: A tuple of (signing_public_key, encryption_public_key), un-encoded
    """

    key_id = py23.urlsafe_b64encode_to_str(device_id)

    if key_id in __public_key_cache:
        return __public_key_cache[key_id]

    response = await async_kvstore_client.async_kvstore_get_request(DEVICE_PUBLIC_KEYS_COLLECTION_NAME,
                                                                    auth_header=auth_header,
                                                                    key_id=key_id)

    if response.code == HTTPStatus.OK:
        parsed = await response.json()
        result = (
            base64.b64decode(parsed['sign_public_key']),
            base64.b64decode(parsed['encrypt_public_key']))

        __public_key_cache[key_id] = result
        return result
    else:
        raise KeyNotFoundError(key_id, response.code)

