/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { Field, reduxForm as connectForm } from 'redux-form';
import Select from 'react-select';
import { withTranslation } from 'react-i18next';
import styles from '../../../styles/partials/form/_form.scss';
import fieldHoc from '../../form-fields/hoc';

class RemoteServerFormStepTwo extends Component {
  state = {
    value: [],
  };

  handleChange = (event, values) => {
    this.setState({ value: values });
  };

  render() {
    const { error, handleSubmit, onSubmit, pollers, t } = this.props;
    const { value } = this.state;

    return (
      <div className={styles['form-wrapper']}>
        <div className={styles['form-inner']}>
          <div className={styles['form-heading']}>
            <h2 className={styles['form-title']}>
              {t('Select pollers to be attached to this new Remote Server')}
            </h2>
          </div>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            {pollers ? (
              <Field
                name="linked_pollers"
                component={fieldHoc(Select)}
                label={`${t('Select linked Remote Server')}:`}
                options={pollers.items.map((c) => ({
                  value: c.id,
                  label: c.text,
                }))}
                value={value}
                onChange={this.handleChange}
                multi
                isMulti
              />
            ) : null}
            {/* <Field
              name="manage_broker_config"
              component={CheckboxField}
              label="Manage automatically Centreon Broker Configuration of selected poller?"
            /> */}
            <div className={styles["form-buttons"]}>
              <button className={styles["button"]} type="submit">
                {t('Apply')}
              </button>
            </div>
            {error ? (
              <div className={styles['error-block']}>{error.message}</div>
            ) : null}
          </form>
        </div>
      </div>
    );
  }
}

const validate = () => ({});

export default connectForm({
  form: 'RemoteServerFormStepTwo',
  validate,
  warn: () => {},
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: true,
})(withTranslation()(RemoteServerFormStepTwo));
