import os
import re
import sys
import json
import time
import six
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
# from pura_libs_utils import six
from builtins import str
import pura_storage_utils

logging = logger_manager.setup_logging('pura_dismiss_app')

if sys.platform == "win32":
    import msvcrt

    # Binary mode is required for persistent mode on Windows.
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stderr.fileno(), os.O_BINARY)


class DismissAppHandler(PersistentServerConnectionApplication):
    """
    This is a REST handler base-class that makes implementing a REST handler easier.

    This works by resolving a name based on the path in the HTTP request and calls it.
    This class will look for a function that includes the HTTP verb followed by the path.abs

    For example, if a GET request is made to the endpoint is executed with the path /dismiss_app,
    then this class will attempt to run a function named get_dismiss_app().
    Note that the root path of the REST handler is removed. If a POST request is made to the endpoint
    is executed with the path /dismiss_app, then this class will attempt to execute post_dismiss_app().
    """

    def __init__(self, command_line, command_arg):
        PersistentServerConnectionApplication.__init__(self)

    @classmethod
    def get_function_signature(cls, method, path):
        """
        Get the function that should be called based on path and request method.

        :param cls: class
        :param method: type of call (get/post)
        :param path: the rest endpoint for which method is to be called

        :return name of the function to be called
        """

        return 'post_dismiss_app'

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
            self.user = args['session']['user']
            self.host = args['server']['hostname']

            # Get the method
            method = args['method']

            # Get the path and the args
            if 'rest_path' in args:
                path = args['rest_path']
            else:
                return utils.render_error_json(MESSAGE_NO_PATH_PROVIDED, 403)

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
                return function_to_call(request_body)
            else:
                logging.warn("A request could not be executed since the associated function is missing, name={}"
                             .format(function_name))
                return utils.render_error_json(MESSAGE_PATH_NOT_FOUND, 404)

        except Exception as exception:
            logging.exception(MESSAGE_FAILED_HANDLE_REQUEST)
            return utils.render_error_json(str(exception))

    def post_dismiss_app(self, query_params):
        """
        Write dismiss app entry in KV store for given parameters.

        :param query_params: Dict of parameters

        :return JSON response for dismiss file call
        """

        if 'app' not in query_params or not query_params['app']:
            logging.error(MESSAGE_DISMISS_APP_READ_ERROR)
            return utils.render_error_json(MESSAGE_DISMISS_APP_READ_ERROR, 404)
        if 'app_path' not in query_params or not query_params['app_path']:
            logging.error(MESSAGE_DISMISS_APP_PATH_READ_ERROR)
            return utils.render_error_json(MESSAGE_DISMISS_APP_PATH_READ_ERROR, 404)

        query_params['timestamp'] = str(int(time.time()))
        status, message = self.write_entry(query_params)

        if not status:
            return utils.render_error_json(message)
        logging.info(message)
        return utils.render_msg_json(message)

    def write_entry(self, entry):
        """
        Write entry for given parameters.

        :param entry: Dict of parameters

        :return status (True/False), message
        """

        entry.update({
            'host': self.host,
            'user': self.user,
            'app': entry['app'],
            'app_path': entry['app_path']
        })
        file_details = pura_storage_utils.create_dirs_if_not_exists(pra_dismiss_app_collection, self.user, self.host)
        response = pura_storage_utils.add(file_details["file_path"], entry)
        if not response:
            logging.error(MESSAGE_ERROR_WRITING_DISMISS_APP_ENTRY.format(self.user, self.host))
            return False, MESSAGE_ERROR_WRITING_DISMISS_APP_ENTRY.format(self.user, self.host)

        return True, MESSAGE_DISMISS_APP_ENTRY_SUCCESS.format(entry['app'], self.user, self.host)
