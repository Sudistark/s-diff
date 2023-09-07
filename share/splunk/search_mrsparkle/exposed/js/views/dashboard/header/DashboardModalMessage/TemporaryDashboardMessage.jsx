import React from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import styled from 'styled-components';
import P from '@splunk/react-ui/Paragraph';
import Link from '@splunk/react-ui/Link';
import { setURLFlag } from 'util/url_parser';

const StyledMessage = styled.div`
    width: 400px;
`;

export default function () {
    const updatedDashboardURL = setURLFlag(location.href, 'xmlv', '1.1', false);
    return (
        <StyledMessage>
            <P style={{ marginBottom: 0 }}>
                {_('This dashboard view is deprecated and will be removed in future versions of Splunk software.')}
                {' '}
                <Link openInNewContext to={updatedDashboardURL}>
                    {_('Open the updated view of this dashboard.')}
                </Link>
            </P>
        </StyledMessage>
    );
}
