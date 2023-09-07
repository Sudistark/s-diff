# This is an example script for archiving cold buckets. It must be modified
# to suit your individual needs, and we highly recommend testing this on a
# non-production instance before deploying it.

import sys, os, gzip, shutil, subprocess, random

### CHANGE THIS TO YOUR ACTUAL ARCHIVE DIRECTORY!!!
ARCHIVE_DIR = os.path.join(os.getenv('SPLUNK_HOME'), 'frozenarchive')

# For new style buckets (v4.2+), we can remove all files except for the rawdata.
# We can later rebuild all metadata and tsidx files with "splunk rebuild"
def handleNewBucket(base, files):
    print('Archiving bucket: ' + base)
    for f in files:
        full = os.path.join(base, f)
        if os.path.isfile(full):
            os.remove(full)

# For buckets created before 4.2, simply gzip the tsidx files
# To thaw these buckets, be sure to first unzip the tsidx files
def handleOldBucket(base, files):
    print('Archiving old-style bucket: ' + base)
    for f in files:
        full = os.path.join(base, f)
        if os.path.isfile(full) and (f.endswith('.tsidx') or f.endswith('.data')):
            fin = open(full, 'rb')
            fout = gzip.open(full + '.gz', 'wb')
            fout.writelines(fin)
            fout.close()
            fin.close()
            os.remove(full)

# This function is not called, but serves as an example of how to do
# the previous "flatfile" style export. This method is still not
# recommended as it is resource intensive
def handleOldFlatfileExport(base, files):
    command = ['exporttool', base, os.path.join(base, 'index.export'), 'meta::all']
    retcode = subprocess.call(command)
    if retcode != 0:
        sys.exit('exporttool failed with return code: ' + str(retcode))

    for f in files:
        full = os.path.join(base, f)
        if os.path.isfile(full):
            os.remove(full)
        elif os.path.isdir(full):
            shutil.rmtree(full)
        else:
            print('Warning: found irregular bucket file: ' + full)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit('usage: python coldToFrozenExample.py <bucket_dir_to_archive> [--search-files-required]')

    if not os.path.isdir(ARCHIVE_DIR):
        try:
            os.mkdir(ARCHIVE_DIR)
        except OSError:
            # Ignore already exists errors, another concurrent invokation may have already created this dir
            sys.stderr.write("mkdir warning: Directory '" + ARCHIVE_DIR + "' already exists\n")

    bucket = sys.argv[1]
    if not os.path.isdir(bucket):
        sys.exit('Given bucket is not a valid directory: ' + bucket)

    ##
    # Whether search files are required to be preserved for this bucket ("False" if not present)
    #
    # Search Files are required for bucket that doesn't have any usable rawdata. For instance, "metric"
    # type buckets that have rawdata journal files stubbed-out, DO NOT contain a usable journal file,
    # and hence must have their search files preserved for data recovery.
    #
    # For more details, look at "metric.stubOutRawdataJournal" config in indexes.conf.spec
    ##
    searchFilesRequired = False
    if len(sys.argv) > 2:
        if '--search-files-required' in sys.argv[2:]:
            searchFilesRequired = True

    rawdatadir = os.path.join(bucket, 'rawdata')
    if not os.path.isdir(rawdatadir):
        sys.exit('No rawdata directory, given bucket is likely invalid: ' + bucket)

    files = os.listdir(bucket)
    journal = os.path.join(rawdatadir, 'journal.gz')
    if os.path.isfile(journal):
        if not searchFilesRequired:
            handleNewBucket(bucket, files)
        else:
            print('Info: Argument "--search-files-required" is specified. Skipping deletion of search files !')
    else:
        handleOldBucket(bucket, files)

    if bucket.endswith('/'):
        bucket = bucket[:-1]

    indexname = os.path.basename(os.path.dirname(os.path.dirname(bucket)))
    destdir = os.path.join(ARCHIVE_DIR, indexname, os.path.basename(bucket))

    while os.path.isdir(destdir):
        print('Warning: This bucket already exists in the archive directory')
        print('Adding a random extension to this directory...')
        destdir += '.' + str(random.randrange(10))

    shutil.copytree(bucket, destdir)
