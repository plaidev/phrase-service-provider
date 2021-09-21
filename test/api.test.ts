import * as path from 'path';

// ------
// mocks
jest.mock('axios');
import axios from 'axios';
import {
  getLocales,
  getLocalesByLocaleName,
  exportLocaleMessage,
  exportRawLocaleMessage,
  upload,
  getLocaleDetail,
} from '../src/api';

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

test('getLocales', async () => {
  // mocking ...
  const axiosMock = axios as jest.Mocked<typeof axios>;
  axiosMock.get.mockImplementationOnce((url, config) =>
    Promise.resolve({
      data: [
        {
          id: 'aaa',
          name: 'en',
        },
        {
          id: 'bbb',
          name: 'ja',
        },
      ],
    }),
  );

  // run
  const locales = await getLocales({ token: 'xxx', id: '12345' });

  // verify
  expect(locales).toEqual([
    {
      id: 'aaa',
      name: 'en',
    },
    {
      id: 'bbb',
      name: 'ja',
    },
  ]);
});

test('getLocalesByLocalName', async () => {
  // mocking ...
  const axiosMock = axios as jest.Mocked<typeof axios>;
  axiosMock.get.mockImplementationOnce((url, config) =>
    Promise.resolve({
      data: [
        {
          id: 'aaa',
          name: 'en',
        },
        {
          id: 'bbb',
          name: 'ja',
        },
      ],
    }),
  );

  // run
  const locales = await getLocalesByLocaleName({ token: 'xxx', id: '12345' }, ['en']);

  // verify
  expect(locales).toEqual([
    {
      id: 'aaa',
      name: 'en',
    },
  ]);
});

test('getLocaleDetail', async () => {
  // mocking ...
  const axiosMock = axios as jest.Mocked<typeof axios>;
  axiosMock.get.mockImplementationOnce((url, config) =>
    Promise.resolve({
      data: {
        id: 'aaa',
        name: 'en',
        statistics: {
          keys_total_count: 100,
          keys_untranslated_count: 50,
        },
      },
    }),
  );

  // run
  const locales = await getLocaleDetail({ token: 'xxx', id: '12345' }, 'aaa');

  // verify
  expect(locales).toEqual({
    id: 'aaa',
    name: 'en',
    statistics: {
      keys_total_count: 100,
      keys_untranslated_count: 50,
    },
  });
});

test('exportRawLocaleMessage', async () => {
  // mocking ...
  const resData = { hello: 'hello' };
  const localeIdAndName = {
    id: 'aaa',
    name: 'en',
  };
  const axiosMock = axios as jest.Mocked<typeof axios>;
  axiosMock.get.mockImplementationOnce(({ id, token }, data, config) =>
    Promise.resolve({ data: resData }),
  );
  const messages = await exportRawLocaleMessage(
    { token: 'xxx', id: '12345' },
    localeIdAndName,
    'json',
  );

  expect(messages).toEqual({
    locale: 'en',
    format: 'json',
    data: Buffer.from(JSON.stringify(resData)),
  });
});

test('exportLocaleMessage', async () => {
  // mocking ...
  const axiosMock = axios as jest.Mocked<typeof axios>;
  axiosMock.get.mockImplementationOnce(url =>
    Promise.resolve({
      data: {
        hello: 'hello',
      },
    }),
  );

  const messages = await exportLocaleMessage({ token: 'xxx', id: '12345' }, 'aaa', 'json');

  expect(messages).toEqual({ hello: 'hello' });
});

test('upload', async () => {
  // mocking ...
  const axiosMock = axios as jest.Mocked<typeof axios>;
  axiosMock.post.mockImplementationOnce((url, data, config) =>
    Promise.resolve({ data: { result: {} } }),
  );

  // run
  const res = await upload(
    {
      locale: 'en',
      path: path.resolve('./test/fixtures/en.json'),
    },
    {
      token: 'xxx',
      id: '12345',
    },
  );

  // verify
  expect(res).toEqual({ result: {} });
});
