import React from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import External from '@splunk/react-icons/External';

export default ({ label, href }) => {
    if (!label || !href) {
        return null;
    }
    const labelNode = (
        <React.Fragment>
            {label}
            <External
                style={{ marginLeft: '4px' }}
                screenReaderText={_('Open externally')}
                aria-label={null}
            />
        </React.Fragment>
    );
    return {
        label: labelNode,
        callback: () => {},
        props: {
            as: 'a',
            href,
            style: { textDecoration: 'none' },
            type: null,
            target: '_blank',
        },
    };
};
