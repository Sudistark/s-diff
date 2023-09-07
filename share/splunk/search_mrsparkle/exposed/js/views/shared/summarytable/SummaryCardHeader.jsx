import PropTypes from 'prop-types';
import BackboneAdapterBase from 'components/BackboneAdapterBase';
import TableHeaderView from 'views/shared/summarytable/TableHeader';

class SummaryCardHeader extends BackboneAdapterBase {
    shouldComponentUpdate(nextProps) {
        if (nextProps.columnsAreDifferent || nextProps.syncComplete) {
            if (this.backboneView) {
                this.backboneView.model = {
                    dataset: nextProps.model.dataset,
                    column: nextProps.column,
                    resultJsonRows: nextProps.model.resultJsonRows,
                    state: nextProps.model.state,
                    summary: nextProps.model.summary,
                    ast: nextProps.model.ast,
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
        return new TableHeaderView({
            model: {
                dataset: this.props.model.dataset,
                column: this.props.column,
                resultJsonRows: this.props.model.resultJsonRows,
                state: this.props.model.state,
                summary: this.props.model.summary,
                ast: this.props.model.ast,
            },
            collection: {
                columns: this.props.collection.columns,
            },
            editingMode: this.props.options.editingMode,
            colIndex: this.props.colIndex,
            columnsAreDifferent: this.props.columnsAreDifferent,
            syncComplete: this.props.syncComplete,
        }).activate({ deep: true });
    }
}

SummaryCardHeader.propTypes = {
    colIndex: PropTypes.number.isRequired,
    editingMode: PropTypes.bool,
    column: PropTypes.shape({}),
    model: PropTypes.shape({
        dataset: PropTypes.shape({}),
        resultJsonRows: PropTypes.shape({}),
        state: PropTypes.shape({}),
        summary: PropTypes.shape({}),
        ast: PropTypes.shape({}),
    }),
    collection: PropTypes.shape({
        columns: PropTypes.shape({}),
    }),
};

SummaryCardHeader.defaultProps = {
    editingMode: false,
    column: {},
    model: PropTypes.shape({
        dataset: {},
        resultJsonRows: {},
        state: {},
        summary: {},
        ast: {},
    }),
    collection: {
        columns: {},
    },
};

export default SummaryCardHeader;

