/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */

import React, { Component } from 'react';
//import { fromUnixTime, format } from 'date-fns';
//import * as locales from 'date-fns/locale';
//import { utcToZonedTime } from 'date-fns-tz';
import axios from '../../axios';

import styles from '../header/header.scss';

const instantiateDate = (tz, locale, timestamp) => {
  /*
  const currentTime =
    tz !== ''
      ? utcToZonedTime(fromUnixTime(timestamp), tz)
      : fromUnixTime(timestamp);
  */
  const shortLocale = locale !== null && locale.length >= 2 ? locale.substring(0, 2) : 'en';
  //const options = locales[shortLocale] ? { locale: locales[shortLocale] } : {};
  const date = new Date(timestamp * 1000);

  const dateOptions = {
    timeZone: tz,
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  const timeOptions = {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
  };

  return {
    date: new Intl.DateTimeFormat(shortLocale, dateOptions).format(date),
    time: new Intl.DateTimeFormat(shortLocale, timeOptions).format(date),
  };
/*
  return {
    date: format(currentTime, 'PP', options),
    time: format(currentTime, 'p', options),
  };
*/
};

class Clock extends Component {
  clockService = axios('internal.php?object=centreon_topcounter&action=clock');

  refreshTimeout = null;

  state = {
    data: null,
  };

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount() {
    clearTimeout(this.refreshTimeout);
  }

  // fetch api to get clock data
  getData = () => {
    this.clockService.get().then(({ data }) => {
      this.setState(
        {
          data: instantiateDate(data.timezone, data.locale, data.time),
        },
        this.refreshData,
      );
    });
  };

  // refresh clock data every 30 seconds
  // @todo get this interval from backend
  refreshData = () => {
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => {
      this.getData();
    }, 30000);
  };

  render() {
    const { data } = this.state;

    if (!data) {
      return null;
    }

    return (
      <div className={styles['wrap-right-timestamp']}>
        <span className={styles['wrap-right-date']}>{data.date}</span>
        <span className={styles['wrap-right-time']}>{data.time}</span>
      </div>
    );
  }
}

export default Clock;
