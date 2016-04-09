import React from 'react'
import Influx from 'react-influx'
import {ifcat} from '../../libs/utils'
import EntryStore from '../../stores/EntryStore';
import Dispatcher from '../../dispatchers/Dispatcher';
import ObjectInspector from 'react-object-inspector';
import _ from 'underscore'
import Checkbox from './Checkbox.jsx';

export default class Entry extends Influx.Component {
  constructor(...args) {
    super(...args);
    this.state = {visible: false, width: window.innerWidth, selected: EntryStore.isSelected(this.props.entry._id)};
    this._onWindowResize = this._onWindowResize.bind(this);
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    window.removeEventListener("resize", this._onWindowResize);
  }

  componentDidMount() {
    super.componentDidMount();

    window.addEventListener("resize", this._onWindowResize, false)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({selected: EntryStore.isSelected(nextProps.entry._id)});
  }

  _onWindowResize() {
    this.setState({width: window.innerWidth});
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.UPDATED_SELECTED, this._onUpdateSelected]
    ]
  }

  _onUpdateSelected() {
    this.setState({selected: EntryStore.isSelected(this.props.entry._id)});
  }

  _inspectPre(persistent) {
    return <span className="pre">{`${persistent.app}-${persistent.id}`}</span>;
  }

  _inspectTags(tags, persistent) {
    return (tags || []).map((t, i) => {
      return <span key={i} className={ifcat('tag',{persistent: persistent})}>{t}</span>;
    });
  }

  _inspectExpose(expose) {
    return <span className={ifcat('tag',{
      fill: true,
      bgRed: expose == 'error',
      //bgBlue: expose == 'express',
      //bgGreen: expose == 'log'
    })}>{expose}</span>;
  }

  _handleClick() {
    this.setState({visible: !this.state.visible});
  }

  _inspectMetrics(entry) {
    return (
      <span>
            {_.map(entry.transient.metrics, (value, key)=> {
              value = typeof value === 'number' ? value.toFixed(3) : value;
              return (
                <span key={key}>
                    <span className='tag fill bgPurple'>{key}</span>
                    <span className='tag green'>{value}</span>
                  </span>
              );
            })}
          </span>
    )
  }

  _inspectRaw(preSpace) {
    if (!this.state.visible) {
      return null;
    }

    const {entry} = this.props;
    return (
      <div className="raw inspector flex">
        <span className="line" dangerouslySetInnerHTML={{__html:preSpace}}/>
        <div className="scroll scroll-x">
          <ObjectInspector data={ entry } initialExpandedPaths={["*"]}/>
        </div>
      </div>
    );
  }

  _inspectArgs(entry) {
    let args = entry.args;

    if (entry.expose === 'express') {
      const express = entry.args[0];
      args = (
        <span>
            <span className='tag fill bgGreen'>{express.method}</span>
            <span className='gray'>{express.originalUrl}</span>
            <span className="green" style={{margin:'0 4px'}}>{express.status} - {express.contentLength} </span>
            <span className='darkGray'>{Number(entry.args[0].duration).toFixed(3)}ms</span>
          </span>
      );
    }

    if (!Array.isArray(args)) return <span className="arg-string">{args}</span>;
    return args.map((data, i) => {
      if (typeof data === 'object' || typeof data === 'function') {
        return <ObjectInspector key={i} data={data}/>;
      }

      return <span key={i} className="arg-string">{data}</span>;
    });
  }

  _inspectCallSite(entry) {
    let site = entry.transient.callsite;
    let tooltip;
    if (entry.expose === 'express') {
      const express = entry.args[0];
      site = `${express.ip}`;
      tooltip = 'remote ip';
    } else {
      site = `${site.file.substr(site.file.lastIndexOf('/') + 1)}:${site.line}`;
      tooltip = site.func || 'anonymous';
    }
    return (
      <span className={ifcat('tag tooltip',{fill: true})}>
        {site}
        <span className='tooltiptext tooltip-top'>{tooltip}</span>
      </span>
    );
  }

  render() {
    let {entry} = this.props;

    const lineNumber = new Array(this.props.maxLineChars - String(this.props.line).length).join('&nbsp;') + this.props.line;
    const preSpace = new Array(this.props.maxLineChars).join('&nbsp;');
    const isPushed = entry._pushed;

    if (this.state.width < 1280) {
      return (
        <div className="entry">
          <div className="pretty flex">
            <span className="line" dangerouslySetInnerHTML={{__html:lineNumber}}/>
            <Checkbox type='checkbox' checked={this.state.selected} style={{marginBottom: 4}}
                      onChange={e => Dispatcher.emit(Dispatcher.Events.REQUEST_SELECT_ENTRY, entry._id, e.target.checked)}/>
            <span>{this._inspectPre(entry.persistent)}</span>
            <span>{this._inspectTags(entry.persistent.tags, true)}</span>
            <span>{this._inspectTags(entry.transient.tags, false, isPushed)}</span>
            <span>{this._inspectMetrics(entry)}</span>
            <span className="box"/>
            <span>{this._inspectExpose(entry.expose)}</span>
            <span>{this._inspectCallSite(entry)}</span>
            { isPushed ? <span><span className='tag fill new-entry'>new</span></span> : null }
            <span className={ifcat("expand-right gray", {rotate:this.state.visible})}
                  onClick={this._handleClick.bind(this)}>◀</span>
          </div>
          <div className="flex">
            <span className="line" dangerouslySetInnerHTML={{__html:preSpace}}/>
            <span className="white medium inspector box scroll scroll-x"
                  style={{marginLeft: 22}}>{this._inspectArgs(entry)}</span>
          </div>
          { this._inspectRaw(preSpace) }
        </div>
      );
    }

    return (
      <div className="entry">
        <div className="flex">
          <span className="line" dangerouslySetInnerHTML={{__html:lineNumber}}/>
          <Checkbox type='checkbox' checked={this.state.selected}
                    onChange={e => Dispatcher.emit(Dispatcher.Events.REQUEST_SELECT_ENTRY, entry._id, e.target.checked)}/>
          <span>{this._inspectPre(entry.persistent)}</span>
          <span>{this._inspectTags(entry.persistent.tags, true)}</span>
          <span>{this._inspectTags(entry.transient.tags, false, isPushed)}</span>
          <span>{this._inspectMetrics(entry)}</span>
          <span className="white medium inspector box scroll scroll-x">{this._inspectArgs(entry)}</span>
          <span>{this._inspectExpose(entry.expose)}</span>
          <span>{this._inspectCallSite(entry)}</span>
          { isPushed ? <span><span className='tag fill new-entry'>new</span></span> : null }
          <span className={ifcat("expand-right gray", {rotate:this.state.visible})}
                onClick={this._handleClick.bind(this)}>◀</span>
        </div>
        {this._inspectRaw(preSpace) }
      </div>
    );
  }
}