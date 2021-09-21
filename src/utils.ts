import { promises as fs } from 'fs';
import * as path from 'path';
import { flatten } from 'flat';
import * as tmp from 'tmp-promise';

import { UploadFileInfo } from '../types';
import { LocaleMessages, Locale, RawLocaleMessage } from 'vue-i18n-locale-message';

const readFilePromisify = fs.readFile;
const writeFilePromisify = fs.writeFile;

export function getToken(defaultToken?: string): string | undefined {
  return process.env.PHRASE_API_TOKEN || defaultToken;
}

export const delay = (sec: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, sec * 1000);
  });
};

async function saveToTmp(
  messages: LocaleMessages,
  indent: number,
  dryRun: boolean,
): Promise<UploadFileInfo[]> {
  const files = [] as UploadFileInfo[];
  let dir: any = null;
  try {
    dir = await tmp.dir();
    const locales = Object.keys(messages) as Locale[];
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
    dryRun && dir?.cleanup();
  }
}

export async function getUploadFiles(
  messages: LocaleMessages,
  indent: number,
  dryRun: boolean,
  normalize?: string,
): Promise<UploadFileInfo[]> {
  let dir: any = null;
  try {
    const files = await saveToTmp(messages, indent, dryRun);
    if (normalize && normalize === 'flat') {
      dir = await tmp.dir();
      const normalizedFiles = [] as UploadFileInfo[];
      for (const file of files) {
        const orgData = await readFilePromisify(file.path);
        const orgJSON = JSON.parse(orgData.toString());
        const frattedJSON = flatten(orgJSON);
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
    dryRun && dir?.cleanup();
  }
}

export async function getUploadFilesWithRaw(
  messages: RawLocaleMessage[],
  dryRun: boolean,
): Promise<UploadFileInfo[]> {
  const files = [] as UploadFileInfo[];
  let dir: any = null;
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
    dryRun && dir?.cleanup();
  }
}
