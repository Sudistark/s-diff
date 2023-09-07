#   Version 8.2.11.2
#
############################################################################
# OVERVIEW
############################################################################
# This file contains descriptions of Splunk Web features used to configure
# Splunk Enterprise. You can use the settings to configure Splunk Web features.
# These features are replicated in a search head cluster environment.
#
# Each stanza controls a different web feature.
#
# For more information on configuration files, including precedence, search for
# "Use Splunk Web to manage configuration files" in the Admin Manual in the Splunk Docs.

[feature:ui_prefs_optimizations]

optimize_ui_prefs_performance = <boolean>
* Determines whether or not Splunk Web will optimize performance of the API related to ui-prefs.conf.
* DEPRECATED.
* CAUTION: Do not change this setting.
* A value of "false" means that Splunk Web will not optimize performance of the API related to ui-prefs.
* Default: true
