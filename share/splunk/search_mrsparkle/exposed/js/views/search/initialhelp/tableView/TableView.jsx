import React from 'react';
import PropTypes from 'prop-types';
import Heading from '@splunk/react-ui/Heading';
import Button from '@splunk/react-ui/Button';
import styled from 'styled-components';
import P from '@splunk/react-ui/Paragraph';
import Link from '@splunk/react-ui/Link';
import { _ } from '@splunk/ui-utils/i18n';
import SplunkUtil from 'splunk.util';
import { createTestHook } from 'util/test_support';
import css from '../../Master.pcss';

const TableView = (props) => {
    const StyledP = styled(P)`
        color: ${css.successText};
        font-weight: bold;
        display: inline-block;
        padding-left: 20px;
        `;
    const topic = _('Analyze Your Data with Table Views');
    const sendTelemetry = () => {
        SplunkUtil.trackEvent({
            type: 'tableUi.interact',
            data: {
                action: 'search_blob_create_table_view',
                location: 'search page',
            },
        });
    };
    return (
        <div {...createTestHook(module.id)}>
            <Heading
                data-test-name="table-view-blob-heading"
                style={{ display: 'inline-block' }}
            >
                {topic}
            </Heading>
            {props.options.showNewLabel && (<StyledP data-test="new-label">{_('New!')}</StyledP>)}
            <div className="table-view-intro">
                <div className="flex-column" data-test-name="table-blob-col1">
                    <P>
                        <strong>{_('Table Views ')}</strong>
                        {_('let you prepare data without using SPL. First, use a point-and-click ' +
                            'interface to select data. Then, clean and transform it for analysis ' +
                            'in Analytics Workspace, Search, or Pivot!')}
                    </P>
                    <P>
                        <Link
                            data-test-name="learn-more-dataset"
                            openInNewContext
                            to={props.options.helpLink}
                        >
                            {_('Learn more')}
                        </Link>
                        {_(' about Table Views, or view and manage your Table Views with the ')}
                        <Link to={props.options.datasetListing}>{_('Datasets listing page.')}</Link>
                    </P>
                </div>
                <div className="flex-column" style={{ padding: '0 40px' }} data-test-name="table-blob-col3">
                    <Button
                        data-test-name="create-table-button"
                        label={_('Create Table View')}
                        appearance="primary"
                        to={props.options.createTableLink}
                        onClick={sendTelemetry}
                    />
                </div>
            </div>
        </div>
    );
};

TableView.propTypes = {
    options: PropTypes.shape({
        helpLink: PropTypes.string,
        datasetListing: PropTypes.string,
        createTableLink: PropTypes.string,
        showNewLabel: PropTypes.boolean,
    }),
};

TableView.defaultProps = {
    options: {
        helpLink: '',
        datasetListing: '',
        createTableLink: '',
        showNewLabel: false,
    },
};

export default TableView;