import Influx from 'react-influx'
import keyMirror from 'keymirror'
import Dispatcher from '../dispatchers/Dispatcher'
import * as JSON2 from '../../../libs/JSON2'

const Events = keyMirror({
  DATABASE_READY: null,
  SOCKET_READY: null,
  UPDATED: null
});

class EntryStore extends Influx.Store {
  constructor(...args) {
    super(Dispatcher/*,  additional dispatchers you have */);
    this.data = {entries: [], search: [], history: {}, options: {sort: {date: -1}}};
  }

  getSearchResults() {
    return this.data.search;
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.REQUEST_INIT_DATABASE, this._onDispatcherRequestInitDatabase],
      [Dispatcher, Dispatcher.Events.REQUEST_INIT_SOCKET, this._onDispatcherRequestInitSocket],
      [Dispatcher, Dispatcher.Events.REQUEST_ENTRY_SEARCH, this._onDispatcherRequestEntrySearch]
    ]
  }

  _onDispatcherRequestInitDatabase() {
    db.Entry.find({}).fetch(() => this.emit(Events.DATABASE_READY));
  }

  _onDispatcherRequestInitSocket() {
    (config.socketUris || []).map(socketUri => {
      this.socket = io(socketUri);
      this.socket.on('data', data => {
        db.localDb.Entry.upsert(data, () => {
          this.searchEntries(this.data.query, this.getSearchOptions());
        });
      });
    });

    this.emit(Events.SOCKET_READY);
  }

  _onDispatcherRequestEntrySearch(query, options) {
    this.searchEntries(query, options);
  }

  getSearchQuery() {
    return this.data.query;
  }

  getSearchOptions() {
    return this.data.options;
  }

  emit(...args) {
    setTimeout(() => super.emit(...args), 0);
  }

  searchEntries(query = {}, options = this.data.options, remote = false) {
    this.data.query = query;
    this.data.options = options;
    
    const searchLocal = ()=> {
      db.localDb.Entry.find(query, Object.assign({}, options)).fetch(entries => {
        this.data.search = entries.map(e => JSON2.parse(JSON.stringify(e)));
        this.emit(Events.UPDATED);
      });
    };

    const dateKey = JSON.stringify(query.date);
    remote = remote || !this.data.history[dateKey];

    if (remote) {
      this.data.history[dateKey] = true;
      db.Entry.find({date: query.date}, Object.assign({}, options)).fetch(searchLocal);
    } else {
      searchLocal();
    }
  }
}

export default EntryStore.construct(EntryStore, Events)