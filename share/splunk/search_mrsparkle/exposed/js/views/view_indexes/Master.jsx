import React from 'react';
import PropTypes from 'prop-types';
import DefaultPage from 'views/shared/DefaultPage';
import View from 'views/view_indexes/View';

const Master = (props) => {
    // Stateless component that set defaultPage config and renders main view
    const pageConfig = { showAppNav: false };

    return (
        <DefaultPage {...pageConfig}>
            <View {...props} />
        </DefaultPage>
    );
};
Master.propTypes = {
    entity: PropTypes.string.isRequired,
    entityType: PropTypes.oneOf(['users', 'roles']).isRequired,
};

export default Master;