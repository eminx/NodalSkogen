import React from 'react';
import ReactQuill from 'react-quill';
import { editorFormats, editorModules } from '../themes/skogen';
import { Form, Input, Button, Divider } from 'antd/lib';
const FormItem = Form.Item;

class CreatePageForm extends React.Component {
  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        console.log(err);
        return;
      }

      const values = {
        title: fieldsValue['title'],
        longDescription: fieldsValue['longDescription']
      };

      if (!err) {
        this.props.registerPageLocally(values);
      }
    });
  };

  validateTitle = (rule, value, callback) => {
    const { form, pageData, pageTitles } = this.props;

    let pageExists = false;
    if (
      pageTitles &&
      value &&
      (pageTitles.some(title => title.toLowerCase() === value.toLowerCase()) &&
        pageData.title.toLowerCase() !== value.toLowerCase())
    ) {
      pageExists = true;
    }

    if (pageExists) {
      callback('A page with this title already exists');
    } else if (value.length < 4) {
      callback('Title has to be at least 4 characters');
    } else {
      callback();
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { pageData } = this.props;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 }
    };

    return (
      <div className="create-gathering-form">
        <h3>Please enter the details below</h3>
        <Divider />

        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="Title">
            {getFieldDecorator('title', {
              rules: [
                {
                  required: true,
                  message: 'Please enter the Title'
                },
                {
                  validator: this.validateTitle
                }
              ],
              initialValue: pageData ? pageData.title : null
            })(<Input placeholder="Page title" />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Description">
            {getFieldDecorator('longDescription', {
              rules: [
                {
                  required: true,
                  message: 'Please enter a detailed description'
                }
              ],
              initialValue: pageData ? pageData.longDescription : null
            })(<ReactQuill modules={editorModules} formats={editorFormats} />)}
          </FormItem>

          <FormItem
            wrapperCol={{
              xs: { span: 24, offset: 0 },
              sm: { span: 16, offset: 8 }
            }}
          >
            <Button type="primary" htmlType="submit">
              Continue
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(CreatePageForm);
