import React from 'react'
import request from 'superagent'
import Influx from 'react-influx'
import Wave from './Wave'

const ANIMATION = false;
class App extends Influx.Component {
  constructor(...args) {
    super(...args);

    this.state = {credentials: {}};
  }

  _handleSubmit() {
    request
        .post(window.location.pathname)
        .send(this.state.credentials)
        .end((err, res) => {
          if (err || res.body.status) return;
          window.location.href = res.body.data;
        });
  }

  componentDidMount() {
    if (ANIMATION) {
      setTimeout(()=> new Wave().init(), 1500);
      document.getElementById('footer').style.display = 'block';
    }
  }

  _handleChange(key, e) {
    this.setState({credentials: {...this.state.credentials, [key]: e.target.value}});
  }

  render() {
    return (
        <div className="full">
          <div className="float">
            <input className="input" placeholder="USERNAME" onChange={this._handleChange.bind(this, 'username')}/>
            <input className="input" type="password" placeholder="PASSWORD"
                   onChange={this._handleChange.bind(this, 'password')}/>
            <div className="button" onClick={this._handleSubmit.bind(this)}>Submit</div>
          </div>
        </div>
    );
  }
}

export default App