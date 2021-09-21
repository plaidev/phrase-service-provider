'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = require('./utils');
const provider_1 = __importDefault(require('./provider'));
const factory = configration => {
  const id = configration.provider.id;
  const token = utils_1.getToken(configration.provider.token);
  const indent = configration.provider.indent || 2;
  const interval = configration.provider.interval || 0.3;
  if (!token) {
    throw new Error('not specified token!');
  }
  return provider_1.default(id, token, interval, indent);
};
exports.default = factory;
