import React from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import styled from 'styled-components';
import InfoButtonModal from './InfoButtonModal';
import TemporaryDashboardMessage from './TemporaryDashboardMessage';

const StyledContainer = styled.div`
    display: inline-block;
    padding: 5px 14px;
`;

export default () => (
    <StyledContainer data-test="dashboard-modal-message">
        <InfoButtonModal dialogTitle={_('This dashboard view is temporary')}>
            <TemporaryDashboardMessage />
        </InfoButtonModal>
    </StyledContainer>
);
