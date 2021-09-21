'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getUploadFilesWithRaw = exports.getUploadFiles = exports.delay = exports.getToken = void 0;
const fs_1 = require('fs');
const path = __importStar(require('path'));
const flat_1 = require('flat');
const tmp = __importStar(require('tmp-promise'));
const readFilePromisify = fs_1.promises.readFile;
const writeFilePromisify = fs_1.promises.writeFile;
function getToken(defaultToken) {
  return process.env.PHRASE_API_TOKEN || defaultToken;
}
exports.getToken = getToken;
const delay = sec => {
  return new Promise(resolve => {
    setTimeout(resolve, sec * 1000);
  });
};
exports.delay = delay;
async function saveToTmp(messages, indent, dryRun) {
  const files = [];
  let dir = null;
  try {
    dir = await tmp.dir();
    const locales = Object.keys(messages);
    for (const locale of locales) {
      const tmpFilePath = path.resolve(dir.path, `${locale}.json`);
      console.log(`save locale message to tmp: ${tmpFilePath}`);
      if (!dryRun) {
        await writeFilePromisify(tmpFilePath, JSON.stringify(messages[locale], null, indent));
      }
      files.push({ locale: locale, path: tmpFilePath });
    }
    return Promise.resolve(files);
  } finally {
    dryRun && (dir === null || dir === void 0 ? void 0 : dir.cleanup());
  }
}
async function getUploadFiles(messages, indent, dryRun, normalize) {
  let dir = null;
  try {
    const files = await saveToTmp(messages, indent, dryRun);
    if (normalize && normalize === 'flat') {
      dir = await tmp.dir();
      const normalizedFiles = [];
      for (const file of files) {
        const orgData = await readFilePromisify(file.path);
        const orgJSON = JSON.parse(orgData.toString());
        const frattedJSON = flat_1.flatten(orgJSON);
        const parsedOrgFile = path.parse(file.path);
        const tmpFilePath = path.resolve(dir.path, parsedOrgFile.base);
        console.log(`normalize locale messages: ${file.path} -> ${tmpFilePath}`);
        if (!dryRun) {
          await writeFilePromisify(tmpFilePath, JSON.stringify(frattedJSON, null, indent));
        }
        normalizedFiles.push({ locale: file.locale, path: tmpFilePath });
      }
      return Promise.resolve(normalizedFiles);
    } else {
      return Promise.resolve(files);
    }
  } finally {
    dryRun && (dir === null || dir === void 0 ? void 0 : dir.cleanup());
  }
}
exports.getUploadFiles = getUploadFiles;
async function getUploadFilesWithRaw(messages, dryRun) {
  const files = [];
  let dir = null;
  try {
    dir = await tmp.dir();
    for (const { locale, format, data } of messages) {
      const tmpFilePath = path.resolve(dir.path, `${locale}.${format}`);
      console.log(`save raw locale message to tmp: ${tmpFilePath}`);
      if (!dryRun) {
        await writeFilePromisify(tmpFilePath, data);
      }
      files.push({ locale, path: tmpFilePath });
    }
    return Promise.resolve(files);
  } finally {
    dryRun && (dir === null || dir === void 0 ? void 0 : dir.cleanup());
  }
}
exports.getUploadFilesWithRaw = getUploadFilesWithRaw;
