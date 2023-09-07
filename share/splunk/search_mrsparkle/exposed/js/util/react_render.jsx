import React from 'react';
import ReactDOM from 'react-dom';
import { getReactUITheme, ThemeProvider } from 'util/theme_utils';

/*
@param  reactEl <Object (React element)>: React element to be rendered.
@param  container <Object (DOM element)>: Parent element which the created element
        is added as a child to.
@return <function>: Callback function which can be used to unmount the rendered component.
*/
export default (reactEl, container) => {
    ReactDOM.render(
        React.createElement(ThemeProvider, { theme: getReactUITheme() }, reactEl),
        container,
    );
    return () => ReactDOM.unmountComponentAtNode(container);
};
