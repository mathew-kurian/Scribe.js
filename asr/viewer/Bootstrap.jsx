import App from './components/App.jsx'
import React from 'react'
import MongoDB from './libs/MongoDB'
import {render} from 'react-dom'

window.Meteor = {Collection: {ObjectID: Function}};

const db = new MongoDB();

db.init()
  .then(db=>window.db = db)
  .then(()=>db.addCollection('Entry'))
  .then(()=>render(<App />, document.getElementById('app')));