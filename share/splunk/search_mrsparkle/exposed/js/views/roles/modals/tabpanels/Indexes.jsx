import React from 'react';
import PropTypes from 'prop-types';
import P from '@splunk/react-ui/Paragraph';
import Text from '@splunk/react-ui/Text';
import Heading from '@splunk/react-ui/Heading';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import { _ } from '@splunk/ui-utils/i18n';
import { sprintf } from '@splunk/ui-utils/format';
import 'views/roles/Roles.pcss';
import IndexesTable from './tables/IndexesTable';

const Indexes = props => (
    <div>
        <Heading style={{ margin: '0px' }}>{_('Wildcards')}</Heading>
        <P>{_('Instead of selecting individual indexes, you can create a Wildcard' +
          ' Index to dynamically capture all indexes that match the Wildcard. After you add ' +
          'a Wildcard Index, it appears in the Indexes table. Wildcard Indexes are limited to this role.')}</P>
        <div style={{ marginBottom: '10px' }}>
            <Text
                style={{ display: 'inline-block', marginRight: '10px', width: '300px' }}
                placeholder={_('Enter a value that contains "*"')}
                data-test-name="create-wildcard-text"
                onChange={props.handleWildcardTextChange}
                value={props.wildcardText}
            />
            <Button
                label={_('Add')}
                appearance="primary"
                style={{ textAlign: 'right' }}
                onClick={props.handleAddWildcard}
                data-test-name="create-wildcard-btn"
            />
        </div>
        <Heading style={{ margin: '0px' }}>{_('Indexes')}</Heading>
        <P className="roles-tableHelpText" data-test-name="index-table-help-text">
            {_('Enable both the "Included" and "Default" checkboxes for an index to make that index ' +
            'searchable by default for this role. You must save this role before you can see its inherited wildcards.')}
        </P>
        { props.wildcardSuccess.length > 0 &&
            <Message data-test-name="wildcard-success-msg" type="success" fill>
                {sprintf(_('Wildcard "%(wildcardName)s" was successfully added to the Indexes Table.'),
                    { wildcardName: props.wildcardSuccess })}
            </Message>
        }
        <IndexesTable
            filterValue={props.filterValue}
            handleIndexFiltering={props.handleIndexFiltering}
            menuSelected={props.menuSelected}
            indexes={props.indexes}
            handleIndexesToggle={props.handleIndexesToggle}
        />
    </div>
);

Indexes.propTypes = {
    indexes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    handleIndexesToggle: PropTypes.func.isRequired,
    handleIndexFiltering: PropTypes.func.isRequired,
    menuSelected: PropTypes.string.isRequired,
    filterValue: PropTypes.string.isRequired,
    wildcardText: PropTypes.string.isRequired,
    handleAddWildcard: PropTypes.func.isRequired,
    handleWildcardTextChange: PropTypes.func.isRequired,
    wildcardSuccess: PropTypes.string.isRequired,
};

export default Indexes;
