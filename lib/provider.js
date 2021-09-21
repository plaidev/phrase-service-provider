'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const flat_1 = require('flat');
const utils_1 = require('./utils');
const api_1 = require('./api');
const debug_1 = require('debug');
const debug = debug_1.debug('phrase-service-provider:provider');
const PHRASE_API_INTERVAL_LIMITATION = 0.3;
function provider(id, token, interval, indent) {
  /**
   *  push
   */
  const push = async args => {
    const { messages, dryRun, normalize, providerArgs } = args;
    dryRun && console.log(`----- PhraseServiceProvider push dryRun mode -----`);
    const results = [];
    const files = await utils_1.getUploadFiles(messages, indent, dryRun, normalize);
    for (const file of files) {
      console.log(`upload '${file.locale}' locale`);
      if (!dryRun) {
        const ret = await api_1.upload(
          file,
          { token, id },
          providerArgs !== undefined ? providerArgs.update : undefined,
          providerArgs !== undefined ? providerArgs.autotranslate : undefined,
        );
        debug(`upload file '${file.path}' result`, ret);
        console.log(`wait ${PHRASE_API_INTERVAL_LIMITATION} sec due to limit Editor API call ...`);
        await utils_1.delay(interval);
        results.push(ret);
      } else {
        await utils_1.delay(1);
        results.push(undefined);
      }
    }
    return Promise.resolve();
  };
  /**
   *  pull
   */
  const pull = async args => {
    const { locales, dryRun, normalize, format } = args;
    dryRun && console.log(`----- PhraseServiceProvider pull dryRun mode -----`);
    const messages = {};
    const fetchLocales = async locales => {
      if (locales.length === 0) {
        console.log('fetch locales');
        return await api_1.getLocales({ token, id });
      } else {
        return await api_1.getLocalesByLocaleName({ token, id }, locales);
      }
    };
    const targetLocales = await fetchLocales(locales);
    for (const locale of targetLocales) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(`fetch '${locale.name}' locale messages`);
      const message = await api_1.exportLocaleMessage({ token, id }, locale.id, format);
      messages[locale.name] = !normalize ? message : flat_1.unflatten(message, { object: true });
    }
    debug('fetch locale messages', messages);
    return Promise.resolve(messages);
  };
  /**
   *  status
   */
  const status = async args => {
    const { locales } = args;
    let languages = await api_1.getLocales({ token, id });
    const translationStatusList = [];
    if (locales.length !== 0) {
      languages = languages.filter(elm => {
        return locales.includes(elm.name);
      });
    }
    for (const lang of languages) {
      const localeDetail = await api_1.getLocaleDetail({ token, id }, lang.id);
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
  };
  /**
   *  import
   */
  const _import = async args => {
    const { messages, dryRun, providerArgs } = args;
    dryRun && console.log(`----- PhraseServiceProvider import dryRun mode -----`);
    const results = [];
    const files = await utils_1.getUploadFilesWithRaw(messages, dryRun);
    for (const file of files) {
      console.log(`upload '${file.locale}' locale`);
      if (!dryRun) {
        const ret = await api_1.upload(
          file,
          { token, id },
          providerArgs !== undefined ? providerArgs.update : undefined,
          providerArgs !== undefined ? providerArgs.autotranslate : undefined,
        );
        debug(`upload file '${file.path}' result`, ret);
        console.log(`wait ${PHRASE_API_INTERVAL_LIMITATION} sec due to limit Editor API call ...`);
        await utils_1.delay(interval);
        results.push(ret);
      } else {
        await utils_1.delay(1);
        results.push(undefined);
      }
    }
    return Promise.resolve();
  };
  /**
   *  export
   */
  const _export = async args => {
    const { locales, dryRun, format } = args;
    dryRun && console.log(`----- PhraseServiceProvider export dryRun mode -----`);
    const messages = [];
    const fetchLocales = async locales => {
      if (locales.length === 0) {
        console.log('fetch locales');
        return await api_1.getLocales({ token, id });
      } else {
        return await api_1.getLocalesByLocaleName({ token, id }, locales);
      }
    };
    const targetLocales = await fetchLocales(locales);
    for (const locale of targetLocales) {
      console.log(`fetch '${locale.name}' raw locale messages`);
      const message = await api_1.exportRawLocaleMessage({ token, id }, locale, format);
      messages.push(message);
    }
    debug('raw locale messages', messages);
    return Promise.resolve(messages);
  };
  return { push, pull, status, import: _import, export: _export };
}
exports.default = provider;
