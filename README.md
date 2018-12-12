auditmyci
======================

    A command line tool to audit your dependencies during your CI.

It help you to fail your CI build when vulnaribilities are found in your dependencies.

### Installation

Depending on your package manager:

- with NPM:
```
npm install --save-dev auditmyci
```

- with Yarn:
```
yarn add -D auditmyci
```


### Usage

Now that you installed it, you can use it:

- with NPM:
```
npx auditmyci
```

- with Yarn:
```
yarn auditmyci
```

#### Options:
Options | What it does | Default
|--|--|--|
| ```-c, --critical``` | Exit if there are critical vulnerabilities | true
| ```-h, --high``` | Exit if there are high or critical vulnerabilities | false
| ```-l, --low``` | Exit if there are low or higher vulnerabilities | false
| ```-m, --moderate``` | Exit if there are moderate or higher vulnerabilities | false
| ```-r, --report``` | Show the `audit --json` report | false
| ```-s, --succeed``` | Let your CI succeed even if there are vulnerabilities | false
| ```--help``` | Show help | false


### License
See [License](https://github.com/brainlulz/auditmyci/blob/master/LICENSE)

Inspired by:
[npm-audit-ci](https://github.com/revathskumar/npm-audit-ci) from Revath S Kumar
[audit-ci](https://github.com/IBM/audit-ci) from IBM
