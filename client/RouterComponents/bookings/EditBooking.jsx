import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import React from 'react';
import Resizer from 'react-image-file-resizer';
import {
  Row,
  Col,
  message,
  Alert,
  Affix,
  Modal,
  Button,
  Switch,
  Divider,
} from 'antd/lib';
import { LeftOutlined } from '@ant-design/icons/lib';

import { dataURLtoFile } from '../../functions';
import CreateBookingForm from '../../UIComponents/CreateBookingForm';
import ModalArticle from '../../UIComponents/ModalArticle';

const successEditMessage = (isDeleted) => {
  if (isDeleted) {
    message.success('The booking is successfully deleted', 4);
  } else {
    message.success('Your booking is successfully updated', 6);
  }
};

const sideNote =
  "Please check if a corresponding time and space is not taken already. \n It is your responsibility to make sure that there's no overlapping bookings.";

const resizedImageWidth = 900;

class EditBooking extends React.Component {
  state = {
    modalConfirm: false,
    isDeleteModalOn: false,
    values: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    newBookingId: null,
    uploadedImage: null,
    uploadableImage: null,
    uploadableImageLocal: null,
    isPublicActivity: false,
    isBookingsDisabled: false,
    numberOfRecurrence: 0,
  };

  componentDidMount() {
    this.setPublicActivity();
    this.setNumberOfRecurrence();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.gatheringData) {
      this.setPublicActivity();
    }

    if (!prevProps.gatheringData) {
      this.setNumberOfRecurrence();
    }
  }

  setUploadableImage = (e) => {
    const theImageFile = e.file.originFileObj;

    Resizer.imageFileResizer(
      theImageFile,
      resizedImageWidth,
      (resizedImageWidth * theImageFile.height) / theImageFile.width,
      'JPEG',
      95,
      0,
      (uri) => {
        this.setState({
          uploadableImage: dataURLtoFile(uri, theImageFile.name),
          uploadableImageLocal: uri,
        });
      },
      'base64'
    );
  };

  setPublicActivity = () => {
    const { gatheringData } = this.props;
    if (!gatheringData) {
      return;
    }

    this.setState({
      isPublicActivity: gatheringData.isPublicActivity,
      isBookingsDisabled: Boolean(gatheringData.isBookingsDisabled),
    });
  };

  setNumberOfRecurrence = () => {
    const { gatheringData } = this.props;
    if (!gatheringData) {
      return;
    }
    this.setState({
      numberOfRecurrence: gatheringData.datesAndTimes.length,
    });
  };

  addRecurrence = () => {
    this.setState({
      numberOfRecurrence: this.state.numberOfRecurrence + 1,
    });
  };

  removeRecurrence = (index) => {
    this.setState({
      numberOfRecurrence: this.state.numberOfRecurrence + 1,
    });
  };

  registerGatheringLocally = (values) => {
    values.authorName = this.props.currentUser.username || 'emo';
    this.setState({
      values: values,
      modalConfirm: true,
    });
  };

  uploadImage = () => {
    this.setState({ isLoading: true });

    const { uploadableImage } = this.state;

    if (!uploadableImage) {
      console.log('No uploadable image');
      this.updateBooking();
      return;
    }

    const upload = new Slingshot.Upload('activityImageUpload');

    upload.send(uploadableImage, (error, downloadUrl) => {
      if (error) {
        console.error('Error uploading:', error);
        message.error(error.reason);
        return;
      }
      this.setState(
        {
          uploadedImage: downloadUrl,
        },
        () => this.updateBooking()
      );
    });
  };

  updateBooking = () => {
    const {
      values,
      isPublicActivity,
      isBookingsDisabled,
      uploadedImage,
    } = this.state;
    const { gatheringData, history } = this.props;

    values.isPublicActivity = isPublicActivity;
    values.isBookingsDisabled = isBookingsDisabled;

    const imageUrl = uploadedImage || gatheringData.imageUrl;

    Meteor.call(
      'updateBooking',
      values,
      gatheringData._id,
      imageUrl,
      (error, respond) => {
        if (error) {
          this.setState({
            isLoading: false,
            isError: true,
          });
          message.error(error.reason);
          return;
        }
        this.setState({
          isLoading: false,
          newBookingId: respond,
          isSuccess: true,
        });
        const redirectUrl = gatheringData.isPublicActivity
          ? `/event/${gatheringData._id}`
          : '/calendar';
        message.success('Booking is successfully updated');
        history.push(redirectUrl);
      }
    );
  };

  hideModal = () => this.setState({ modalConfirm: false });
  showModal = () => this.setState({ modalConfirm: true });

  hideDeleteModal = () => this.setState({ isDeleteModalOn: false });
  showDeleteModal = () => this.setState({ isDeleteModalOn: true });

  deleteBooking = () => {
    const { gatheringData, history } = this.props;
    const bookingId = gatheringData._id;
    this.setState({ isLoading: true });

    Meteor.call('deleteBooking', bookingId, (error, respond) => {
      if (error) {
        this.setState({
          isLoading: false,
          isError: true,
        });
        message.error(error.reason);
        return;
      }
      this.setState({
        isLoading: false,
        isSuccess: true,
      });
      message.success('Booking is successfully deleted');
      history.push('/calendar');
    });
  };

  handlePublicActivitySwitch = (value) => {
    this.setState({
      isPublicActivity: value,
    });
  };

  handleDisableBookingsSwitch = (value) => {
    this.setState({
      isBookingsDisabled: value,
    });
  };

  handleConfirmModal = () => {
    const { isPublicActivity, uploadableImage } = this.state;
    if (isPublicActivity && uploadableImage) {
      this.uploadImage();
    } else {
      this.updateBooking();
    }
  };

  render() {
    const { gatheringData, currentUser } = this.props;

    if (
      !currentUser ||
      !gatheringData ||
      (currentUser._id !== gatheringData.authorId && !currentUser.isSuperAdmin)
    ) {
      return (
        <div
          style={{ maxWidth: 600, margin: '50px auto', textAlign: 'center' }}
        >
          <Alert
            message="You are not allowed to view this content"
            type="error"
          />
        </div>
      );
    }

    const {
      modalConfirm,
      isDeleteModalOn,
      values,
      isLoading,
      uploadableImage,
      isPublicActivity,
      isBookingsDisabled,
      numberOfRecurrence,
    } = this.state;

    return (
      <div style={{ padding: 24 }}>
        {gatheringData && (
          <div style={{ marginBottom: 12 }}>
            <Link to={`/event/${gatheringData._id}`}>
              <Button icon={<LeftOutlined />}>{gatheringData.title}</Button>
            </Link>
          </div>
        )}

        <h2>Edit your booking</h2>

        <Row gutter={48}>
          <Col xs={24} sm={24} md={16}>
            {gatheringData &&
              currentUser &&
              (gatheringData.authorId === currentUser._id ||
                currentUser.isSuperAdmin) && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: 12,
                  }}
                >
                  <Button onClick={this.showDeleteModal}>Delete</Button>
                </div>
              )}

            <Row style={{ marginBottom: 12 }}>
              <Col md={12}>
                <h4>public event?</h4>
                <Switch
                  checked={isPublicActivity}
                  onChange={this.handlePublicActivitySwitch}
                />
              </Col>
              {isPublicActivity && (
                <Col md={12}>
                  <h4>bookings disabled?</h4>
                  <Switch
                    checked={isBookingsDisabled}
                    onChange={this.handleDisableBookingsSwitch}
                  />
                </Col>
              )}
            </Row>

            <Divider />

            <CreateBookingForm
              values={values}
              bookingData={gatheringData}
              registerGatheringLocally={this.registerGatheringLocally}
              setUploadableImage={this.setUploadableImage}
              places={this.props.places}
              uploadableImage={
                (gatheringData && gatheringData.imageUrl) || uploadableImage
              }
              isPublicActivity={isPublicActivity}
              numberOfRecurrence={numberOfRecurrence}
              removeRecurrence={this.removeRecurrence}
              addRecurrence={this.addRecurrence}
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Affix offsetTop={50}>
              <Alert message={sideNote} type="warning" showIcon />
            </Affix>
          </Col>
        </Row>
        {modalConfirm && (
          <ModalArticle
            item={values}
            isLoading={isLoading}
            title="Overview The Information"
            visible={modalConfirm}
            onOk={this.handleConfirmModal}
            onCancel={this.hideModal}
            okText="Confirm"
            cancelText="Go back and edit"
          />
        )}

        <Modal
          title="Confirm"
          visible={isDeleteModalOn}
          onOk={this.deleteBooking}
          onCancel={this.hideDeleteModal}
          okText="Yes, delete"
          cancelText="Cancel"
        >
          Are you sure you want to delete this booking?
        </Modal>
      </div>
    );
  }
}

export default EditBooking;
