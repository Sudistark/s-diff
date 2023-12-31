"""
Helper module to find common object usages in app, e.g. xml node.
"""

import bs4
import re
import os
import json
from lxml import etree
from io import open
import pura_logger_manager as logger_manager

logging = logger_manager.setup_logging('jura_app_inspect_util')

class xml_node(object):
    """
    XML Node Definition
    """

    def __init__(self, name):
        self.name = name

def get_dashboard_nodes(xmlfiles):
    """
    Helper function to return SXML dashboard root nodes
    """
    findings = []
    try:
        for relative_filepath, full_filepath in xmlfiles:
            try:
                rootnode = etree.parse(full_filepath, parser=etree.XMLParser(recover=True))
                if (
                    rootnode.getroot().tag == "dashboard"
                    or rootnode.getroot().tag == "form"
                ):
                    findings.append((rootnode.getroot(), full_filepath))
            except Exception:
                logging.error("Exception occurred while getting dashboard nodes file: {}".format(full_filepath))
    except Exception as exception:
        logging.error("Exception while getting dashboard nodes: {}".format(exception))

    return findings


def get_imported_matches(file):
    """ Utility function that matches require js imports in a given file.

        @param
        file <String>: File path

        Returns
        matches <Array>: List of imports done by require statements

        Example:

        require(['jquery', 'underscore', 'splunkjs/mvc', 'util/console'], function ($, _, mvc, console) {
            // Do nothing
        })

        returns

        ['jquery', 'underscore', 'splunkjs/mvc', 'util/console']
    """
    try:
        matches = []
        pattern = re.compile(r"(^|[\n\r\s]+)(require|define)\([^)\]]+(\]|\))")
        for matched_object in pattern.finditer(file):
            try:
                imported_matches = re.finditer(r"['\"]([^'\"]*)['\"]", matched_object.group())
                for imported in imported_matches:
                    match = imported.group(1)
                    if match not in matches:
                        matches.append(match)
            except Exception:
                logging.error("Exception while getting imports")
        return matches
    except Exception:
        logging.error("Exception while getting imports")
        return []

def parse_static_match(match, prefix):
    """Utility function that parses a static file match into a require-style import.

    @param
    file <String>: Static file path

    @param
    prefix <String>: A prefix to the variable file path

    Returns
    matches <String>: Require-style import path

    Example:

    '/static/js/foo/bar.js'

    returns

    'foo/bar'
    """
    try:
        split_match = match.split("/static/{}/".format(prefix))
        match = split_match[1] if len(split_match) > 1 else None
        if match and "." in match:
            return ".".join(match.split(".")[:-1])
        return None
    except Exception:
        logging.error("Error while parsing static js match.")
        return None


def get_static_matches(file):
    """Utility function that matches static imports in a given file.

    @param
    file <String>: File path

    Returns
    matches <Array>: List of imports done by static loading

    Example:

    make_url('/static/js/foo/bar.js')
    make_url('/static/js/views/Base.js')
    <script src="/static/build/simplexml/index.js"></script>

    returns

    ['foo/bar', 'views/Base', 'simplexml/index']
    """
    try:
        matches = []
        pattern = re.compile(r"(\/static\/)[^\"|\']+")
        for matched_object in pattern.finditer(file):
            try:
                candiate = matched_object.group()
                match = parse_static_match(candiate, 'js')
                if match and match not in matches:
                    matches.append(match)
                match = parse_static_match(candiate, 'build')
                if match and match not in matches:
                    matches.append(match)
            except Exception:
                logging.error("Error wile getting static matches")
        return matches
    except Exception:
        logging.error("Error while getting static matches")
        return []
