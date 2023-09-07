define(
    [
    'module',
    'views/Base',
    'underscore',
    'contrib/text!views/deploymentserver/ClientsSummary.html',
    'splunk.i18n'
    ],
        function(
            module,
            BaseView,
            _,
            clientsSummaryTemplate,
            i18n
            ) {
          return  BaseView.extend({
            moduleId: module.id,
            template: clientsSummaryTemplate,
            render: function() {
                var html = this.compiledTemplate({_:_});
                this.$el.html(html);

                // Phoned home clients in the last 24 hours
                var numClients = 0;
                if (this.collection.phonedHomeClients.length > 0) {
                    numClients = this.collection.phonedHomeClients.first().paging.get('total');
                    this.$('#phonedHomeLabel').html(i18n.ungettext("Client", "Clients", numClients));
                }
                this.$('#numPhonedHomeClients').html(numClients);

                // Clients which have deployment errors
                var numErrorClients = 0;
                if (this.collection.deploymentErrorClients.length > 0) {
                    numErrorClients = this.collection.deploymentErrorClients.first().paging.get('total');
                    this.$('#errorClientsLabel').html(i18n.ungettext("Client", "Clients", numErrorClients));
                }
                this.$('#numClientsWithDeploymentErrors').html(numErrorClients);
                if (numErrorClients > 0){
                    this.$('#error_alert_symbol').show();
                } else {
                    this.$('#error_alert_symbol').hide();
                }

                // Number of downloads in the last hour
                var numDownloads = "N/A";
                if (this.collection.recentDownloadClients.length > 0) {
                    numDownloads = this.collection.recentDownloadClients.first().entry.content.get('count');
                    this.$('#downloadsLabel').html(i18n.ungettext("Total download", "Total downloads", numDownloads));
                }
                this.$('#numDownloadsInLastHour').html(numDownloads);

                return this;
            }
        });
});
