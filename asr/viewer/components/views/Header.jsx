import React from 'react'
import Influx from 'react-influx'
import {ifcat} from '../../libs/utils'
import EntryStore from '../../stores/EntryStore'
import Dispatcher from '../../dispatchers/Dispatcher'
import Spinner from 'react-spinkit'
import _ from 'underscore';
import moment from 'moment';
import TimeSeries from './TimeSeries.jsx';
import DatePicker from 'react-datepicker'

import AceEditor from 'react-ace';
import brace from 'brace'
import 'brace/mode/json';
import 'brace/theme/monokai';

export default class Header extends Influx.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      search: {
        period: {}
      },
      selected: [],
      searchEnabled: false,
      startDate: moment(),
      endDate: moment()
    };

    this.search = {};
    this.text = null;
    this.expanded = true;
    this.isTyping = false;
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.UPDATED, this._onEntryStoreUpdated],
      [EntryStore, EntryStore.Events.UPDATED_SELECTED, this._onEntryStoreUpdatedSelected]
    ]
  }

  _onEntryStoreUpdated() {
    const search = {
      query: EntryStore.getSearchQuery(),
      options: EntryStore.getSearchOptions(),
      period: EntryStore.getSearchPeriod(),
      text: EntryStore.getSessionText()
    };

    if (!this.isTyping) {
      this.refs.input.value = search.text || '';
    }

    const startDate = moment(search.period.$gt);
    const endDate = moment(search.period.$lt).subtract(1, 'days');

    this.setState({search, searchEnabled: true, startDate, endDate});
    this.search = JSON.stringify(search);
  }

  _onEntryStoreUpdatedSelected() {
    const selected = EntryStore.getSelected();
    this.setState({selected});
    this.selected = JSON.stringify(selected);
  }

  _handleChange(key, data) {
    if (!this.state.searchEnabled) {
      return;
    }

    try {
      this.setState({search: {...this.state.search, [key]: JSON.parse(data)}})
    } catch (e) {
      console.error(e);
    }
  }

  _handleSearch() {
    try {
      const {query,options} = this.state.search;

      Dispatcher.emit(Dispatcher.Events.REQUEST_ENTRY_SEARCH, query, options);
    } catch (e) {
      console.error(e);
    }
  }

  _triggerTextSearch() {
    try {
      const {query, options, period} = this.state.search;
      Dispatcher.emit(Dispatcher.Events.REQUEST_ENTRY_SEARCH, query, options, period, this.text);
    } catch (e) {
      console.error(e);
    }
  }

  _handleTextSearch(text) {
    clearTimeout(this.triggerTid);
    this.text = text;
    this.isTyping = true;
    this.triggerTid = setTimeout(() => this._triggerTextSearch(), 400);
  }

  _handleDateChange({ startDate, endDate }) {
    startDate = startDate || this.state.startDate;
    endDate = endDate || this.state.endDate;

    if (startDate.isAfter(endDate)) {
      var temp = startDate;
      startDate = endDate;
      endDate = temp
    }

    // if (moment.duration(endDate.diff(startDate)).asDays() > 5) {
    //  startDate = moment(endDate).subtract(5, 'days');
    // }

    Dispatcher.emit(Dispatcher.Events.REQUEST_PERIOD, {
      $lt: endDate.add(1, 'days').startOf('day').toISOString(),
      $gt: startDate.startOf('day').toISOString()
    });

    this.setState({startDate, endDate})
  }

  _handleChangeStartDate(startDate) {
    this._handleDateChange({startDate})
  }

  _handleChangeEndDate(endDate) {
    this._handleDateChange({endDate})
  }

  componentDidMount() {
    super.componentDidMount();

    this._crushHeader();
  }

  _growHeader() {
    if (this.expanded) return;

    this.expanded = true;

    this.refs.root.style.minHeight = '245px';
    this.refs.root.style.maxHeight = '245px';

    this.refs.inside.style.minHeight = '125px';
    this.refs.inside.style.maxHeight = '125px';
    this.refs.inside.style.height = '125px';

    this.refs.arrow.classList.remove('rotate-down');

    clearTimeout(this.tid);
    this.tid = setTimeout(() => {
      this.refs.query.classList.remove('visibility-hidden');
      this.refs.select.classList.remove('visibility-hidden');
    }, 450);
  }

  _crushHeader() {
    if (!this.expanded) return;

    this.expanded = false;

    this.refs.query.classList.add('visibility-hidden');
    this.refs.select.classList.add('visibility-hidden');
    this.refs.arrow.classList.add('rotate-down');

    clearTimeout(this.tid);
    this.tid = setTimeout(() => {
      this.refs.root.style.minHeight = '170px';
      this.refs.root.style.maxHeight = '170px';

      this.refs.inside.style.minHeight = '50px';
      this.refs.inside.style.maxHeight = '50px';
      this.refs.inside.style.height = '50px';
    }, 450);
  }

  _toggleCrush() {
    if (this.expanded) {
      this._crushHeader();
    } else {
      this._growHeader();
    }
  }

  render() {
    const querystring = EntryStore.getQueryString({_id: {$in: this.state.selected}}, []);

    return (
      <div style={{minHeight: 245, overflow: 'hidden'}} ref='root' className='animate-height'>
        <div className='flex' style={{position: 'relative'}}>
          <input ref='input' style={{paddingRight: 40}} className='big-input' placeholder='Starting typing...'
                 onChange={e => this._handleTextSearch(e.target.value)}/>
          <span ref='arrow' className='animate-transform arrow-expand icon arrow' onClick={() => this._toggleCrush()}/>
        </div>
        <div ref='inside' className={ifcat('header animate-height', {hide:this.props.hide})} style={{padding:13}}>
          <div className="flex " ref="range">
            <div className="box">
              <div className='field flex'>
                <div className="name box">range</div>
                <div className="input box">
                  <div className='date-holder'>
                    <DatePicker
                      selected={this.state.startDate}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      onChange={a => this._handleChangeStartDate(a)}/>
                    <span className='date-to'>to</span>
                    <DatePicker
                      selected={this.state.endDate}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      onChange={a => this._handleChangeEndDate(a)}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex animate-visibility" style={{marginTop: 10}} ref="query">
            <div className="box" style={{marginRight:13}}>
              <div className='field flex'>
                <div className="name box">query</div>
                <div className="input box">
                  <AceEditor width="100%" showPrintMargin={false} showGutter={false} mode="json" height="100%"
                             highlightActiveLine={false} minLines={1} maxLines={1} name="query" theme="monokai"
                             onChange={this._handleChange.bind(this, 'query')}
                             value={JSON.stringify(this.state.search.query)} editorProps={{$blockScrolling: true}}/>
                </div>
              </div>
            </div>
            <div className="box" style={{marginRight:13}}>
              <div className='field flex'>
                <div className="name box">options</div>
                <div className="input box">
                  <AceEditor width="100%" showPrintMargin={false} showGutter={false} mode="json" height="100%"
                             highlightActiveLine={false} minLines={1} maxLines={1} name="options" theme="monokai"
                             onChange={this._handleChange.bind(this, 'options')}
                             value={JSON.stringify(this.state.search.options)} editorProps={{$blockScrolling: true}}/>
                </div>
              </div>
            </div>
            <div className="box" style={{maxWidth:100,position:'relative'}}>
              <div className={ifcat("button", {disabled: !this.state.searchEnabled})}
                   onClick={this._handleSearch.bind(this)}>
                { this.state.searchEnabled ? 'search' : <Spinner spinnerName='three-bounce'/> }
              </div>
            </div>
          </div>
          <div className="flex animate-visibility" style={{marginTop: 10}} ref="select">
            <div className="box" style={{marginRight:13}}>
              <div className='field flex readonly'>
                <div className="name box">SELECT</div>
                <div className="input box">
                  <AceEditor width="100%" showPrintMargin={false} showGutter={false} mode="json" height="100%"
                             highlightActiveLine={false} minLines={1} maxLines={1} name="selected" theme="monokai"
                             readOnly={true} value={JSON.stringify(this.state.selected)}
                             editorProps={{$blockScrolling: true}}/>
                </div>
              </div>
            </div>
            <div className="box" style={{maxWidth:100,position:'relative', marginRight:13}}>
              <a className='button' target="_blank" style={{background: '#4CAF50'}}
                 href={`#${querystring}`}>PERMALINK</a>
            </div>
            <div className="box" style={{maxWidth:100,position:'relative', marginRight:13}}>
              <div className='button' onClick={() => Dispatcher.emit(Dispatcher.Events.REQUEST_SELECT_ALL_ENTRIES)}>
                SELECT ALL
              </div>
            </div>
            <div className="box" style={{maxWidth:100,position:'relative'}}>
              <div className='button' onClick={() => Dispatcher.emit(Dispatcher.Events.REQUEST_SELECT_CLEAR_ENTRIES)}>
                CLEAR
              </div>
            </div>
          </div>
        </div>
        <TimeSeries />
      </div>
    );
  }
}