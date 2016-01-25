import React from 'react'
import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher'
import EntryStore from '../stores/EntryStore'
import Entry from './views/Entry.jsx'
import Header from './views/Header.jsx'
import Sidebar from './views/Sidebar.jsx'
import ReactList from 'react-list';
import querystring from 'querystring'

class App extends Influx.Component {
  constructor(...args) {
    super(...args);

    const params = querystring.parse(location.search.substring(1));
    this.state = {entries: [], hideSidebar: params.hideSidebar, hideHeader: params.hideSidebar};
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.DATABASE_READY, this._onEntryStoreDatabaseReady],
      [EntryStore, EntryStore.Events.UPDATED, this._onEntryStoreUpdated]
    ]
  }

  _onEntryStoreUpdated() {
    this.setState({entries: EntryStore.getSearchResults()});
  }

  _onEntryStoreDatabaseReady() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_INIT_SOCKET);
  }

  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_INIT_DATABASE);
  }

  render() {
    const {entries} = this.state;
    const length = entries.length;
    const maxLineChars = String(length).length + 3;

    const rowRenderer = (i, key) => {
      return <Entry key={key} lines={length} line={length - i} maxLineChars={maxLineChars}
                    entry={this.state.entries[i]}/>
    };


    return (
        <div className="full flex">
          <Sidebar hide={this.state.hideSidebar}/>
            <div className='full box'>
            <div className='full-abs'>
              <div className="full flex vertical" style={{overflow:'hidden'}}>
                <Header hide={this.state.hideHeader}/>
                <div style={{overflow:'scroll',overflowX:'hidden',paddingTop:10}}>
                  <ReactList useTranslate3d={true} length={length} itemRenderer={rowRenderer}/>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default App