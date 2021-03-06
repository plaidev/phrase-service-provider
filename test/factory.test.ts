import factory from '../src/factory';
import { ProviderConfiguration } from 'vue-i18n-locale-message';
import { PhraseProviderConfiguration } from '../types';

// ------
// mocks
jest.mock('../src/provider');
import provider from '../src/provider';

// --------------------
// setup/teadown hooks

let orgEnv;
beforeEach(() => {
  orgEnv = process.env;
});

afterEach(() => {
  delete process.env.POEDITOR_API_TOKEN;
  process.env = orgEnv;
  jest.clearAllMocks();
});

// -----------
// test cases

test('basic', () => {
  // mocking ...
  const providerMock = provider as jest.MockedFunction<typeof provider>;
  providerMock.mockReturnValue({ push: jest.fn(), pull: jest.fn() });

  // run
  const conf: ProviderConfiguration<PhraseProviderConfiguration> = {
    provider: {
      token: 'xxx',
      id: '12345',
      interval: 1,
      indent: 4,
    },
  };
  factory(conf);

  // verify
  expect(providerMock).toHaveBeenCalledWith('12345', 'xxx', 1, 4);
});

test('env token', () => {
  // mocking ...
  process.env.PHRASE_API_TOKEN = 'PHRASE_API_TOKEN';
  const providerMock = provider as jest.MockedFunction<typeof provider>;
  providerMock.mockReturnValue({ push: jest.fn(), pull: jest.fn() });

  // run
  const conf: ProviderConfiguration<PhraseProviderConfiguration> = {
    provider: {
      token: 'xxx',
      id: '12345',
    },
  };
  factory(conf);

  // verify
  expect(providerMock).toHaveBeenCalledWith('12345', 'PHRASE_API_TOKEN', 0.3, 2);
});
