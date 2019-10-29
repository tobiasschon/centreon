import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';

import pollerWizardReducer from './pollerWizardReducer';
import navigationReducer from './navigationReducer';
import refreshReducer from './refreshReducer';
import axiosReducer from './axiosReducer';
import externalComponentsReducer from './externalComponentsReducer';
import tooltipReducer from './tooltipReducer';
import bamConfigurationReducer from './bamConfigurationReducer';
import globalsReducer from './globalsReducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  form: formReducer,
  pollerForm: pollerWizardReducer,
  navigation: navigationReducer,
  intervals: refreshReducer,
  remoteData: axiosReducer,
  externalComponents: externalComponentsReducer,
  tooltip: tooltipReducer,
  bamConfiguration:bamConfigurationReducer,
  globals:globalsReducer
});
