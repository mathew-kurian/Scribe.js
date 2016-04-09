import React from 'react';
import {ifcat} from '../../libs/utils';

class Checkbox extends React.Component {
  static propTypes = {
    defaultChecked: React.PropTypes.bool,
    checked: React.PropTypes.bool,
    toggle: React.PropTypes.bool,
    style: React.PropTypes.object,
    true: React.PropTypes.string,
    false: React.PropTypes.string,
    onChange: React.PropTypes.func
  };

  static defaultProps = {
    defaultChecked: false,
    checked: false,
    style: {},
    true: 'on',
    false: 'off',
    toggle: false,
    onChange: () => 0
  };

  constructor(...args) {
    super(...args);

    this.state = {checked: this.props.defaultChecked || this.props.checked};
  }

  componentWillReceiveProps(props) {
    if (props.checked !== this.state.checked) {
      this.setState({checked: props.checked});
    }
  }

  handleChecked(e) {
    if (this.props.onChange) {
      e.target.checked = !this.state.checked;
      this.props.onChange(e);
    }
  }

  render() {
    return (
      <div
        className={ifcat('checkbox', {toggle: this.props.toggle, checked: this.state.checked})}
        style={this.props.style}
        onClick={e => this.handleChecked(e)}>
        {this.props.toggle ? <div
          className='label'>{this.state.checked ? this.props.true : this.props.false}</div> : null }
        <div className='check'></div>
      </div>
    );
  }
}

export default Checkbox;
