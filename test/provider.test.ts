import * as path from 'path';
import provider from '../src/provider';
import en from './fixtures/nest/en.json';
import ja from './fixtures/nest/ja.json';

import { RawLocaleMessage } from 'vue-i18n-locale-message';

// ------
// mocks
jest.mock('../src/api');
import * as api from '../src/api';

jest.mock('../src/utils', () => ({
  ...jest.requireActual('../src/utils'),
  getUploadFilesWithRaw: jest.fn(),
}));
import * as utils from '../src/utils';

// --------------------
// setup/teadown hooks

let spyLog: any;
beforeEach(() => {
  spyLog = jest.spyOn(global.console, 'log');
});

afterEach(() => {
  spyLog.mockRestore();
  jest.clearAllMocks();
});

// -----------
// test cases

test('push method', async () => {
  // mocking ...
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.upload.mockImplementation((file, config) => Promise.resolve({ data: {} }));

  // run
  const p = provider('12345', 'xxx', 0.3, 2);
  await p.push({ messages: { en, ja }, dryRun: false });

  // verify
  expect(spyLog).toHaveBeenNthCalledWith(3, `upload 'en' locale`);
  expect(spyLog).toHaveBeenNthCalledWith(4, 'wait 0.3 sec due to limit Editor API call ...');
  expect(spyLog).toHaveBeenNthCalledWith(5, `upload 'ja' locale`);
  expect(spyLog).toHaveBeenNthCalledWith(6, 'wait 0.3 sec due to limit Editor API call ...');
});

test('push method: dryRun mode', async () => {
  // mocking ...
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.upload.mockImplementation((file, config) => Promise.resolve({ data: {} }));

  // run
  const p = provider('12345', 'xxx', 1, 2);
  await p.push({ messages: { en, ja }, dryRun: true });

  // verify
  expect(spyLog).toHaveBeenNthCalledWith(1, '----- PhraseServiceProvider push dryRun mode -----');
  expect(spyLog).toHaveBeenNthCalledWith(4, "upload 'en' locale");
});

test('pull method', async () => {
  // mocking ...
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.getLocalesByLocaleName.mockImplementationOnce(({ token, id }) =>
    Promise.resolve([
      {
        id: 'aaa',
        name: 'en',
      },
    ]),
  );
  apiMock.exportLocaleMessage.mockImplementationOnce(({ token, id }, locale, format) =>
    Promise.resolve({ hello: 'hello' }),
  );

  // run
  const p = provider('12345', 'xxx', 1, 2);
  const resource = await p.pull({ locales: ['en'], format: 'nested_json', dryRun: false });

  // verify
  expect(spyLog).toHaveBeenNthCalledWith(1, `fetch 'en' locale messages`);
  expect(resource).toMatchObject({
    en: { hello: 'hello' },
  });
});

test('pull method: not specify locales', async () => {
  // mocking ...
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.getLocales.mockImplementationOnce(({ token, id }) =>
    Promise.resolve([
      {
        id: 'aaa',
        name: 'en',
      },
      {
        id: 'bbb',
        name: 'ja',
      },
    ]),
  );
  apiMock.exportLocaleMessage.mockImplementationOnce(({ token, id }, locale, format) =>
    Promise.resolve({ hello: 'hello' }),
  );
  apiMock.exportLocaleMessage.mockImplementationOnce(({ token, id }, locale, format) =>
    Promise.resolve({ hello: 'こんにちわっしょい' }),
  );

  // run
  const p = provider('12345', 'xxx', 1, 2);
  const resource = await p.pull({ locales: [], format: 'json', dryRun: true });

  // verify
  expect(spyLog).toHaveBeenNthCalledWith(1, '----- PhraseServiceProvider pull dryRun mode -----');
  expect(spyLog).toHaveBeenNthCalledWith(2, `fetch locales`);
  expect(spyLog).toHaveBeenNthCalledWith(3, `fetch 'en' locale messages`);
  expect(spyLog).toHaveBeenNthCalledWith(4, `fetch 'ja' locale messages`);
  expect(resource).toMatchObject({
    en: { hello: 'hello' },
    ja: { hello: 'こんにちわっしょい' },
  });
});

test('status method', async () => {
  // mocking ...
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.getLocales.mockImplementationOnce(({ token, id }) =>
    Promise.resolve([
      {
        id: 'aaa',
        name: 'en',
      },
      {
        id: 'bbb',
        name: 'ja',
      },
    ]),
  );
  apiMock.getLocaleDetail.mockImplementationOnce(({ token, id }) =>
    Promise.resolve({
      id: 'aaa',
      name: 'en',
      code: 'en-US',
      default: false,
      main: false,
      rtl: false,
      plural_forms: ['zero', 'other'],
      created_at: '2021',
      updated_at: '2021',
      statistics: {
        keys_total_count: 100,
        keys_untranslated_count: 0,
        words_total_count: 0,
        translations_completed_count: 0,
        translations_unverified_count: 0,
        unverified_words_count: 0,
        missing_words_count: 26,
      },
      source_locale: null,
    }),
  );
  apiMock.getLocaleDetail.mockImplementationOnce(({ token, id }) =>
    Promise.resolve({
      id: 'bbb',
      name: 'ja',
      code: 'ja-JP',
      default: false,
      main: false,
      rtl: false,
      plural_forms: ['zero', 'other'],
      created_at: '2021',
      updated_at: '2021',
      statistics: {
        keys_total_count: 100,
        keys_untranslated_count: 28,
        words_total_count: 0,
        translations_completed_count: 0,
        translations_unverified_count: 0,
        unverified_words_count: 0,
        missing_words_count: 26,
      },
      source_locale: null,
    }),
  );

  // run
  const p = provider('12345', 'xxx', 1, 2);
  const resource = await p.status({ locales: [] });

  // verify
  expect(resource).toMatchObject([
    {
      locale: 'en',
      percentage: 100,
    },
    {
      locale: 'ja',
      percentage: 72,
    },
  ]);
});

test('status method: specified locals', async () => {
  // mocking ...
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.getLocales.mockImplementationOnce(({ token, id }) =>
    Promise.resolve([
      {
        id: 'aaa',
        name: 'en',
      },
      {
        id: 'bbb',
        name: 'ja',
      },
    ]),
  );
  apiMock.getLocaleDetail.mockImplementationOnce(({ token, id }) =>
    Promise.resolve({
      id: 'bbb',
      name: 'ja',
      code: 'ja-JP',
      default: false,
      main: false,
      rtl: false,
      plural_forms: ['zero', 'other'],
      created_at: '2021',
      updated_at: '2021',
      statistics: {
        keys_total_count: 100,
        keys_untranslated_count: 28,
        words_total_count: 0,
        translations_completed_count: 0,
        translations_unverified_count: 0,
        unverified_words_count: 0,
        missing_words_count: 26,
      },
      source_locale: null,
    }),
  );
  apiMock.getLocaleDetail.mockImplementationOnce(({ token, id }) =>
    Promise.resolve({
      id: 'aaa',
      name: 'en',
      code: 'en-US',
      default: false,
      main: false,
      rtl: false,
      plural_forms: ['zero', 'other'],
      created_at: '2021',
      updated_at: '2021',
      statistics: {
        keys_total_count: 100,
        keys_untranslated_count: 0,
        words_total_count: 0,
        translations_completed_count: 0,
        translations_unverified_count: 0,
        unverified_words_count: 0,
        missing_words_count: 26,
      },
      source_locale: null,
    }),
  );

  // run
  const p = provider('12345', 'xxx', 1, 2);
  const resource = await p.status({ locales: ['ja'] });

  // verify
  expect(resource).toMatchObject([
    {
      locale: 'ja',
      percentage: 72,
    },
  ]);
});

test('import method', async () => {
  const messages = [
    {
      locale: 'en',
      format: 'json',
      data: Buffer.from(JSON.stringify(en)),
    },
    {
      locale: 'ja',
      format: 'json',
      data: Buffer.from(JSON.stringify(ja)),
    },
  ] as RawLocaleMessage[];

  // mocking ...
  const utilsMock = utils as jest.Mocked<typeof utils>;
  utils.getUploadFilesWithRaw.mockImplementation((messages, dryRun) => {
    return messages.map(({ locale }) => ({ locale, path: `/path/${locale}.json` }));
  });
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.upload.mockImplementation((file, config) => Promise.resolve({ data: {} }));

  // run
  const p = provider('12345', 'xxx', 1, 2);
  await p.import({ messages, dryRun: false });

  // verify
  expect(apiMock.upload).toHaveBeenCalledWith(
    { locale: 'en', path: '/path/en.json' },
    { id: '12345', token: 'xxx' },
    undefined,
  );
  expect(apiMock.upload).toHaveBeenCalledWith(
    { locale: 'ja', path: '/path/ja.json' },
    { id: '12345', token: 'xxx' },
    undefined,
  );
});

test('export method', async () => {
  // mocking ...
  const apiMock = api as jest.Mocked<typeof api>;
  apiMock.getLocales.mockImplementationOnce(({ token, id }) =>
    Promise.resolve([
      {
        id: 'aaa',
        name: 'en',
      },
    ]),
  );
  apiMock.exportRawLocaleMessage.mockImplementationOnce(({ token, id }, locale, format) =>
    Promise.resolve({
      locale: 'en',
      format: 'json',
      data: Buffer.from(JSON.stringify(en)),
    }),
  );

  // run
  const p = provider('12345', 'xxx', 1, 2);
  const messages = await p.export({ locales: [], format: 'json', dryRun: false });

  // verify
  expect(spyLog).toHaveBeenNthCalledWith(1, `fetch locales`);
  expect(spyLog).toHaveBeenNthCalledWith(2, `fetch 'en' raw locale messages`);
  expect(messages).toMatchObject([
    {
      locale: 'en',
      format: 'json',
      data: Buffer.from(JSON.stringify(en)),
    },
  ]);
});
