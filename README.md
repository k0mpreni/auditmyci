auditmyci
======================

    A command line tool to audit your dependencies during your CI.

It help you to fail your CI build when vulnaribilities are found in your dependencies.

### Installation

Depending on your package manager:

- with NPM:
```
npm install auditmyci
```

- with Yarn:
```
yarn add auditmyci
```


### Usage

Now that you installed it, you can use it:

- with NPM:
```
npm auditmyci
```

- with Yarn:
```
yarn auditmyci
```

#### Options:
Options | What it does | Default
|--|--|--|
| ```-l, --low``` | Exit if there are low or higher vulnerabilities | false
| ```-m, --moderate``` | Exit if there are moderate or higher vulnerabilities | false
| ```-hi, --high``` | Exit if there are high or critical vulnerabilities | false
| ```-c, --critical``` | Exit if there are critical vulnerabilities | true
| ```-r, --report``` | Show the audit report | false
| ```--help``` | Show help | false
### License

See [License](https://github.com/brainlulz/auditmyci/blob/master/LICENSE)

Inspired by [npm-audit-ci](https://github.com/brainlulz/npm-audit-ci) from Revath S Kumar