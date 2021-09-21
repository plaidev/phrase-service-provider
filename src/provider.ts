import { unflatten, flatten } from 'flat';
import { delay, getUploadFiles, getUploadFilesWithRaw } from './utils';
import {
  Locale,
  Provider,
  PullArguments,
  StatusArguments,
  ExportArguments,
  RawLocaleMessage,
  LocaleMessage,
  LocaleMessages,
  TranslationStatus,
} from 'vue-i18n-locale-message';
import {
  upload,
  getLocales,
  getLocalesByLocaleName,
  exportRawLocaleMessage,
  exportLocaleMessage,
  getLocaleDetail,
} from './api';
import {
  PhrasePushArguments as PushArguments,
  PhraseImportArguments as ImportArguments,
} from '../types';

import { debug as Debug } from 'debug';
const debug = Debug('phrase-service-provider:provider');

const PHRASE_API_INTERVAL_LIMITATION = 0.3;

export default function provider(
  id: string,
  token: string,
  interval: number,
  indent: number,
): Provider {
  /**
   *  push
   */
  const push = async (args: PushArguments): Promise<void> => {
    const { messages, dryRun, normalize, providerArgs } = args;

    dryRun && console.log(`----- PhraseServiceProvider push dryRun mode -----`);
    const results = [];
    const files = await getUploadFiles(messages, indent, dryRun, normalize);

    for (const file of files) {
      console.log(`upload '${file.locale}' locale`);
      if (!dryRun) {
        const ret = await upload(file, { token, id }, providerArgs);
        debug(`upload file '${file.path}' result`, ret);
        console.log(`wait ${PHRASE_API_INTERVAL_LIMITATION} sec due to limit Editor API call ...`);
        await delay(interval);
        results.push(ret);
      } else {
        await delay(1);
        results.push(undefined);
      }
    }

    return Promise.resolve();
  };

  /**
   *  pull
   */
  const pull = async (args: PullArguments): Promise<LocaleMessages> => {
    const { locales, dryRun, normalize, format } = args;

    dryRun && console.log(`----- PhraseServiceProvider pull dryRun mode -----`);
    const messages = {} as LocaleMessages;

    const fetchLocales = async (locales: Locale[]) => {
      if (locales.length === 0) {
        console.log('fetch locales');
        return await getLocales({ token, id });
      } else {
        return await getLocalesByLocaleName({ token, id }, locales);
      }
    };

    const targetLocales = await fetchLocales(locales);
    for (const locale of targetLocales) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(`fetch '${locale.name}' locale messages`);
      const message = await exportLocaleMessage({ token, id }, locale.id, format);
      if (normalize === 'flat') {
        messages[locale.name] = flatten(message) as LocaleMessage;
      } else if (normalize === 'hierarchy') {
        messages[locale.name] = unflatten(message, { object: true }) as LocaleMessage;
      } else {
        messages[locale.name] = message as LocaleMessage;
      }
    }
    debug('fetch locale messages', messages);

    return Promise.resolve(messages);
  };

  /**
   *  status
   */
  const status = async (args: StatusArguments): Promise<TranslationStatus[]> => {
    const { locales } = args;
    let languages = await getLocales({ token, id });
    const translationStatusList = [] as TranslationStatus[];
    if (locales.length !== 0) {
      languages = languages.filter(elm => {
        return locales.includes(elm.name);
      });
    }
    for (const lang of languages) {
      const localeDetail = await getLocaleDetail({ token, id }, lang.id);
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
  const _import = async (args: ImportArguments): Promise<void> => {
    const { messages, dryRun, providerArgs } = args;

    dryRun && console.log(`----- PhraseServiceProvider import dryRun mode -----`);
    const results = [];
    const files = await getUploadFilesWithRaw(messages, dryRun);

    for (const file of files) {
      console.log(`upload '${file.locale}' locale`);
      if (!dryRun) {
        const ret = await upload(file, { token, id }, providerArgs);
        debug(`upload file '${file.path}' result`, ret);
        console.log(`wait ${PHRASE_API_INTERVAL_LIMITATION} sec due to limit Editor API call ...`);
        await delay(interval);
        results.push(ret);
      } else {
        await delay(1);
        results.push(undefined);
      }
    }

    return Promise.resolve();
  };

  /**
   *  export
   */
  const _export = async (args: ExportArguments): Promise<RawLocaleMessage[]> => {
    const { locales, dryRun, format } = args;

    dryRun && console.log(`----- PhraseServiceProvider export dryRun mode -----`);
    const messages = [] as RawLocaleMessage[];

    const fetchLocales = async (locales: Locale[]) => {
      if (locales.length === 0) {
        console.log('fetch locales');
        return await getLocales({ token, id });
      } else {
        return await getLocalesByLocaleName({ token, id }, locales);
      }
    };

    const targetLocales = await fetchLocales(locales);
    for (const locale of targetLocales) {
      console.log(`fetch '${locale.name}' raw locale messages`);
      const message = await exportRawLocaleMessage({ token, id }, locale, format);
      messages.push(message);
    }
    debug('raw locale messages', messages);

    return Promise.resolve(messages);
  };

  return { push, pull, status, import: _import, export: _export } as Provider;
}
