import { unflatten } from 'flat';
import { getToken, getUploadFiles, getUploadFilesWithRaw } from '../src/utils';
import en from './fixtures/nest/en.json';
import ja from './fixtures/nest/ja.json';
import { RawLocaleMessage } from 'vue-i18n-locale-message';

// ------
// mocks

// fs module
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));
import fs from 'fs';

// --------------------
// setup/teadown hooks

let orgEnv: NodeJS.ProcessEnv;
beforeEach(() => {
  orgEnv = process.env;
});

afterEach(() => {
  delete process.env.PHRASE_API_TOKEN;
  process.env = orgEnv;
  jest.clearAllMocks();
});

// -----------
// test cases

test('getToken: return env token', () => {
  // setup
  process.env.PHRASE_API_TOKEN = 'PHRASE_API_TOKEN';

  expect(getToken('xxx')).toEqual('PHRASE_API_TOKEN');
});

test('getToken: return param token', () => {
  expect(getToken('xxx')).toEqual('xxx');
});

test('getUploadFiles: no normalization', async () => {
  const messages = { en, ja };
  const writeFiles = {};

  // mocking ...
  const mockFS = fs as jest.Mocked<typeof fs>;
  mockFS.promises.writeFile.mockImplementation((p, data) => {
    writeFiles[p as string] = data;
    return Promise.resolve();
  });

  // run
  const uploadFiles = await getUploadFiles(messages, 2, false);

  // verify
  uploadFiles.forEach(file => {
    const orgData = messages[file.locale];
    const savedDate = JSON.parse(writeFiles[file.path]);
    expect(orgData).toMatchObject(savedDate);
  });
});

test('getUploadFiles: normalization', async () => {
  const messages = { en, ja };
  const writeFiles = {};

  // mocking ...
  const mockFS = fs as jest.Mocked<typeof fs>;
  mockFS.promises.writeFile.mockImplementation((p, data) => {
    writeFiles[p as string] = data;
    return Promise.resolve();
  });
  mockFS.promises.readFile.mockImplementationOnce(p =>
    Promise.resolve(Buffer.from(JSON.stringify(en), 'utf-8')),
  );
  mockFS.promises.readFile.mockImplementationOnce(p =>
    Promise.resolve(Buffer.from(JSON.stringify(ja), 'utf-8')),
  );

  // run
  const uploadFiles = await getUploadFiles(messages, 2, false, 'flat');

  // verify
  uploadFiles.forEach(file => {
    const orgData = messages[file.locale];
    const normalizeData = unflatten(JSON.parse(writeFiles[file.path]));
    expect(orgData).toMatchObject(normalizeData);
  });
});

test('getUploadFilesWithRaw', async () => {
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
  const writeFiles = {};

  // mocking ...
  const mockFS = fs as jest.Mocked<typeof fs>;
  mockFS.promises.writeFile.mockImplementation((p, data) => {
    writeFiles[p as string] = data;
    return Promise.resolve();
  });

  // run
  const uploadFiles = await getUploadFilesWithRaw(messages, false);

  // verify
  expect(writeFiles[uploadFiles[0].path]).toEqual(messages[0].data);
  expect(writeFiles[uploadFiles[1].path]).toEqual(messages[1].data);
});
