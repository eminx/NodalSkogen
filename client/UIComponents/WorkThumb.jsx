import React from 'react';
import { Avatar, Tag } from 'antd';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const commonStyle = {
  color: '#fff',
  fontWeight: 300,
  lineHeight: 1,
};
const imageStyle = {
  width: 320,
  height: 320,
  objectFit: 'cover',
};

const ellipsisStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

function WorkThumb({ work, history }) {
  return (
    <div className="thumb-cover-container work-thumb">
      <div className="thumb-cover">
        <LazyLoadImage
          alt={work.title}
          src={work.images[0]}
          style={imageStyle}
          effect="black-and-white"
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: 16,
        }}
      >
        {work.category ? (
          <Tag
            color={work.category.color}
            style={{ zIndex: 2, borderRadius: 0 }}
          >
            <b>{work.category.label.toUpperCase()}</b>
          </Tag>
        ) : (
          <div />
        )}
        <Avatar
          src={work.authorAvatar && work.authorAvatar.src}
          style={{ backgroundColor: '#ea3924' }}
          size="large"
        >
          {work.authorUsername.substring(0, 1).toUpperCase()}
        </Avatar>
      </div>

      <div
        style={{
          position: 'relative',
          paddingTop: 120,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <h4
          style={{
            ...commonStyle,
            fontSize: 18,
            marginBottom: 6,
            lineHeight: '24px',
            overflowWrap: 'anywhere',
          }}
        >
          <b>{work.title}</b>
        </h4>
        <p
          style={{
            ...commonStyle,
            fontSize: 16,
            lineHeight: '18px',
            fontStyle: 'italic',
          }}
        >
          {work.shortDescription}
        </p>
      </div>
    </div>
  );
}

export default WorkThumb;
