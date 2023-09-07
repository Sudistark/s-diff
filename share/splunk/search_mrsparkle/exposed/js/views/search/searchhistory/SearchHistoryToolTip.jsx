import React from 'react';
import _ from 'underscore';
import util from 'splunk.util';
import { createTestHook } from 'util/test_support';
import Tooltip from '@splunk/react-ui/Tooltip';

function SearchHistoryToolTip() {
    const toolTipText = util.isMacPlatform() ? {
        toggleText: _('You can toggle through past searches in the search bar').t(),
        nextText: _('Next: CTRL + N').t(),
        previousText: _('Previous: CTRL + P').t(),
    } : {
        toggleText: _('You can toggle through past searches in the search bar').t(),
        nextText: _('Next: Alt + N').t(),
        previousText: _('Previous: Alt + P').t(),
    };

    return (
        <Tooltip
            {...createTestHook(module.id)}
            content={
                <div className="command-history-tooltip-text" style={{ textAlign: 'center' }}>
                    <div>{toolTipText.toggleText}</div>
                    <div>{toolTipText.previousText}</div>
                    <div>{toolTipText.nextText}</div>
                </div>
        }
        />
    );
}

export default SearchHistoryToolTip;