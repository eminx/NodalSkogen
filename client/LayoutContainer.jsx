import { withTracker } from 'meteor/react-meteor-data';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import {
  Badge,
  Button,
  Col,
  Divider,
  Form,
  Input,
  Layout,
  List,
  ConfigProvider,
  Popover,
  Row,
} from 'antd';
import en_GB from 'antd/lib/locale-provider/en_GB';
import moment from 'moment';
import 'moment/locale/en-gb'; // important!
moment.locale('en-gb'); // important!

const { Content } = Layout;
import BellOutlined from '@ant-design/icons/lib/icons/BellOutlined';

const menu = [
  {
    label: 'Program',
    route: '/',
  },
  {
    label: 'Making It Work',
    route: '/calendar',
  },
  {
    label: 'Groups',
    route: '/groups',
  },
  {
    label: 'Community Press',
    route: '/publications',
  },
  {
    label: 'Info',
    route: '/page/about-skogen',
  },
];

const adminMenu = [
  {
    label: 'Admin',
    route: '/admin/users',
  },
];

const FormItem = Form.Item;

class LayoutPage extends React.Component {
  state = {
    menuOpen: false,
    me: false,
    isNotificationPopoverOpen: false,
  };

  componentWillUpdate(nextProps, nextState) {
    const { history } = this.props;
    const pathname = history.location.pathname;
    if (nextProps.history.location.pathname !== pathname) {
      this.closeMenu();
    }
  }

  openMenu = () => {
    this.setState({
      menuOpen: true,
    });
  };

  closeMenu = () => {
    this.setState({
      menuOpen: false,
    });
  };

  handleNotificationVisibility = () => {
    this.setState({
      isNotificationPopoverOpen: !this.state.isNotificationPopoverOpen,
    });
  };

  renderNotificationList = (list) => {
    if (list.length === 0) {
      return <em>You don't have unread messages</em>;
    }

    return (
      <List
        size="small"
        dataSource={list}
        renderItem={(item) => (
          <List.Item>
            <Link
              to={`/${item.context}/${item.contextId}`}
              onClick={this.handleNotificationVisibility}
            >
              <Badge count={item.count} offset={[10, 0]}>
                <h4>{item.title}</h4>
              </Badge>
            </Link>
          </List.Item>
        )}
      />
    );
  };

  render() {
    const { isNotificationPopoverOpen } = this.state;
    const { children, currentUser } = this.props;

    const notifications = currentUser && currentUser.notifications;
    let notificationsCounter = 0;
    if (notifications && notifications.length > 0) {
      notifications.forEach((notification) => {
        notificationsCounter += notification.count;
      });
    }

    return (
      <div className="main-viewport">
        <div className="header-container">
          <Row className="header-background">
            <Col xs={8}>
              <span
                style={{
                  padding: '6px 12px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 255, 255, .7)',
                }}
              >
                <Link to="/my-profile" style={{ color: '#030303' }}>
                  {currentUser ? currentUser.username : 'LOGIN'}
                </Link>
              </span>
            </Col>

            <Col xs={8} style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to="/">
                <div className="logo skogen-logo" />
              </Link>
            </Col>

            <Col xs={8} style={{ textAlign: 'right' }}>
              {notifications && (
                <Popover
                  placement="bottomRight"
                  title="Notifications"
                  content={this.renderNotificationList(notifications)}
                  trigger="click"
                  visible={isNotificationPopoverOpen}
                  onVisibleChange={this.handleNotificationVisibility}
                >
                  <Badge count={notificationsCounter}>
                    <BellOutlined
                      onClick={this.toggleNotificationsPopover}
                      style={{ fontSize: 24, cursor: 'pointer' }}
                    />
                  </Badge>
                </Popover>
              )}
            </Col>
          </Row>
        </div>

        <div className="skogen-menu-layout">
          {menu.map((item) => (
            <Link to={item.route} key={item.label}>
              <b>{item.label}</b>
            </Link>
          ))}
          {currentUser &&
            currentUser.isSuperAdmin &&
            adminMenu.map((item) => (
              <Link to={item.route} key={item.label}>
                <b>{item.label}</b>
              </Link>
            ))}
        </div>
        <Layout className="layout">
          <ConfigProvider locale={en_GB}>
            <Content>{children}</Content>
          </ConfigProvider>
        </Layout>
        <FancyFooter />
      </div>
    );
  }
}

const widgetBgrstyle = {
  textAlign: 'center',
  backgroundColor: 'rgba(255, 245, 244, .8)',
  padding: 24,
  margin: 12,
  marginTop: 32,
  maxWidth: 320,
};

const boldBabe = {
  textTransform: 'uppercase',
  fontWeight: 700,
};

const FancyFooter = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={widgetBgrstyle}>
        <EmailSignupForm />

        <Divider style={{ background: '#030303' }} />

        <SkogenInfo />

        <Divider style={{ background: '#030303' }} />

        <h4>Swish for donations:</h4>
        <h3 style={{ ...boldBabe }}>123 388 4772</h3>

        <Divider style={{ background: '#030303' }} />

        <p style={{ marginTop: 24 }}>
          Crafted with ∞♥︎ at{' '}
          <a href="http://www.infinitesimals.space">Infinitesimals Labs</a>
        </p>
        <p>
          <a
            href="https://github.com/eminx/SkogenApp"
            style={{ borderBottom: '1px solid #ea3214e6' }}
          >
            source code
          </a>
        </p>
      </div>
    </div>
  );
};

const EmailSignupForm = () => (
  <Fragment>
    <FormItem>
      <h4 style={{ ...boldBabe, marginBottom: 0, lineHeight: '10px' }}>
        Sign up to Our Newsletter
      </h4>
    </FormItem>
    <form method="POST" action="https://gansub.com/s/RKNO/">
      <FormItem>
        <Input addonBefore="email" id="email" name="email" />
      </FormItem>

      <FormItem>
        <Input addonBefore="first name" id="first_name" name="first_name" />
      </FormItem>

      <input type="hidden" name="gan_repeat_email" />

      <FormItem>
        <Button htmlType="submit">Signup</Button>
      </FormItem>
    </form>
  </Fragment>
);

const SkogenInfo = () => (
  <Fragment>
    <h3 style={boldBabe}>SKOGEN</h3>
    <p>Masthuggsterrassen 3, SE-413 18 Göteborg, Sweden</p>
    <p>
      <a href="mailto:info@skogen.pm">info@skogen.pm</a>
    </p>
    <p>
      <a
        href="https://www.facebook.com/skogen.pm"
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        www.facebook.com/skogen.pm
      </a>
      <br />
      (opens in a new tab)
    </p>
  </Fragment>
);

export default LayoutContainer = withTracker((props) => {
  const meSub = Meteor.subscribe('me');
  const currentUser = Meteor.user();

  return {
    currentUser,
  };
})(LayoutPage);
