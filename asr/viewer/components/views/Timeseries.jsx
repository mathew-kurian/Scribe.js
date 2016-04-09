import React from 'react'
import Influx from 'react-influx'
import {ifcat} from '../../libs/utils'
import EntryStore from '../../stores/EntryStore'
import Dispatcher from '../../dispatchers/Dispatcher'
import Spinner from 'react-spinkit'
import _ from 'underscore';
import moment from 'moment';

const GROWTH = 1;

export default class TimeSeries extends Influx.Component {
  constructor(...args) {
    super(...args);

    this.state = {data: [], series: []};
  }

  getListeners() {
    return [
      [EntryStore, EntryStore.Events.UPDATED_TIMESERIES, this._onEntryStoreUpdatedTimeSeries],
      [Dispatcher, Dispatcher.Events.REQUEST_TIMESERIES_DATE, this._onDispatcherRequestTimeSeriesDate]
    ]
  }

  _onDispatcherRequestTimeSeriesDate(date) {
    date = moment(date);
    const {series} = this.state;

    for (var i = 0; i < series.length; i++) {
      const data = series[i];

      // console.log(data.date.toDate(), date.toDate());

      if (data.date.diff(date) < 0) {
        Array.prototype.forEach.call(document.getElementsByClassName('red-selected'), a => a.classList.remove('red-selected'));
        this.refs[data.ref].classList.add('red-selected');
        return;
      }
    }
  }

  _onEntryStoreUpdatedTimeSeries() {
    const period = EntryStore.getSearchPeriod();
    const aggregations = EntryStore.getSearchTimeSeries();
    const data = _.groupBy(aggregations, a => `${a._id.hour.day}_${a._id.hour.hour}`);
    const end = moment(period.$lt);
    const series = [];
    const exposers = Object.keys(_.indexBy(aggregations, a => a._id.expose));

    let start = moment(period.$gt);
    let max = 0;

    for (var i in data) {
      const exposed = {};
      for (var k = 0; k < data[i].length; k++) {
        const count = data[i][k].number;
        exposed[data[i][k]._id.expose] = count;

        max = Math.max(max, count);
      }

      data[i] = exposed;
    }

    let count = 0;
    const offset = new Date().getTimezoneOffset() * 60 * 1000;

    while (end.diff(start) > 0) {
      const startOffset = moment(start.toDate().getTime() + offset);
      const day = startOffset.date();
      const hour = startOffset.hour();
      const key = `${day}_${hour}`;

      series.push({date: moment(start), ref: `pos-${count++}`, count: data[key] || {}});
      start = start.add(1, 'hour');
    }

    var crushSeries = [];
    var groupSize = parseInt(series.length / 24);
    for (var i = 0; i < series.length; i += groupSize) {
      const start = series[i];
      for (var k = i + 1; k < i + groupSize; k++) {
        const curr = series[k];
        for (var e = 0; e < exposers.length; e++) {
          const ee = exposers[e];
          start.count[ee] = start.count[ee] || 0;
          start.count[ee] += (curr.count[ee] || 0)

          max = Math.max(start.count[ee], max);
        }
      }

      crushSeries.push(start);
    }

    this.setState({series: crushSeries.reverse(), exposers, max});
  }

  render() {
    const maxHeight = 80;
    const {series, exposers, max} = this.state;

    const elems = series.map((data, i) => {
      const exposed = exposers.map(expose => {
        const count = data.count[expose] || 0;
        const height = Math.min(count / max * maxHeight * GROWTH, maxHeight);

        return (
          <div key={expose}
               className={'box graph bar tooltip ' + expose}
               style={{ top: `${maxHeight - height}px`, height: `${height}px`}}>
            <span className='tooltiptext tooltip-top'>{`${expose}: ${count}`}</span>
          </div>
        );
      });

      return (
        <div key={i} ref={data.ref} className='box graph ggroup'>
          <div className='flex full gg'>
            {exposed}
            <div className='time-series-label'>{data.date.format('M/D hA')}</div>
          </div>
        </div>
      );
    });

    return (
      <div className='flex'
           style={{height: maxHeight, width: '100%', position: 'relative', background: 'rgba(0,0,0,0.3)'}}>
        {elems}
      </div>
    )
  }
}