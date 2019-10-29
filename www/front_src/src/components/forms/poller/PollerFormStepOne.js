/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable import/no-named-as-default */

import React, { Component } from 'react';
import { Field, reduxForm as connectForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import styles from '../../../styles/partials/form/_form.scss';
import InputField from '../../form-fields/InputField';

import {
  serverNameValidator,
  serverIpAddressValidator,
  centralIpAddressValidator,
} from '../../../helpers/validators';

class PollerFormStepOne extends Component {
  render() {
    const { error, handleSubmit, onSubmit, t } = this.props;

    return (
      <div className={styles['form-wrapper']}>
        <div className={styles['form-inner']}>
          <div className={styles['form-heading']}>
            <h2 className={styles['form-title']}>
              {t('Server Configuration')}
            </h2>
          </div>
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <Field
              name="server_name"
              component={InputField}
              type="text"
              placeholder=""
              label={`${t('Server Name')}:`}
            />
            <Field
              name="server_ip"
              component={InputField}
              type="text"
              placeholder=""
              label={`${t('Server IP address')}:`}
            />
            <Field
              name="centreon_central_ip"
              component={InputField}
              type="text"
              placeholder=""
              label={`${t(
                'Centreon Central IP address, as seen by this server',
              )}:`}
            />
            <div className={styles['form-buttons']}>
              <button className={styles.button} type="submit">
                {t('Next')}
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

const validate = (server) => ({
  server_name: serverNameValidator(server.server_name),
  server_ip: serverIpAddressValidator(server.server_ip),
  centreon_central_ip: centralIpAddressValidator(server.centreon_central_ip),
});

export default connectForm({
  form: 'PollerFormStepOne',
  validate,
  warn: () => {},
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: true,
})(withTranslation()(PollerFormStepOne));
