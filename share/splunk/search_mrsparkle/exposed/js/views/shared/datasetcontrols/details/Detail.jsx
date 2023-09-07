import Backbone from 'backbone';
import PropTypes from 'prop-types';
import BackboneAdapterBase from 'components/BackboneAdapterBase';
import MoreInfo from 'views/datasets/results/table/MoreInfo';

export default class Detail extends BackboneAdapterBase {
    getView() {
        return new MoreInfo({
            showInitially: true, // show the info
            model: {
                dataset: this.props.model.dataset,
                application: this.props.model.application,
                searchJob: this.props.model.searchJob,
                user: this.props.model.user,
                appLocal: this.props.model.appLocal,
                serverInfo: this.props.model.serverInfo,
            },
            collection: {
                roles: this.props.collection.roles,
            },
        });
    }
}

Detail.propTypes = {
    model: PropTypes.shape({
        dataset: PropTypes.shape({}),
        application: PropTypes.shape({}),
        searchJob: PropTypes.shape({}),
        user: PropTypes.shape({}),
        appLocal: PropTypes.shape({}),
        serverInfo: PropTypes.shape({}),
    }),
    collection: PropTypes.shape({
        roles: PropTypes.shape({}),
    }),
};

Detail.defaultProps = {
    model: {
        dataset: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        application: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        searchJob: new Backbone.Model({}),
        user: new Backbone.Model({}),
        appLocal: new Backbone.Model({}),
        serverInfo: new Backbone.Model({}),
    },
    collection: {
        roles: new Backbone.Model({}),
    },
};