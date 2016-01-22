import Influx from 'react-influx'
import keyMirror from 'keymirror'

const Events = keyMirror({
  REQUEST_INIT_DATABASE: null,
  REQUEST_INIT_SOCKET: null,
  REQUEST_ENTRY_SEARCH: null
});

class Dispatcher extends Influx.Dispatcher {
  // override as needed
}

export default Dispatcher.construct(Dispatcher, Events)