import * as fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

import { debug as Debug } from 'debug';
const debug = Debug('phrase-service-provider:api');

import { Locale, TranslationStatus } from 'vue-i18n-locale-message';
import {
  PhraseProviderConfiguration,
  PhraseLocale,
  UploadFileInfo,
  PhraseLocaleIdAndName,
  PhraseLocaleDetail,
  PhraseUploadResponse,
  ExportLocaleMessageResponse,
  PhraseProviderArgs,
} from '../types';

const PHRASE_API_BASE_URL = 'https://api.phrase.com/v2';

async function getLocaleList(config: PhraseProviderConfiguration) {
  if (!config.token) {
    return Promise.reject(new Error('invalid `config.token` param'));
  }
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `token ${config.token}`,
  };
  const res = await axios.get(`${PHRASE_API_BASE_URL}/projects/${config.id}/locales`, { headers });
  debug('fetch languages:', res.data);
  return Promise.resolve(res.data as PhraseLocale[]);
}

export async function getLocales(
  config: PhraseProviderConfiguration,
): Promise<PhraseLocaleIdAndName[]> {
  const languages = await getLocaleList(config);
  return new Promise<PhraseLocaleIdAndName[]>(resolve => {
    const phraseLocaleIdAndName = [] as PhraseLocaleIdAndName[];
    for (const lang of languages) {
      phraseLocaleIdAndName.push({ id: lang.id, name: lang.name });
    }
    resolve(phraseLocaleIdAndName);
  });
}

export async function getLocalesByLocaleName(
  config: PhraseProviderConfiguration,
  locales: Locale[],
): Promise<PhraseLocaleIdAndName[]> {
  const languages = await getLocales(config);
  const phraseLocaleIdAndName = [] as PhraseLocaleIdAndName[];
  for (const lang of languages) {
    if (locales.includes(lang.name)) {
      phraseLocaleIdAndName.push({ id: lang.id, name: lang.name });
    }
  }
  return Promise.resolve(phraseLocaleIdAndName);
}

export async function getLocaleDetail(
  config: PhraseProviderConfiguration,
  localeId: string,
): Promise<PhraseLocaleDetail> {
  if (!config.token) {
    return Promise.reject(new Error('invalid `config.token` param'));
  }
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `token ${config.token}`,
  };
  const res = await axios.get(`${PHRASE_API_BASE_URL}/projects/${config.id}/locales/${localeId}`, {
    headers,
  });
  return Promise.resolve(res.data as PhraseLocaleDetail);
}

export async function getTranslationStatus(
  config: PhraseProviderConfiguration,
  locales: Locale[],
  languages: PhraseLocaleIdAndName[],
): Promise<TranslationStatus[]> {
  const translationStatusList = [] as TranslationStatus[];
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

export async function exportRawLocaleMessage(
  config: PhraseProviderConfiguration,
  locale: PhraseLocaleIdAndName,
  format: string,
): Promise<ExportLocaleMessageResponse> {
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
  const res = await axios.get(
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

export async function exportLocaleMessage(
  config: PhraseProviderConfiguration,
  localeId: Locale,
  format: string,
): Promise<unknown> {
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
  const res = await axios.get(
    `${PHRASE_API_BASE_URL}/projects/${config.id}/locales/${localeId}/download`,
    Object.assign({ params: data }, { headers: headers }),
  );
  return Promise.resolve(res.data);
}

export async function upload(
  fileInfo: UploadFileInfo,
  config: PhraseProviderConfiguration,
  options: PhraseProviderArgs = {},
): Promise<PhraseUploadResponse> {
  const file = fs.createReadStream(fileInfo.path);
  const data = new FormData();
  data.append('file', file);
  data.append('locale_id', fileInfo.locale);
  data.append('file_format', 'nested_json');
  options.update != null && data.append('update_translations', options.update);
  options.autotranslate != null && data.append('autotranslate', options.autotranslate);
  const formHeader = data.getHeaders();
  const res = await axios.post(`${PHRASE_API_BASE_URL}/projects/${config.id}/uploads`, data, {
    headers: Object.assign(formHeader, { Authorization: `token ${config.token}` }),
  });
  return Promise.resolve(res.data as PhraseUploadResponse);
}
