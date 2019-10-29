import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import axios from '../axios';

const translationService = axios(
  'internal.php?object=centreon_i18n&action=translation',
);
const userService = axios(
  'internal.php?object=centreon_topcounter&action=user',
);

function loadTranslations(callback) {
  const localePromise = userService.get();
  const translationsPromise = translationService.get();

  Promise.all([localePromise, translationsPromise])
    .then((response) => {
      let { locale } = response[0].data;
      locale = locale !== null ? locale.slice(0, 2) : navigator.language;

      const translations = {};
      Object.keys(response[1].data).forEach((lang) => {
        translations[lang] = {
          translations: response[1].data[lang],
        };
      });

      i18n.use(initReactI18next).init({
        // we init with resources
        resources: translations,
        fallbackLng: [locale, 'en'],
        debug: true,

        // have a common namespace used around the full app
        ns: ['translations'],
        defaultNS: 'translations',

        nsSeparator: false,
        keySeparator: false, // we use content as keys

        interpolation: {
          escapeValue: false,
        },
      });

      callback();
    })
    .catch((error) => {
      if (error.response.status === 401) {
        // redirect to login page
        window.location.href = 'index.php?disconnect=1';
      }
    });
}

export default loadTranslations;
