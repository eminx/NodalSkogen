import React, { useEffect, useState } from 'react';
import { parse, stringify } from 'query-string';
import moment from 'moment';
import { Row, Radio } from 'antd';
import Loader from '../UIComponents/Loader';
import SexyThumb from '../UIComponents/SexyThumb';

const yesterday = moment().add(-1, 'days');
const today = moment();

const RadioGroup = Radio.Group;

const centerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  padding: 6,
};

const getFirstFutureOccurence = (occurence) =>
  moment(occurence.endDate).isAfter(yesterday);

const getFirstPastOccurence = (occurence) =>
  moment(occurence.endDate).isBefore(today);

const compareForSort = (a, b) => {
  const firstOccurenceA = a.datesAndTimes.find(getFirstFutureOccurence);
  const firstOccurenceB = b.datesAndTimes.find(getFirstFutureOccurence);
  const dateA = new Date(
    firstOccurenceA.startDate + 'T' + firstOccurenceA.startTime + ':00Z'
  );
  const dateB = new Date(
    firstOccurenceB.startDate + 'T' + firstOccurenceB.startTime + ':00Z'
  );
  return dateA - dateB;
};

const compareForSortReverse = (a, b) => {
  const firstOccurenceA = a.datesAndTimes.find(getFirstPastOccurence);
  const firstOccurenceB = b.datesAndTimes.find(getFirstPastOccurence);
  const dateA = new Date(
    firstOccurenceA.startDate + 'T' + firstOccurenceA.startTime + ':00Z'
  );
  const dateB = new Date(
    firstOccurenceB.startDate + 'T' + firstOccurenceB.startTime + ':00Z'
  );
  return dateB - dateA;
};

const parseOnlyAllowedGroups = (futureGroups, currentUser) => {
  if (!currentUser) {
    return futureGroups
      .filter((group) => !group.isPrivate)
      .map((group) => ({
        ...group,
        datesAndTimes: group.meetings,
        isGroup: true,
      }));
  }

  return futureGroups.filter((group) => {
    if (!group.isPrivate) {
      return true;
    } else {
      const currentUserId = currentUser._id;
      console.log(
        group,
        group.adminId === currentUserId,
        group.members.some((member) => member.memberId === currentUserId),
        group.peopleInvited.some(
          (person) => person.email === currentUser.emails[0].address
        )
      );
      return (
        group.adminId === currentUserId ||
        group.members.some((member) => member.memberId === currentUserId) ||
        group.peopleInvited.some(
          (person) => person.email === currentUser.emails[0].address
        )
      );
    }
  });
};

const getGroupMeetings = (groupsList, currentUser) => {
  if (!groupsList) {
    return null;
  }

  const futureGroups = groupsList.filter((group) =>
    group.meetings.some((meeting) =>
      moment(meeting.startDate).isAfter(yesterday)
    )
  );

  const futureGroupsWithAccessFilter = parseOnlyAllowedGroups(
    futureGroups,
    currentUser
  );

  return futureGroupsWithAccessFilter.map((group) => ({
    ...group,
    datesAndTimes: group.meetings,
    isGroup: true,
  }));
};

const getPublicActivities = (bookingsList) => {
  if (!bookingsList) {
    return null;
  }

  const publicActivities = bookingsList.filter(
    (activity) => activity.isPublicActivity === true
  );

  return publicActivities.filter((activity) =>
    activity.datesAndTimes.some((date) =>
      moment(date.endDate).isAfter(yesterday)
    )
  );
};

const getPastPublicActivities = (bookingsList) => {
  if (!bookingsList) {
    return null;
  }

  const publicActivities = bookingsList.filter(
    (activity) => activity.isPublicActivity === true
  );

  return publicActivities.filter((activity) =>
    activity.datesAndTimes.some((date) =>
      moment(date.startDate).isBefore(today)
    )
  );
};

function Home({ history, bookingsList, groupsList, currentUser, isLoading }) {
  const [past, setPast] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const {
    location: { search },
  } = history;
  const { showPast } = parse(search, { parseBooleans: true });

  useEffect(() => {
    const pastShows = getPastActivities();
    setPast(pastShows);
    const upcomingShows = getAllUpcoming();
    setUpcoming(upcomingShows);
  }, [search, bookingsList, groupsList, currentUser]);

  const getAllUpcoming = () => {
    const allActivities = [
      ...getPublicActivities(bookingsList),
      ...getGroupMeetings(groupsList, currentUser),
    ];
    return allActivities.sort(compareForSort);
  };

  const getPastActivities = () => {
    return getPastPublicActivities(bookingsList).sort(compareForSortReverse);
  };

  const handlePastChange = ({ target: { value } }) => {
    const showPast = value === 'Past';
    history.push({ search: stringify({ showPast }) });
  };

  let thumbs;
  if (showPast) {
    thumbs = past;
  } else {
    thumbs = upcoming;
  }

  return (
    <div style={{ marginBottom: 48 }}>
      <Row gutter={24}>
        <div style={{ width: '100%' }}>
          <Loader isContainer spinning={!thumbs || thumbs.length === 0}>
            <div>
              {/* <CovidInfo /> */}
              <div style={centerStyle}>
                <RadioGroup
                  value={showPast ? 'Past' : 'Upcoming'}
                  options={['Past', 'Upcoming']}
                  onChange={handlePastChange}
                  optionType="button"
                  buttonStyle="solid"
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {thumbs &&
                  thumbs.map((activity) => (
                    <SexyThumb
                      key={activity._id}
                      item={activity}
                      isHome
                      showPast={showPast}
                    />
                  ))}
              </div>
            </div>
          </Loader>
        </div>
      </Row>
    </div>
  );
}

const covidInfo = [
  `Skogen hoppas kunna öppna för publik i maj.`,
  `Skogen aims at opening for audience in may.`,
];

const innerBoxStyle = {
  margin: 12,
  padding: 12,
  maxWidth: 576,
  border: '1px solid #ea3924',
};

function CovidInfo() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={innerBoxStyle}>
        <h3 style={{ textAlign: 'center', marginBottom: 12 }}>Notice</h3>
        {covidInfo.map((p) => (
          <p style={{ textAlign: 'center' }} key={p}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Home;
