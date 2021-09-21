'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.upload = exports.exportLocaleMessage = exports.exportRawLocaleMessage = exports.getTranslationStatus = exports.getLocaleDetail = exports.getLocalesByLocaleName = exports.getLocales = void 0;
const fs = __importStar(require('fs'));
const form_data_1 = __importDefault(require('form-data'));
const axios_1 = __importDefault(require('axios'));
const debug_1 = require('debug');
const debug = debug_1.debug('phrase-service-provider:api');
const PHRASE_API_BASE_URL = 'https://api.phrase.com/v2';
async function getLocaleList(config) {
  if (!config.token) {
    return Promise.reject(new Error('invalid `config.token` param'));
  }
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `token ${config.token}`,
  };
  const res = await axios_1.default.get(`${PHRASE_API_BASE_URL}/projects/${config.id}/locales`, {
    headers,
  });
  debug('fetch languages:', res.data);
  return Promise.resolve(res.data);
}
async function getLocales(config) {
  const languages = await getLocaleList(config);
  return new Promise(resolve => {
    const phraseLocaleIdAndName = [];
    for (const lang of languages) {
      phraseLocaleIdAndName.push({ id: lang.id, name: lang.name });
    }
    resolve(phraseLocaleIdAndName);
  });
}
exports.getLocales = getLocales;
async function getLocalesByLocaleName(config, locales) {
  const languages = await getLocales(config);
  const phraseLocaleIdAndName = [];
  for (const lang of languages) {
    if (locales.includes(lang.name)) {
      phraseLocaleIdAndName.push({ id: lang.id, name: lang.name });
    }
  }
  return Promise.resolve(phraseLocaleIdAndName);
}
exports.getLocalesByLocaleName = getLocalesByLocaleName;
async function getLocaleDetail(config, localeId) {
  if (!config.token) {
    return Promise.reject(new Error('invalid `config.token` param'));
  }
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `token ${config.token}`,
  };
  const res = await axios_1.default.get(
    `${PHRASE_API_BASE_URL}/projects/${config.id}/locales/${localeId}`,
    {
      headers,
    },
  );
  return Promise.resolve(res.data);
}
exports.getLocaleDetail = getLocaleDetail;
async function getTranslationStatus(config, locales, languages) {
  const translationStatusList = [];
  if (locales.length !== 0) {
    languages.filter(elm => {
      if (locales.includes(elm.name)) {
        return elm.name;
      }
    });
  }
  for (const lang of languages) {
    const localeDetail = await getLocaleDetail(config, lang.id);
    translationStatusList.push({
      locale: localeDetail.name,
      percentage:
        (1 -
          localeDetail.statistics.keys_untranslated_count /
            localeDetail.statistics.keys_total_count) *
        100,
    });
  }
  return Promise.resolve(translationStatusList);
}
exports.getTranslationStatus = getTranslationStatus;
async function exportRawLocaleMessage(config, locale, format) {
  if (!config.token) {
    return Promise.reject(new Error('invalid `config.token` param'));
  }
  const data = {
    file_format: format === 'json' ? 'nested_json' : format,
  };
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `token ${config.token}`,
  };
  const res = await axios_1.default.get(
    `${PHRASE_API_BASE_URL}/projects/${config.id}/locales/${locale.id}/download`,
    Object.assign({ params: data }, { headers: headers }),
  );
  const raw = JSON.stringify(res.data);
  return Promise.resolve({
    locale: locale.name,
    format,
    data: Buffer.from(raw, 'utf-8'),
  });
}
exports.exportRawLocaleMessage = exportRawLocaleMessage;
async function exportLocaleMessage(config, localeId, format) {
  if (!config.token) {
    return Promise.reject(new Error('invalid `config.token` param'));
  }
  const data = {
    file_format: format === 'json' ? 'nested_json' : format,
  };
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `token ${config.token}`,
  };
  const res = await axios_1.default.get(
    `${PHRASE_API_BASE_URL}/projects/${config.id}/locales/${localeId}/download`,
    Object.assign({ params: data }, { headers: headers }),
  );
  return Promise.resolve(res.data);
}
exports.exportLocaleMessage = exportLocaleMessage;
async function upload(fileInfo, config, update, autotranslate) {
  const file = fs.createReadStream(fileInfo.path);
  const data = new form_data_1.default();
  data.append('file', file);
  data.append('locale_id', fileInfo.locale);
  data.append('file_format', 'nested_json');
  if (update !== undefined) {
    data.append('update_translations', update);
  }
  if (autotranslate !== undefined) {
    data.append('autotranslate', autotranslate);
  }
  const formHeader = data.getHeaders();
  const res = await axios_1.default.post(
    `${PHRASE_API_BASE_URL}/projects/${config.id}/uploads`,
    data,
    {
      headers: Object.assign(formHeader, { Authorization: `token ${config.token}` }),
    },
  );
  return Promise.resolve(res.data);
}
exports.upload = upload;
