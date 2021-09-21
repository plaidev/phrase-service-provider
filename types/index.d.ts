import { Locale, CommonArguments, LocaleMessages, RawLocaleMessage } from 'vue-i18n-locale-message';

/**
 *  Phrase Provider configuration for vue-i18n-locale-message CLI --conf option
 *  e.g.
 *    {
 *      "provider": {
 *        "token": "xxx",
 *        "id": "12345"
 *      }
 *    }
 */

export type PhraseProviderConfiguration = {
  /**
   *  project id
   */
  id: string;
  /**
   *  API token.
   *  if it's ommitted, use the value of `PHRASE_API_TOKEN` ENV.
   */
  token?: string;
  /**
   *  API call interval (due to limit for API calling, see https://poeditor.com/docs/api_rates).
   *  if it's omitted, internally set 30 sec as default.
   */
  interval?: number;
  /**
   *  Normalize locale messages file indend, default indent 2 space
   */
  indent?: number;
};

export type PhraseLocale = {
  id: string;
  name: string;
  code: string;
  default: boolean;
  main: boolean;
  rtl: boolean;
  plural_forms: string[];
  created_at: string;
  updated_at: string;
  source_locale: string | null;
};

export type PhraseLocaleIdAndName = {
  id: string;
  name: string;
};

export type PhraseLocaleDetail = {
  id: string;
  name: string;
  code: string;
  default: boolean;
  main: boolean;
  rtl: boolean;
  plural_forms: string[];
  source_locale: {
    id: string;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
  statistics: {
    keys_total_count: number;
    keys_untranslated_count: number;
    words_total_count: number;
    translations_completed_count: number;
    translations_unverified_count: number;
    unverified_words_count: number;
    missing_words_count: number;
  };
};

export type PhraseTranslation = {
  id: string;
  content: string;
  unverified: boolean;
  excluded: boolean;
  plural_suffix: any;
  key: {
    id: string;
    name: string;
    plural: boolean;
    data_type: string;
    tags: any;
  };
  created_at: string;
  updated_at: string;
  placeholders: any;
  state: string;
  locale: {
    id: string;
    name: Locale;
    code: string;
  };
};

export type UploadFileInfo = {
  locale: Locale;
  path: string;
};

export type PhraseUploadResponse = {
  id: string;
  filename: string;
  format: string;
  state: string;
  tag: string;
  summary: {
    locales_created: number;
    translation_keys_created: number;
    translation_keys_updated: number;
    translation_keys_unmentioned: number;
    translations_created: number;
    translations_updated: number;
    tags_created: number;
    translation_keys_ignored: number;
  };
  created_at: string;
  updated_at: string;
};

export type ExportLocaleMessageResponse = {
  locale: string;
  format: string;
  data: Buffer;
};

type PhraseProviderArgs = {
  update?: boolean;
  deleteKey?: boolean;
  autotranslate?: boolean;
};

type PhraseCommonArguments = CommonArguments<PhraseProviderArgs>;

export type PhrasePushArguments = {
  messages: LocaleMessages;
} & PhraseCommonArguments;

export type PhraseImportArguments = {
  messages: RawLocaleMessage[];
} & PhraseCommonArguments;
