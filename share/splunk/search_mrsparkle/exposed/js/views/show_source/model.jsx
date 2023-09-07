/* eslint no-underscore-dangle:0 camelcase:0 */
import React from 'react';
import PropTypes from 'prop-types';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { defaultFetchInit } from '@splunk/splunk-utils/fetch';
import { stringify } from 'querystring';
import ShowSource from 'views/show_source';

function Preload() {
    return (<div className="preload">
        <div id="placeholder-splunk-bar">
            <a href="/en-US/" className="brand" title="splunk &gt; listen to your data">splunk<strong>&gt;</strong></a>
        </div>
        <div id="placeholder-app-bar" />
        <div id="placeholder-main-section-body">
                Loading...
                </div>
    </div>);
}

export default class ShowSourceModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: undefined,
            count: 0,
            eof: false,
        };
    }

    componentDidMount() {
        this.countChange(this.props.count);
    }

    fetchEvents({ offset, sid, count, latest_time, max_lines_constraint }) {
        const searchParams = {
            output_mode: 'json',
            field_list: '_raw,target,MSG_TYPE,MSG_CONTENT,_decoration',
            surrounding: '1',
            show_empty_fields: true,
            offset: parseInt(offset, 10),
            latest_time: latest_time || 0,
            count,
            max_lines: max_lines_constraint || 500,
            time_format: '%Y-%m-%dT%H:%M:%S%z',
            output_time_format: '%Y-%m-%dT%H:%M:%S.%Q%z',
        };

        const url = createRESTURL(`search/jobs/${sid}/events`);
        const query = stringify(searchParams);
        fetch(`${url}?${query}`, defaultFetchInit)
            .then(result => result.json())
            .then((results) => {
                const events = results.results.map(event => ({ value: event._raw,
                    isTarget: !!event.target,
                    isGap: event._decoration === 'showsourceGap',
                    isInValid: event._decoration === 'showsourceInvalid',
                    MSG_CONTENT: event.MSG_CONTENT,
                }));
                this.setState({
                    events,
                });
            });
    }

    countChange = (count) => {
        const { sid, offset, max_lines_constraint, latest_time } = this.props;
        this.fetchEvents({ offset, count, sid, max_lines_constraint, latest_time });
        this.setState({ count });
    }

    render() {
        const { events, count } = this.state;
        if (events === undefined) {
            return (<Preload />);
        }
        return (<ShowSource {...this.props} count={count} events={events} onCountChange={this.countChange} />);
    }
}

ShowSourceModel.propTypes = {
    offset: PropTypes.number,
    count: PropTypes.number,
    max_lines_constraint: PropTypes.number,
    latest_time: PropTypes.number,
    sid: PropTypes.textStrings,

};

ShowSourceModel.defaultProps = {
    offset: 0,
    count: 50,
    max_lines_constraint: 500,
    latest_time: undefined,
    sid: undefined,

};