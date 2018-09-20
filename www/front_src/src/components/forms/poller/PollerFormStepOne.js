import React, { Component } from "react";
import { Field, reduxForm as connectForm } from "redux-form";
import InputField from "../../form-fields/InputField";
import CheckboxField from "../../form-fields/CheckboxField";
import PasswordInputField from "../../form-fields/PasswordInputField";

import {
  serverNameValidator,
  serverIpAddressValidator,
  centralIpAddressValidator,
} from "../../../helpers/validators";

class PollerFormStepOne extends Component {
  render() {
    const { error, handleSubmit, onSubmit, submitting } = this.props;
    return (
      <div className="form-wrapper">
        <div className="form-inner">
          <div className="form-heading">
            <h2 className="form-title">Server Configuration</h2>
          </div>
          <form autocomplete="off" onSubmit={handleSubmit(onSubmit)}>
            <Field
              name="server_name"
              component={InputField}
              type="text"
              placeholder=""
              label="Server Name:"
            />
            <Field
              name="server_ip"
              component={InputField}
              type="text"
              placeholder=""
              label="Server IP Address:"
            />
            <Field
              name="centreon_central_ip"
              component={InputField}
              type="text"
              placeholder=""
              label="Centreon Central IP Address:"
            />
            <div class="form-buttons">
              <button className="button" type="submit">
                Next
              </button>
            </div>
            {error ? <div class="error-block">{error.message}</div> : null}
          </form>
        </div>
      </div>
    );
  }
}

const validate = server => ({
  server_name: serverNameValidator(server.server_name),
  server_ip: serverIpAddressValidator(server.server_ip),
  centreon_central_ip: centralIpAddressValidator(server.centreon_central_ip),
});

export default connectForm({
  form: "PollerFormStepOne",
  validate,
  warn: () => {},
  enableReinitialize: true
})(PollerFormStepOne);