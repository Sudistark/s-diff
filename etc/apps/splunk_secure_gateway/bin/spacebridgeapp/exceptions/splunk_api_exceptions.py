"""Copyright (C) 2009-2021 Splunk Inc. All Rights Reserved."""
class EncryptionKeyError(Exception):
    def __init__(self, message, http_code):
        self.message = "Unable to retrieve encryption keys with error={}".format(message)
        self.http_code = http_code

    def __str__(self):
        return "status=%s %s" % (self.http_code, self.message)

class HTTPException(Exception):
    def __init__(self, message, status):
        self.message = f"HTTP Exception with error message={message}"
        self.status = status

    def __str__(self):
        return f"{self.message}, status={self.status}"
