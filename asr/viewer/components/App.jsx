import React from 'react'
import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher'
import EntryStore from '../stores/EntryStore'
import Entry from './views/Entry.jsx'
import Header from './views/Header.jsx'
import Sidebar from './views/Sidebar.jsx'
import ReactList from 'react-list';
import querystring from 'querystring'

class ReactListTracked extends ReactList {
  constructor(...args) {
    super(...args);

    this._triggerTimeSeriesBound = this._triggerTimeSeries.bind(this);
    this.session = null;
  }

  componentDidUpdate() {
    super.componentDidUpdate();

    this._triggerTimeSeries();
  }

  _triggerTimeSeries() {
    const [first] = this.getVisibleRange();

    if (this.props.entries[first]) {
      Dispatcher.emit(Dispatcher.Events.REQUEST_TIMESERIES_DATE, this.props.entries[first].date);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    this.scrollParent.removeEventListener("scroll", this._triggerTimeSeriesBound);
  }

  componentDidMount() {
    super.componentDidMount();

    this.scrollParent.addEventListener("scroll", this._triggerTimeSeriesBound);

    window.document.body.style.background = config.background;
  }
}

class App extends Influx.Component {
  constructor(...args) {
    super(...args);

    const params = querystring.parse(location.search.substring(1));
    this.state = {entries: [], hideSidebar: params.hideSidebar, hideHeader: params.hideHeader};
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.DATABASE_READY, this._onEntryStoreDatabaseReady],
      [EntryStore, EntryStore.Events.UPDATED, this._onEntryStoreUpdated]
    ]
  }

  _onEntryStoreUpdated() {
    const session = EntryStore.getSessionId();
    if (this.session !== session) {
      this.lastLength = null;
      this.session = session;
    }

    this.setState({entries: EntryStore.getSearchResults()});
  }

  _onEntryStoreDatabaseReady() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_INIT_SOCKET);
  }

  componentDidUpdate() {
    const {entries} = this.state;
  }

  componentDidMount() {
    super.componentDidMount();

    Dispatcher.emit(Dispatcher.Events.REQUEST_INIT_DATABASE);
  }

  render() {
    const {entries} = this.state;
    const length = entries.length;
    const maxLineChars = String(length).length + 2;

    const rowRenderer = (i, key) => {
      const entry = this.state.entries[i];
      if (i + 1 === length && this.lastLength !== length) {
        Dispatcher.emit(Dispatcher.Events.REQUEST_GROW_SEARCH);
        Dispatcher.emit(Dispatcher.Events.REQUEST_TIMESERIES_DATE, entry.date);

        this.lastLength = length;
      }

      return <Entry key={key} lines={length} line={i + 1} maxLineChars={maxLineChars}
                    entry={entry}/>
    };

    return (
      <div className="full flex">
        <Sidebar hide={this.state.hideSidebar}/>
        <div className='full box'>
          <div className='full-abs'>
            <div className="full flex vertical" style={{overflow:'hidden'}}>
              <Header hide={this.state.hideHeader}/>
              <div className="momentum" style={{overflow:'scroll',overflowX:'hidden',paddingTop:10}}>
                <ReactListTracked entries={entries} ref='list' useTranslate3d={true} length={length}
                                  itemRenderer={rowRenderer}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App