import Influx from 'react-influx'
import keyMirror from 'keymirror'
import Dispatcher from '../dispatchers/Dispatcher'
import * as JSON2 from '../../../src/libs/JSON2'
import moment from 'moment';
import _ from 'underscore';
import request from 'superagent'

const OVERFLOW = 200;
const Events = keyMirror({
                           DATABASE_READY: null,
                           SOCKET_READY: null,
                           UPDATED: null,
                           UPDATED_SELECTED: null,
                           UPDATED_TIMESERIES: null
                         });

class EntryStore extends Influx.Store {
  constructor(...args) {
    super(Dispatcher/*,  additional dispatchers you have */);
    this.data = Object.assign(
      {
        entries: [], selected: {},
        options: {sort: {date: -1}, limit: OVERFLOW},
        period: {
          $gt: moment().startOf('day').toISOString(),
          $lt: moment().add(1, 'days').startOf('day').toISOString()
        }
      }, this.fromQueryString(window.location.hash.substr(1)));

    this.setMaxListeners(Number.MAX_SAFE_INTEGER);
  }

  getSearchResults() {
    return this.data.entries;
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.REQUEST_INIT_DATABASE, this._onDispatcherRequestInitDatabase],
      [Dispatcher, Dispatcher.Events.REQUEST_INIT_SOCKET, this._onDispatcherRequestInitSocket],
      [Dispatcher, Dispatcher.Events.REQUEST_PERIOD, this._onDispatcherRequestPeriod],
      [Dispatcher, Dispatcher.Events.REQUEST_SELECT_ENTRY, this._onDispatcherRequestSelectEntry],
      [Dispatcher, Dispatcher.Events.REQUEST_SELECT_ALL_ENTRIES, this._onDispatcherRequestSelectAllEntry],
      [Dispatcher, Dispatcher.Events.REQUEST_SELECT_CLEAR_ENTRIES, this._onDispatcherRequestClearEntries],
      [Dispatcher, Dispatcher.Events.REQUEST_ENTRY_SEARCH, this._onDispatcherRequestEntrySearch],
      [Dispatcher, Dispatcher.Events.REQUEST_GROW_SEARCH, this._onDispatcherRequestGrowSearch]
    ]
  }

  _onDispatcherRequestInitDatabase() {
    const presearch = Object.keys(this.data.query || {}).length;
    this.emit(Events.DATABASE_READY, presearch);

    if (presearch) {
      Dispatcher.emit(Dispatcher.Events.REQUEST_ENTRY_SEARCH, this.data.query, this.data.options, this.data.period);
    }
  }

  _onDispatcherRequestSelectEntry(id, selected) {
    if (selected) {
      this.data.selected[id] = true;
    } else {
      delete this.data.selected[id];
    }

    this.emit(Events.UPDATED_SELECTED);
    this.emit(Events.UPDATED_SELECTED + id, true);
  }

  isSelected(id) {
    return !!this.data.selected[id];
  }

  getSelected() {
    return Object.keys(this.data.selected);
  }

  _onDispatcherRequestSelectAllEntry() {
    const plucked = _.pluck(this.data.entries, '_id');
    plucked.forEach(a => this.data.selected[a] = true);

    this.emit(Events.UPDATED_SELECTED);
    plucked.forEach(id => this.emit(Events.UPDATED_SELECTED + id, true));
  }

  _onDispatcherRequestClearEntries() {
    const keys = Object.keys(this.data.selected);

    this.data.selected = {};

    this.emit(Events.UPDATED_SELECTED);
    keys.forEach(id => this.emit(Events.UPDATED_SELECTED + id, false));
  }

  _onDispatcherRequestInitSocket() {
    const url = window.location;
    (config.socketPorts || []).map(port => {
      this.socket = io(`${url.protocol}//${url.hostname}:${port}`);
      this.socket.on('data', data => {
        data._pushed = true;
        db.localDb.Entry.upsert(data, () => this.refreshSession());
      });
    });

    this.emit(Events.SOCKET_READY);
  }

  _onDispatcherRequestEntrySearch(...args) {
    this.startSession(...args);
  }

  _onDispatcherRequestGrowSearch() {
    this.fetchSession();
  }

  _onDispatcherRequestPeriod(period) {
    this.setSessionPeriod(period);
  }

  getSearchTimeSeries() {
    return this.data.timeseries;
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

  addEntries(entries, pre) {
    this.data.entries = pre ? [...entries, ...this.data.entries] : [...this.data.entries, ...entries];
  }

  fromQueryString(string) {
    try {
      return JSON.parse(string);
    } catch (e) {
      return {};
    }
  }

  getQueryString(query = this.data.query, select = this.data.select) {
    return JSON.stringify({
                            query: query,
                            options: this.data.options,
                            period: this.data.period,
                            text: this.data.text,
                            select: select
                          });
  }

  getSessionDBQuery(date = this.data.period) {
    return Object.assign({}, Object.assign({}, this.data.query, this.data.text ? {
      serialized: {
        $regex: `.*${this.data.text}.*`,
        $options: 'i'
      }
    } : {}), {date});
  }

  getSessionDBOptionsQuery(options = this.data.options) {
    return Object.assign({}, this.data.options, options);
  }

  startSession(query = this.data.query, options = this.data.options, period = this.data.period, text = this.data.text) {
    this.data.entries = [];
    this.data.options = options;
    this.data.query = query;
    this.data.finished = false;
    this.data.timeseries = [];
    this.data.period = period;
    this.data.text = text;
    this.data.session = Date.now();

    db.Entry.find(this.getSessionDBQuery(), this.getSessionDBOptionsQuery({skip: 0}))
      .fetch(entries => {
        this.data.entries = entries;
        this.emit(Events.UPDATED);
      });


    request
      .post('rest/timeseries')
      .send(this.getSessionDBQuery())
      .end((err, res) => {
        this.data.timeseries = res.body || [];
        this.emit(Events.UPDATED_TIMESERIES);
      });

    window.location.hash = this.getQueryString();
  }

  getSearchPeriod() {
    return this.data.period;
  }

  getSessionText() {
    return this.data.text || '';
  }

  setSessionText(text) {
    this.data.text = text;

    this.startSession(); // restart
  }

  setSessionPeriod(period) {
    this.data.period = period;

    this.startSession(); // restart
  }

  getSessionId() {
    return this.data.session;
  }

  refreshSession() {
    db.localDb.Entry
      .find(this.getSessionDBQuery(), this.getSessionDBOptionsQuery({limit: null, skip: 0}))
      .fetch(entries => {
        this.data.entries = entries;
        this.emit(Events.UPDATED);
      });
  }

  fetchSession(up) {
    const {options, entries, query} = this.data;
    const entry = entries[entries.length - 1];

    if (entry) {
      const periodCpy = JSON.parse(JSON.stringify(this.data.period));
      if (up) {
        delete periodCpy.$gte;
        delete periodCpy.$gt;
        periodCpy.$gte = entry.date;
      } else {
        delete periodCpy.$lte;
        delete periodCpy.$lt;
        periodCpy.$lte = entry.date;
      }

      db
        .Entry
        .find(this.getSessionDBQuery(periodCpy), this.getSessionDBOptionsQuery())
        .fetch(() => {
          this.refreshSession();
        });
    }
  }
}

export default EntryStore.construct(EntryStore, Events)