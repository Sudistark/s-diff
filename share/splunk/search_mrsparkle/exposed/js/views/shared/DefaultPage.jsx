import React from 'react';
import PropTypes from 'prop-types';
import pageViewSingleton from 'views/PageViewSingleton';
import { createTestHook } from 'util/test_support';

/*
This is an interim work around as we transition from an inheritance architecture
to a compositional architecture. See SPL-186763 for more information.
*/
const DefaultPage = (props) => {
    if (pageViewSingleton.getPageView()) {
        if (!props.showAppNav) {
            pageViewSingleton.pageView.children.appBar.remove();
        }
    }
    return (<div {...createTestHook(module.id)}>{props.children}</div>);
};
DefaultPage.propTypes = {
    children: PropTypes.element.isRequired,
    showAppNav: PropTypes.bool,
};
DefaultPage.defaultProps = {
    showAppNav: true,
};

export default DefaultPage;