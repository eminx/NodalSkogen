import React from 'react';
import { Redirect } from 'react-router-dom';
import { Row, Col, message, Alert, Switch, Divider } from 'antd';
import Resizer from 'react-image-file-resizer';

import CreateGroupForm from '../../UIComponents/CreateGroupForm';
import ModalArticle from '../../UIComponents/ModalArticle';
import { dataURLtoFile } from '../../functions';

const successCreation = () => {
  message.success('Your group is successfully created', 6);
};

const resizedImageWidth = 900;

class NewGroup extends React.Component {
  state = {
    modalConfirm: false,
    values: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isPrivate: false,
    newGroupId: null,
    uploadedImage: null,
    uploadableImage: null,
    uploadableImageLocal: null,
  };

  registerGroupLocally = (values) => {
    values.authorName = this.props.currentUser.username || 'emowtf';
    this.setState({
      values: values,
      modalConfirm: true,
    });
  };

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

  uploadImage = () => {
    this.setState({ isLoading: true });
    const { uploadableImage } = this.state;

    const upload = new Slingshot.Upload('groupImageUpload');
    upload.send(uploadableImage, (error, imageUrl) => {
      if (error) {
        console.error('Error uploading:', error);
      } else {
        this.setState(
          {
            uploadedImageUrl: imageUrl,
          },
          () => this.createGroup()
        );
      }
    });
  };

  createGroup = () => {
    const { values, uploadedImageUrl, isPrivate } = this.state;

    Meteor.call(
      'createGroup',
      values,
      uploadedImageUrl,
      isPrivate,
      (error, result) => {
        if (error) {
          console.log('error', error);
          this.setState({
            isLoading: false,
            isError: true,
          });
        } else {
          this.setState({
            isLoading: false,
            newGroupId: result,
            isSuccess: true,
          });
        }
      }
    );
  };

  hideModal = () => this.setState({ modalConfirm: false });
  showModal = () => this.setState({ modalConfirm: true });

  handlePrivateGroupSwitch = () => {
    const { isPrivate } = this.state;
    this.setState({
      isPrivate: !isPrivate,
    });
  };

  render() {
    const { currentUser } = this.props;

    if (!currentUser || !currentUser.isRegisteredMember) {
      return (
        <div style={{ maxWidth: 600, margin: '24px auto' }}>
          <Alert
            message="You have to become a registered member to create a group."
            type="error"
          />
        </div>
      );
    }

    const {
      modalConfirm,
      values,
      isLoading,
      isSuccess,
      newGroupId,
      uploadableImage,
      uploadableImageLocal,
      isPrivate,
    } = this.state;

    isSuccess ? successCreation() : null;

    return (
      <div style={{ padding: 24 }}>
        <h1>Create a Group</h1>

        {currentUser.isRegisteredMember && (
          <div>
            <Row gutter={48}>
              <Col xs={24} sm={24} md={16}>
                <h4 style={{ marginBottom: 0 }}>
                  Private Group? (invite-only)
                </h4>
                <Switch
                  checked={isPrivate}
                  onChange={this.handlePrivateGroupSwitch}
                  style={{ marginBottom: 24 }}
                />
                {isPrivate && (
                  <div>
                    <p>
                      Private groups are only visible by their members, and
                      participation is possible only via invites by their
                      admins. You can <u>not</u> change it to public after
                      you've created it.
                    </p>
                    <p>
                      You will be able to manage the invites after you'll have
                      created the group.
                    </p>
                  </div>
                )}
              </Col>
            </Row>

            <Divider />
          </div>
        )}

        <Row gutter={48}>
          <Col xs={24} sm={24} md={16}>
            <CreateGroupForm
              values={values}
              registerGroupLocally={this.registerGroupLocally}
              setUploadableImage={this.setUploadableImage}
              uploadableImage={uploadableImage}
              places={this.props.places}
            />
          </Col>
        </Row>
        {modalConfirm ? (
          <ModalArticle
            item={values}
            isLoading={isLoading}
            title="Overview The Information"
            imageSrc={uploadableImageLocal}
            visible={modalConfirm}
            okButtonProps={{ loading: isLoading }}
            onOk={this.uploadImage}
            onCancel={this.hideModal}
            okText="Confirm"
            cancelText="Go back and edit"
          />
        ) : null}

        {isSuccess ? <Redirect to={`/group/${newGroupId}`} /> : null}
      </div>
    );
  }
}

export default NewGroup;
