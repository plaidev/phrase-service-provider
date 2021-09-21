# phrase-service-provider

Phrase service provider for [vue-i18n-locale-message](https://github.com/kazupon/vue-i18n-locale-message)

## Installation

```bash
$ yarn install
```

## :rocket: Usages

### Configurations

Before you use this provider, you need to configure the following:

```json5
{
  provider: {
    id: '12345', // your Phrase project id
    token: 'xxx...', // your Phrase API token, if it's ommitted, use the value of `PHRASE_API_TOKEN` ENV
  },
}
```

About details, See the [`PhraseProviderConfiguration`](https://github.com/plaidev/karte-io-systems/tree/develop/tools/phrase-service-provider/types/index.d.ts).

### Push the locale messages to Phrase

```bash
$ vue-i18n-locale-message push --provider=phrase-service-provider \
    --conf ./phrase-service-provider-conf.json \
    --target-paths=./src/locales/*.json \
    --filename-match=^([\\w]*)\\.json
```

### Pull the locale messages from Phrase

```bash
$ vue-i18n-locale-message pull --provider=phrase-service-provider \
    --conf ./phrase-service-provider-conf.json \
    --output=./src/locales
```

### Indicate translation status from Phrase

```bash
$ vue-i18n-locale-message status --provider=phrase-service-provider \
  --conf=phrase-service-provider-conf.json
```

### Diff locale messages between local and phrase

```bash
vue-i18n-locale-message diff --provider=phrase-service-provider \
  --conf=phrase-service-provider-conf.json \
  --target-paths=./src/locales/*.json \
  --filename-match=^([\\w]*)\\.json
```

### Import the locale messages to Phrase

```bash
$ vue-i18n-locale-message import --provider=phrase-service-provider \
    --conf ./phrase-service-provider-conf.json \
    --target=./src/locales/ja.json \
    --format=json
```

### Export the locale messages from Phrase

```bash
$ vue-i18n-locale-message export --provider=phrase-service-provider \
    --conf ./phrase-service-provider-conf.json \
    --output=./src/locales
```

## :warning: Do you have a hierarchical locale message?

phrase will process locale messages with hierarchical structure as `context`.

Therefore, we need to normalize with flat structure , and push it to phrase.

```bash
$ vue-i18n-locale-message push --provider=phrase-service-provider \
    --conf ./phrase-service-provider-conf.json \
    --target-paths=./src/locales/*.json \
    --nomalize=flat \
    --filename-match=^([\\w]*)\\.json
```

And also, when pulling data from phrase, it need to normalize from flat structure to hierarchical structure.

```bash
$ vue-i18n-locale-message pull --provider=phrase-service-provider \
    --conf ./phrase-service-provider-conf.json \
    --nomalize=hierarchy \
    --output=./src/locales
```
