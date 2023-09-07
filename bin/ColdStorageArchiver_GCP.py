import sys
import json
import os
import base64
import time
from google.cloud import storage
from google.cloud import datastore
from google.cloud import kms

import splunk.conf_util

SPLUNK_HOME_PATH = os.environ.get('SPLUNK_HOME', '/opt/splunk')
DATA_ARCHIVE_CONF_PATH = os.path.join(SPLUNK_HOME_PATH, 'etc', 'slave-apps', '_cluster_admin', 'local', 'data_archive.conf')
ARCHIVAL_BUCKET_OPTION_NAME = 'archive'
STACK_ID_OPTION_NAME = 'prefix'

if __name__ == "__main__":
    # check parameters
    if len(sys.argv) < 14:
        sys.exit('missing arguments')

    #required params
    arg_index_name   = sys.argv[1]
    arg_bucket_path  = sys.argv[2]
    arg_remote_path  = sys.argv[3]
    arg_bucket_id    = sys.argv[4]
    arg_bucket_size  = sys.argv[5]
    arg_start_time   = sys.argv[6]
    arg_end_time     = sys.argv[7]
    arg_bucket_name  = sys.argv[8]
    arg_receipt_path = sys.argv[9]

    arg_project_id   = sys.argv[10]
    arg_key_locations= sys.argv[11]
    arg_key_ring     = sys.argv[12]
    arg_key          = sys.argv[13]


    if not os.path.exists(DATA_ARCHIVE_CONF_PATH):
        sys.exit('data_archive.conf not found at required path=' + DATA_ARCHIVE_CONF_PATH)

    archival_bucket_name = splunk.conf_util.ConfigMap(DATA_ARCHIVE_CONF_PATH)['buckets'][ARCHIVAL_BUCKET_OPTION_NAME]
    arg_table_name = splunk.conf_util.ConfigMap(DATA_ARCHIVE_CONF_PATH)['buckets'][STACK_ID_OPTION_NAME] + '_BUCKET_HISTORY'

    # get file list and encryption info from receipt.json
    if not os.path.exists(arg_receipt_path):
        sys.exit('failed to locate updated receipt.json: BucketId=' + arg_bucket_id)

    fileList = ''
    cipher_blob = ''
    guid_context = ''
    rawSize = ''
    try:
        with open(arg_receipt_path) as json_data:
            data = json.load(json_data)
            fileList = data["objects"]
            cipher_blob = str(data["user_data"]["cipher_blob"])
            guid_context = str(data["user_data"]["uploader_guid"])
            rawSize = data["manifest"]["raw_size"]
    except Exception as exc:
        sys.exit('failed to get info from receipt.json: BucketId=' + arg_bucket_id + '; exception =' + str(exc))

    plaintext = ''
    try:
        kms_client = kms.KeyManagementServiceClient()
        key_name = kms_client.crypto_key_path(arg_project_id, arg_key_locations, arg_key_ring, arg_key)
        uploader = 'guid:' + guid_context
        decrypt_request = kms.DecryptRequest(name=key_name, ciphertext=base64.b64decode(cipher_blob), additional_authenticated_data=uploader.encode())
        decrypt_response = kms_client.decrypt(decrypt_request)
        plaintext = decrypt_response.plaintext
    except Exception as exc:
        sys.exit('failed to get customer key from receipt.json: BucketId=' + arg_bucket_id + '; exception =' + str(exc))

    # copy data files in the bucket to staging folder, skip receipt.json
    storage_client = storage.Client()

    old_prefix = arg_remote_path
    new_prefix = ''
    try:
        s = old_prefix.split('/', 1)
        new_prefix = s[0] + '/'  + s[1]
    except Exception as exc:
        sys.exit('failed to get staging path from bucket path: ' + arg_remote_path + '; exception =' + str(exc))

    src_bucket = storage_client.bucket(arg_bucket_name)
    dst_bucket = storage_client.bucket(archival_bucket_name)

    try:
        for file in fileList:
            if file['size'] == 0:
                continue
            cur_file = file['name'][1:]
            cur_key = old_prefix + cur_file
            new_key = new_prefix + cur_file

            src_blob = src_bucket.blob(cur_key, encryption_key=plaintext)
            des_blob = dst_bucket.blob(new_key, encryption_key=plaintext)

            rewrite_token = None
            while True:
                rewrite_token, bytes_rewritten, total_bytes = des_blob.rewrite(src_blob, token=rewrite_token)
                if rewrite_token is None:
                    break
    except Exception as exc:
        sys.exit('failed to copy bucket to archival bucket: BucketId=' + arg_bucket_id + '; exception =' + str(exc))
    else:
        sys.stdout.write('successfully copied bucket to archival bucket; ')

    # upload receipt.json with restore flag
    try:
        receipt_key = new_prefix + '/receipt.json'
        receipt_blob = dst_bucket.blob(receipt_key)
        receipt_blob.upload_from_filename(arg_receipt_path)
    except Exception as exc:
        sys.exit('failed to copy updated receipt.json to archival bucket: BucketId=' + arg_bucket_id + '; exception =' + str(exc))
    else:
        sys.stdout.write('successfully uploaded receipt.json to archival bucket; ')


    # write bucket info to table
    cur_time = str(int(time.time())).zfill(10)
    start_time = arg_start_time.zfill(10)

    try:
        datastore_client = datastore.Client()
        key = datastore_client.key(arg_table_name, str(arg_index_name + "--" + start_time + "_" + arg_bucket_id))
        new_bucket = datastore.Entity(key=key, exclude_from_indexes=['BucketPath', 'RemoteBucketPath', 'FileList',
                                                             'BucketSize', 'RawSize', 'StartTime', 'BucketId'])

        new_bucket.update({
                          'IndexName' : arg_index_name,
                          'BucketPath': arg_bucket_path,
                          'RemoteBucketPath': arg_remote_path,
                          'BucketId'  : arg_bucket_id,
                          'StartTime' : int(arg_start_time),
                          'EndTime'   : int(arg_end_time),
                          'BucketSize': int(arg_bucket_size),
                          'FileList'  : json.dumps(fileList),
                          'RawSize'   : int(rawSize),
                          'ArchiveTimeWithBucketID': cur_time + "_" + arg_bucket_id,
                          'BucketTimeSpan': int(arg_end_time) - int(arg_start_time)
                          })
        datastore_client.put(new_bucket)
    except Exception as exc:
        sys.exit('failed to write bucket info to bucket history table: BucketId=' + arg_bucket_id + '; exception =' + str(exc))
    else:
        sys.stdout.write('successfully wrote bucket info to bucket history table')
