import React, { Component } from 'react';
import Backbone from 'backbone';
import PropTypes from 'prop-types';
import CardLayout from '@splunk/react-ui/CardLayout';
import Card from '@splunk/react-ui/Card';
import ColContent from 'views/shared/summarytable/resultsbody/ColMaster';
import { createTestHook } from 'util/test_support';
import ColHeader from './SummaryCardHeader';

class SummaryCardsLayout extends Component {
    shouldComponentUpdate(nextProps) {
        if (nextProps.columnsAreDifferent || nextProps.model.dataSummaryJob.isDone()) {
            return true;
        }
        return false;
    }
    render() {
        const { model, collection, options, columnsAreDifferent, syncComplete } = this.props;
        const cardStyle = { height: 400, margin: '0 20px 20px 0', border: 'none' };
        return (
            <CardLayout
                alignCards={'left'}
                wrapCards
                cardWidth={300}
                style={{ marginTop: '15px' }}
                {...createTestHook(module.id)}
            >
                {
                    collection.columns.map((col, i) => (
                        <Card
                            style={cardStyle}
                            key={col.get('id')}
                        >
                            <Card.Header style={{ padding: '0px', height: '9%' }}>
                                <ColHeader
                                    column={col}
                                    colIndex={i}
                                    model={model}
                                    collection={collection}
                                    options={options}
                                    columnsAreDifferent={columnsAreDifferent}
                                    syncComplete={syncComplete}
                                />
                            </Card.Header>
                            <Card.Body className={'card-body'} style={{ padding: '0px', height: '90%' }}>
                                <ColContent
                                    column={col}
                                    model={model}
                                    editingMode={options.editingMode}
                                    colIndex={i}
                                    columnsAreDifferent={columnsAreDifferent}
                                    syncComplete={syncComplete}
                                />
                            </Card.Body>
                        </Card>
                    ))
                }
            </CardLayout>
        );
    }
}

SummaryCardsLayout.propTypes = {
    model: PropTypes.shape({
        dataset: PropTypes.instanceOf(Backbone.Model),
        resultJsonRows: PropTypes.instanceOf(Backbone.Model),
        state: PropTypes.instanceOf(Backbone.Model),
        summary: PropTypes.instanceOf(Backbone.Model),
        ast: PropTypes.instanceOf(Backbone.Model),
        timeline: PropTypes.instanceOf(Backbone.Model),
        dataSummaryJob: PropTypes.instanceOf(Backbone.Model),
    }),
    collection: PropTypes.shape({
        columns: PropTypes.instanceOf(Backbone.Collection),
    }),
    options: PropTypes.shape({
        editingMode: PropTypes.bool,
    }),
    columnsAreDifferent: PropTypes.bool,
    syncComplete: PropTypes.bool,
};

SummaryCardsLayout.defaultProps = {
    model: PropTypes.shape({
        dataset: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        resultJsonRows: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        state: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        summary: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        ast: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        timeline: new Backbone.Model({
            content: new Backbone.Model(),
        }),
        dataSummaryJob: new Backbone.Model({
            content: new Backbone.Model(),
        }),
    }),
    collection: {
        columns: [],
    },
    options: {
        editingMode: false,
    },
    columnsAreDifferent: false,
    syncComplete: false,
};

export default SummaryCardsLayout;