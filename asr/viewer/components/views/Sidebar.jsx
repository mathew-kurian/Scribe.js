import React from 'react'
import Influx from 'react-influx'
import {ifcat} from '../../libs/utils'
import Dispatcher from '../../dispatchers/Dispatcher'
import EntryStore from '../../stores/EntryStore'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import _ from 'underscore'

export default class Sidebar extends Influx.Component {
  constructor(...args) {
    super(...args);

    this.state = {};
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.DATABASE_READY, this._onEntryStoreDatabaseReady],
      [Dispatcher, Dispatcher.Events.REQUEST_ENTRY_SEARCH, this._onDispatcherRequestEntrySearch]
    ]
  }

  _onEntryStoreDatabaseReady(selected) {
    const exposed = Object.keys(config.queries);
    if (!selected) {
      this._selectExpose(exposed[0], config.queries[exposed[0]]);
    }
  }

  _onDispatcherRequestEntrySearch(query, sort) {
    const _query = JSON.parse(JSON.stringify(query));
    delete _query.serialized;

    for (const [k, exposed] of Object.entries(config.queries)) {
      if (_.isEqual(_query, exposed.query)) {
        return this.setState({i: k});
      }
    }

    this.setState({i: undefined});
  }

  _selectExpose(i, expose) {
    this.setState({i});

    Dispatcher.emit(Dispatcher.Events.REQUEST_ENTRY_SEARCH, Object.assign({}, expose.query));
  }

  render() {
    const exposed = _.map(config.queries, (expose, i)=> {
      return <div key={i} className={ifcat('item', {selected: this.state.i === i})}
                  onClick={this._selectExpose.bind(this, i, expose, this.state.date)}>{expose.label}</div>;
    });


    exposed.push(<div key={'__custom__'} style={{cursor: 'default'}}
                      className={ifcat('item', {selected: !this.state.i})}>USER-DEFINED</div>);

    return (
      <div className={ifcat('sidebar box',{hide:this.props.hide})}>
        <div className="group">
          <a className="title" href={`${window.location.origin}${window.location.pathname}`}>Scribe.js</a>
          {exposed}
        </div>
      </div>
    );
  }
}