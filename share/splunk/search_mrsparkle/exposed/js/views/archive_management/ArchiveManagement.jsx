import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';
import TabLayout from '@splunk/react-ui/TabLayout';
import RestorePanel from './panels/Restore';
import ArchivePanel from './panels/Archive';

class ArchiveManagement extends Component {

    static propTypes = {
        learnMoreLink: PropTypes.string.isRequired,
        onFetchHistory: PropTypes.func.isRequired,
        onFetchArchive: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = { activePanelId: 'archive' };
    }

    handleChange = (e, data) => {
        this.setState({ activePanelId: data.activePanelId });
    };

    render() {
        return (
            <div>
                <TabLayout activePanelId={this.state.activePanelId} onChange={this.handleChange}>
                    <TabLayout.Panel label={_('Archive')} panelId="archive" style={{ margin: 20 }}>
                        <ArchivePanel
                            learnMoreLink={this.props.learnMoreLink}
                            onFetchArchive={this.props.onFetchArchive}
                        />
                    </TabLayout.Panel>
                    <TabLayout.Panel label={_('Restore')} panelId="restore" style={{ margin: 20 }}>
                        <RestorePanel
                            learnMoreLink={this.props.learnMoreLink}
                            onFetchHistory={this.props.onFetchHistory}
                        />
                    </TabLayout.Panel>
                </TabLayout>
            </div>
        );
    }
}

export default ArchiveManagement;
