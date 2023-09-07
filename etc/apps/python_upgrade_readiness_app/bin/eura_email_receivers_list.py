import os
import re
import sys
import json
import time
from urllib import request
import splunk.rest as sr
from splunk.persistconn.application import PersistentServerConnectionApplication

if sys.version_info.major == 2:
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'libs_py2'))
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'libs_py2', 'pura_libs_utils'))
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
elif sys.version_info.major == 3:
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'libs_py3'))
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'libs_py3', 'pura_libs_utils'))
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

from pura_libs_utils import pura_logger_manager as logger_manager
from pura_libs_utils.pura_consts import *
from pura_libs_utils import pura_utils as utils

logging = logger_manager.setup_logging('eura_email_receivers_list')

if sys.platform == "win32":
    import msvcrt
    # Binary mode is required for persistent mode on Windows.
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stderr.fileno(), os.O_BINARY)


class ReceiversListHandler(PersistentServerConnectionApplication):
    """
    This is a REST handler base-class that makes implementing a REST handler easier.

    This works by resolving a name based on the path in the HTTP request and calls it.
    This class will look for a function that includes the HTTP verb followed by the path.abs
    """

    def __init__(self, command_line, command_arg):
        PersistentServerConnectionApplication.__init__(self)

    @classmethod
    def get_function_signature(cls, method, path):
        """
        Get the function that should be called based on path and request method.

        :param cls: class
        :param method: type of call (get/post/delete)
        :param path: the rest endpoint for which method is to be called

        :return name of the function to be called
        """

        if len(path) > 0:
            components = path.split("eura")
            path = components[1]
            return method + re.sub(r'[^a-zA-Z0-9_]', '_', path).lower()
        else:
            return method

    def handle(self, in_string):
        """
        Handler function to call when REST endpoint is hit and process the call

        :param in_string: string of arguments

        :return Result of REST call
        """
        try:
            logging.info("Handling a request")

            # Parse the arguments
            args = utils.parse_in_string(in_string)

            # Get the user information
            self.session_key = args['session']['authtoken']

            # Get the method
            method = args['method']

            # Get the path and the args
            if 'rest_path' in args:
                path = args['rest_path']
            else:
                return utils.render_error_json(MESSAGE_NO_PATH_PROVIDED, 403)
            
            if method.lower() == "post":
                # Get the request body
                if 'payload' in args:
                    request_body = json.loads(args['payload'])
                else:
                    return utils.render_error_json(MESSAGE_NO_REQUEST_BODY, 400)

            # Get the function signature
            function_name = self.get_function_signature(method, path)

            try:
                function_to_call = getattr(self, function_name)
            except AttributeError:
                function_to_call = None

            # Try to run the function
            if function_to_call is not None:
                logging.info("Executing function, name={}".format(function_name))
                # Execute the function
                if method.lower() == "post":
                    return function_to_call(request_body)
                elif method.lower() == "get":
                    return function_to_call()
            else:
                logging.warn("A request could not be executed since the associated function is missing, name={}"
                             .format(function_name))
                return utils.render_error_json(MESSAGE_PATH_NOT_FOUND, 404)

        except Exception as exception:
            logging.exception(MESSAGE_FAILED_HANDLE_REQUEST)
            return utils.render_error_json(str(exception))

    def get_email_receivers_list(self):
        logging.info("Retrieving email receivers list")
        try:
            try:
                response, content = sr.simpleRequest('{}?output_mode=json&count=0'.format(user_role_endpoint),
                                                                sessionKey=self.session_key)
            except Exception as e:
                logging.exception(str(e))
                return []

            try:
                kvstore_response, kvstore_content = sr.simpleRequest('{}?output_mode=json'.format(era_email_receivers_list_endpoint),
                                            sessionKey=self.session_key, method='GET',
                                            raiseAllErrors=True)  
            except Exception as e:
                logging.exception(str(e))
                return []

            if response['status'] not in success_codes:
                logging.error("Error fetching receivers {}".format(response))
                return []

            if kvstore_response['status'] not in success_codes:
                logging.error("Error fetching receivers from kv_store {}".format(kvstore_response))
                return []

            content_json = json.loads(content)
            kvstore_content_json = json.loads(kvstore_content)
            receivers_list = []
            for user in content_json.get("entry", []):
                user_content = user.get("content", {})
                user_roles = user_content.get("roles", [])
                is_user_locked_out = user_content.get("locked-out", False)
                if (
                    (("admin" in user_roles) or ("sc_admin" in user_roles)) and
                    (not is_user_locked_out) and (user_content.get("email", "")) and
                    (user_content.get("email") not in EXCLUDE_EMAILS)
                ):
                    for kvstore_user in kvstore_content_json:
                        if user["name"] == kvstore_user["name"]:
                            receivers_list.append({"name": user.get("name", ""), "email": user_content.get("email", ""), "roles": user_roles, "selected": kvstore_user["selected"]})
                            break
                    else:
                        receivers_list.append({"name": user.get("name", ""), "email": user_content.get("email", ""), "roles": user_roles, "selected": True})
                    
            response = {"receivers_list": receivers_list}
            return utils.render_json(response)
        
        except Exception as e:
            logging.exception("Exception while fetching the receiver list {}".format(str(e)))
            return []

    def post_email_receivers_list(self, request_body):
        utils.delete_kvstore_details(self.session_key, era_email_receivers_list_endpoint)
        for item in request_body['receivers_list']:
            try:
                response, _ = sr.simpleRequest('{}?output_mode=json'.format(era_email_receivers_list_endpoint),
                                           sessionKey=self.session_key, jsonargs=json.dumps(item), method='POST',
                                           raiseAllErrors=True)
            except Exception: 
                logging.exception("Exception while writing email receivers list entry")
                return utils.render_msg_json("Exception while writing email receivers list entry")

            if response['status'] not in success_codes:
                logging.error("Error writing email receivers list entry")
                return utils.render_msg_json("Error writing email receivers list entry")
            
        logging.info("Email receivers list updated successfully.")
        return utils.render_msg_json("Email receivers list updated successfully.")

