import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Avatar, Image } from 'antd';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

const yesterday = moment(new Date()).add(-1, 'days');

const dateStyle = {
  color: '#fff',
  fontWeight: 700,
  lineHeight: 1,
};

const commonStyle = {
  color: '#fff',
  fontWeight: 300,
  lineHeight: 1,
};

const imageStyle = {
  width: '100%',
  height: 300,
  objectFit: 'cover',
};

const coverClass = 'thumb-cover';
const coverContainerClass = 'thumb-cover-container ';

function ThumbDate({ date }) {
  if (!date) {
    return null;
  }

  const isPastEvent = !moment(date.startDate).isAfter(yesterday);

  if (isPastEvent) {
    dateStyle.color = '#aaa';
  } else {
    dateStyle.color = '#fff';
  }

  return (
    <div style={{ marginRight: 16, marginBottom: 16 }}>
      <div style={{ ...dateStyle, fontSize: 24 }}>
        {moment(date.startDate).format('DD')}
      </div>
      <div style={{ ...dateStyle, fontSize: 15 }}>
        {moment(date.startDate).format('MMM').toUpperCase()}
      </div>
    </div>
  );
}

function SexyThumb({ item, isHome, isPub }) {
  const datesAndTimes = item.datesAndTimes || item.meetings;
  const futureDates =
    datesAndTimes &&
    datesAndTimes.filter((date) => moment(date.startDate).isAfter(yesterday));
  const remaining = futureDates && futureDates.length - 3;

  const isGroup = !isPub && Boolean(item.meetings);
  const clickLink = isGroup
    ? `/group/${item._id}`
    : isPub
    ? `/publication/${item._id}`
    : `/event/${item._id}`;

  return (
    <div className={coverContainerClass}>
      <Link to={clickLink}>
        <div className={coverClass}>
          <LazyLoadImage
            alt={item.title}
            src={item.imageUrl}
            style={imageStyle}
            effect="black-and-white"
            wrapperClassName="thumb-cover-child-lazy-image"
          />
        </div>

        <div
          style={{ position: 'relative', padding: '24px 16px', height: '100%' }}
        >
          {!isPub && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {futureDates.slice(0, 3).map((date) => (
                <ThumbDate key={date.startDate + date.startTime} date={date} />
              ))}
              {remaining > 0 && (
                <div style={{ ...dateStyle, fontSize: 20, marginBottom: 16 }}>
                  + {remaining}
                </div>
              )}
            </div>
          )}
          <h3
            style={{
              ...commonStyle,
              fontSize: 24,
              marginBottom: 6,
              lineHeight: '32px',
              overflowWrap: 'anywhere',
            }}
          >
            {item.title}
          </h3>
          <h4 style={{ ...commonStyle, fontSize: 16, lineHeight: '21px' }}>
            {isGroup
              ? item.readingMaterial
              : isPub
              ? item.authors
              : item.subTitle}
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              right: 12,
              bottom: 12,
            }}
          >
            {!isHome && (isGroup || item.isGroup) && (
              <Fragment>
                <Avatar
                  size={48}
                  style={{ color: '#ea3924', backgroundColor: '#fbd5d0' }}
                >
                  {item.adminUsername[0].toUpperCase()}
                </Avatar>
                <span style={{ color: '#fff' }}>{item.adminUsername}</span>
              </Fragment>
            )}

            {isPub && (
              <em style={{ color: '#fff' }}>{item.format.toUpperCase()}</em>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default SexyThumb;