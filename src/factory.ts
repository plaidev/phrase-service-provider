import { getToken } from './utils';
import provider from './provider';

import { Provider, ProviderConfiguration } from 'vue-i18n-locale-message';
import { PhraseProviderConfiguration } from '../types';

const factory = (configration: ProviderConfiguration<PhraseProviderConfiguration>): Provider => {
  const id = configration.provider.id;
  const token = getToken(configration.provider.token);
  const indent = configration.provider.indent || 2;
  const interval = configration.provider.interval || 0.3;

  if (!token) {
    throw new Error('not specified token!');
  }

  return provider(id, token, interval, indent);
};

export default factory;
