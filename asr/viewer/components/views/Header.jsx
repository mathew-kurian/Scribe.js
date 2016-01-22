import React from 'react'
import Influx from 'react-influx'
import {ifcat} from '../../libs/utils'
import EntryStore from '../../stores/EntryStore'
import Dispatcher from '../../dispatchers/Dispatcher'
import Spinner from 'react-spinkit'

import AceEditor from 'react-ace';
import brace from 'brace'
import 'brace/mode/json';
import 'brace/theme/monokai';

export default class Header extends Influx.Component {
  constructor(...args) {
    super(...args);
    this.state = {search: {}, searchEnabled: false};
    this.search = {};
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.UPDATED, this._onEntryStoreUpdated],
      [Dispatcher, Dispatcher.Events.REQUEST_ENTRY_SEARCH, this._onDispatcherRequestEntrySearch]
    ]
  }

  _onEntryStoreUpdated() {
    const search = {query: EntryStore.getSearchQuery(), options: EntryStore.getSearchOptions()};
    this.setState({search, searchEnabled: true});
    this.search = JSON.stringify(search);
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
      Dispatcher.emit(Dispatcher.Events.REQUEST_ENTRY_SEARCH, query, options, true);
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return (
        <div className="header" style={{padding:13}}>
          <div className="flex">
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
                             highlightActiveLine={false} minLines={1} maxLines={1} name="sort" theme="monokai"
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
        </div>
    );
  }
}