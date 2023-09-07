import sys
import boto3
import base64
from datetime import datetime

if __name__ == "__main__":

    # check parameters
    if len(sys.argv) < 10:
        sys.exit('missing arguments')
    arg_src_bucket_name = sys.argv[1]
    arg_src_rawdata_path = sys.argv[2]
    arg_uploader_guid = sys.argv[3]
    arg_cipher_blob = sys.argv[4]
    arg_dest_bucket_name = sys.argv[5]
    arg_dest_bucket_folder = sys.argv[6]
    arg_index_name = sys.argv[7]
    arg_local_bucket_path = sys.argv[8]
    arg_region = sys.argv[9]

    sys.stdout.write(str(datetime.now().strftime('%H:%M:%S.%f')) + ':start')

    # get plain text key from kms
    cipher_blob = arg_cipher_blob
    guid_context = arg_uploader_guid
    plaintext = ''
    try:
        kms_client = boto3.client('kms', arg_region)
        kms_response = kms_client.decrypt(CiphertextBlob=b"%s" % base64.b64decode(cipher_blob), EncryptionContext={'guid': guid_context})
        plaintext = kms_response["Plaintext"]
    except Exception as exc:
        sys.exit('failed to get customer key from cipher blob: src_rawdata_path=' + arg_src_rawdata_path + ' exception =' + str(exc))
    else:
        sys.stdout.write(' ' + str(datetime.now().strftime('%H:%M:%S.%f')) + ':get_key')

    # copy journal and deletes to destination bucket
    s3_client = boto3.client('s3', region_name=arg_region)
    key_list = []
    file_path = arg_index_name + '/' + arg_local_bucket_path + '/'
    if arg_dest_bucket_folder:
        file_path = arg_dest_bucket_folder + '/' + file_path

    try:
        list_result = s3_client.list_objects(Bucket=arg_src_bucket_name,
                                             Prefix=arg_src_rawdata_path)
        for r in list_result['Contents']:
            if not r['Key'].endswith('/') and ('rawdata/journal' in r['Key'] or 'rawdata/deletes' in r['Key']):
                key_list.append(r['Key'])

        for key in key_list:
            old_source = {'Bucket': arg_src_bucket_name, 'Key': key}
            idx = key.rfind('rawdata/')
            new_key = file_path + key[idx:]

            extra_args = {'ACL':  'bucket-owner-full-control',
                          'CopySourceSSECustomerAlgorithm': 'AES256',
                          'CopySourceSSECustomerKey':  plaintext
                          }
            response = s3_client.copy(old_source, arg_dest_bucket_name, new_key, ExtraArgs=extra_args)

    except Exception as exc:
        sys.exit('failed to transfer raw data to self storage: src_rawdata_path=' + arg_src_rawdata_path + ' lastKey=' + new_key + ' exception=' + str(exc))
    else:
        sys.stdout.write(' ' + str(datetime.now().strftime('%H:%M:%S.%f')) + ':complete_transfer')

