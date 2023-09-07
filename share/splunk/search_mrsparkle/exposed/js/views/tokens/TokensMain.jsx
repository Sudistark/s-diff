import Main from '@splunk/base-lister/Main';
import { defaultFetchInit, handleResponse, handleError } from '@splunk/splunk-utils/fetch';
import { _ } from '@splunk/ui-utils/i18n';
import { sprintf } from '@splunk/ui-utils/format';
import { debounce } from 'lodash';
import querystring from 'querystring';
import PropTypes from 'prop-types';

class TokensMain extends Main {
    static propTypes = {
        ...Main.propTypes,
        checkTokenAuth: PropTypes.func.isRequired,
        setWarning: PropTypes.func.isRequired,
    };

    /**
     * Overwritting handleRefreshListing to check for token auth status before fetching items.
     */
    handleRefreshListing = (newData) => {
        this.props.checkTokenAuth();
        this.setState({
            fetchingCollection: true,
            fetchingCount: true,
            selectedRows: [],
            errorMessage: '',
        });
        this.handleRefreshListingInternal(newData);
    };

    handleRefreshListingInternal = debounce((newData) => {
        const collectionData = this.props.getObjectsCollectionFetchData(this.state, newData);

        if (typeof this.fetchCount === 'function') {
            this.fetchCount(newData);
        }

        const collectionURL = `${this.props.objectsCollectionPath}`;
        fetch(`${collectionURL}?${querystring.stringify(collectionData)}`, defaultFetchInit)
            .then(handleResponse(200))
            .then((data) => {
                const newState = {
                    objects: data.entry ? data.entry : data,
                    fetchingCollection: false,
                };
                if (data.paging) {
                    newState.objectsCount = data.paging.total;
                    newState.fetchingCount = false;
                }
                if (data.messages) {
                    for (let i = 0; i < data.messages.length; i += 1) {
                        if (data.messages[i].text.includes('Unable to fill user info for tokenId')) {
                            this.props.setWarning(_('Unable to supply user information for some tokens. Failed ' +
                                                    'to retrieve one or more external users from any configured ' +
                                                    'servers. Review splunkd.log for details.'));
                            break;
                        }
                    }
                }
                this.setState(newState);
            })
            .catch(handleError(
                sprintf(
                    _('Fetch %s collection failed.'),
                    this.props.objectNamePlural.toLowerCase(),
                    ),
                ),
            )
            .catch((response) => {
                this.setState({
                    errorModalOpen: true,
                    errorMessage: response.message,
                });
            });
    }, 500);
}

export default TokensMain;
