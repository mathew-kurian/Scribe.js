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

    this.state = {date: moment().startOf('day')};
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.DATABASE_READY, this._onEntryStoreDatabaseReady],
      [Dispatcher, Dispatcher.Events.REQUEST_ENTRY_SEARCH, this._onDispatcherRequestEntrySearch]
    ]
  }

  _onEntryStoreDatabaseReady() {
    const exposed = Object.keys(config.exposed);
    this._selectExpose(exposed[0], config.exposed[exposed[0]]);
  }

  _onDispatcherRequestEntrySearch(query, sort) {
    const {expose} = query;
    for (const [k, exposed] of Object.entries(config.exposed)) {
      if (_.isEqual(exposed.query.expose, expose)) {
        return this.setState({label: exposed.label});
      }
    }

    this.setState({label: undefined});
  }

  _selectExpose(i, expose, date = this.state.date) {
    this.setState({i});
    Dispatcher.emit(Dispatcher.Events.REQUEST_ENTRY_SEARCH,
        Object.assign({}, expose.query, {date: this._getRange(date)}));
  }

  _getRange(date = moment()) {
    const today = moment(date).startOf('day');
    const tomorrow = moment(today).add(1, 'days');

    return {$gte: today.toISOString(), $lt: tomorrow.toISOString()};
  }

  _selectDate(date) {
    const query = EntryStore.getSearchQuery();
    this.setState({date});
    Dispatcher.emit(Dispatcher.Events.REQUEST_ENTRY_SEARCH,
        Object.assign({}, query, {date: this._getRange(date)}));
  }

  render() {

    const exposed = _.map(config.exposed, (expose, i)=> {
      return <div key={i} className={ifcat('item', {selected:this.state.i === i})}
                  onClick={this._selectExpose.bind(this, i, expose, this.state.date)}>{expose.label}</div>;
    });

    return (
        <div className={ifcat('sidebar box',{hide:this.props.hide})}>
          <div className="group">
            <div className="title">Exposed <DatePicker onChange={this._selectDate.bind(this)}
                                                       selected={this.state.date}/>
            </div>
            {exposed}
          </div>
        </div>
    );
  }
}