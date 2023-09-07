import PropTypes from 'prop-types';
import BackboneAdapterBase from 'components/BackboneAdapterBase';
import ColumnView from 'views/shared/summarytable/resultsbody/Master';

class ColMaster extends BackboneAdapterBase {
    shouldComponentUpdate(nextProps) {
        if (nextProps.columnsAreDifferent || nextProps.model.dataSummaryJob.isDone()) {
            if (this.backboneView) {
                this.backboneView.model = {
                    dataset: nextProps.model.dataset,
                    column: nextProps.column,
                    resultJsonRows: nextProps.model.resultJsonRows,
                    state: nextProps.model.state,
                    summary: nextProps.model.summary,
                    timeline: nextProps.model.timeline,
                    dataSummaryJob: nextProps.model.dataSummaryJob,
                };
                this.backboneView.collection = nextProps.collection;
                this.backboneView.editingMode = nextProps.editingMode;
                this.backboneView.colIndex = nextProps.colIndex;
                this.backboneView.columnsAreDifferent = nextProps.columnsAreDifferent;
                this.backboneView.syncComplete = nextProps.syncComplete;
            }
            return true;
        }
        return false;
    }
    componentDidUpdate() {
        if (this.backboneView) {
            this.backboneView.render();
        }
    }
    getView() {
        return new ColumnView({
            model: {
                dataset: this.props.model.dataset,
                timeline: this.props.model.timeline,
                resultJsonRows: this.props.model.resultJsonRows,
                column: this.props.column,
                summary: this.props.model.summary,
                state: this.props.model.state,
                dataSummaryJob: this.props.model.dataSummaryJob,
            },
            colIndex: this.props.colIndex,
            editingMode: this.props.editingMode,
            columnsAreDifferent: this.props.columnsAreDifferent,
            syncComplete: this.props.syncComplete,
        }).activate({ deep: true });
    }
}

ColMaster.propTypes = {
    colIndex: PropTypes.number.isRequired,
    editingMode: PropTypes.bool,
    syncComplete: PropTypes.bool,
    columnsAreDifferent: PropTypes.bool,
    column: PropTypes.shape({}),
    model: PropTypes.shape({
        dataset: PropTypes.shape({}),
        resultJsonRows: PropTypes.shape({}),
        state: PropTypes.shape({}),
        summary: PropTypes.shape({}),
        timeline: PropTypes.shape({}),
        dataSummaryJob: PropTypes.shape({}),
    }),
    collection: PropTypes.shape({
        columns: PropTypes.shape({}),
    }),
};

ColMaster.defaultProps = {
    editingMode: false,
    syncComplete: false,
    columnsAreDifferent: false,
    column: {},
    model: PropTypes.shape({
        dataset: {},
        resultJsonRows: {},
        state: {},
        summary: {},
        timeline: {},
        dataSummaryJob: {},
    }),
    collection: {
        columns: {},
    },
};

export default ColMaster;
