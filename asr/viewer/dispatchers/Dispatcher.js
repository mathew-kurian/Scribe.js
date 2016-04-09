import Influx from 'react-influx'
import keyMirror from 'keymirror'

const Events = keyMirror({
                           REQUEST_GROW_SEARCH: null,
                           REQUEST_INIT_DATABASE: null,
                           REQUEST_INIT_SOCKET: null,
                           REQUEST_ENTRY_SEARCH: null,
                           REQUEST_SELECT_ENTRY: null,
                           REQUEST_SELECT_ALL_ENTRIES: null,
                           REQUEST_SELECT_CLEAR_ENTRIES: null,
                           REQUEST_TIMESERIES_DATE: null,
                           REQUEST_PERIOD: null
                         });

class Dispatcher extends Influx.Dispatcher {
  // override as needed
}

export default Dispatcher.construct(Dispatcher, Events)