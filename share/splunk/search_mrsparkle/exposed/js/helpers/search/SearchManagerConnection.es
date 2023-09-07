import _ from 'underscore';
import Backbone from 'backbone';

/**
 *
 * @class SearchManagerConnection
 */
class SearchManagerConnection {
    /**
     * Creates an instance of SearchManagerConnection.
     * @param {helpers.search.DataSource} dataSource
     * @param {splunkjs.mvc.searchmanager} searchManager
     * @param {object} options
     *
     * @memberof SearchManagerConnection
     */
    constructor(dataSource, searchManager, options = {}) {
        _.extend(this, Backbone.Events);
        this.dataSource = dataSource;
        this.manager = searchManager;
        this.options = options;
    }
    connect() {
        this.disconnect();
        this.resultsModel = this.manager.data(
            this.options.data || 'preview',
            this.dataSource.getFetchParams());
        this.listenTo(this.resultsModel, 'data', this.onDataChange);
        this.listenTo(this.resultsModel, 'nodata', this.onDataClear);
        this.listenTo(this.resultsModel, 'error', this.onSearchError);
        this.listenTo(this.dataSource, 'fetchParamsChange', this.onFetchParamsChange);
    }
    disconnect() {
        this.stopListening();
        if (this.resultsModel) {
            this.resultsModel.destroy();
            this.resultsModel = null;
        }
    }
    isConnected() {
        return this.resultsModel != null;
    }
    /**
     * Move data from results model into data sources
     * @memberof SearchManagerConnection
     */
    onDataChange() {
        /* eslint-disable no-underscore-dangle */
        // SPL-190832: We have to check the parent job to see if postprocess search is done
        let isDone = false;
        if (this.manager._job) {
            isDone = this.manager._job.isDone();
        } else if (this.manager.parent && this.manager.parent._job) {
            isDone = this.manager.parent._job.isDone();
        }

        let data = Object.assign({}, this.resultsModel.data(), {
            meta: {
                done: isDone,
            },
        });
        if (this.options.formatter && _.isFunction(this.options.formatter)) {
            data = this.options.formatter(data);
        }
        this.dataSource.setSearchResults(data);
    }
    onDataClear() {
        this.dataSource.clearSearchResults();
    }
    onSearchError(text, err) {
        this.trigger('error', text, err);
    }
    onFetchParamsChange() {
        if (this.resultsModel) {
            this.resultsModel.set(this.dataSource.getFetchParams());
        }
    }
}

export default SearchManagerConnection;
