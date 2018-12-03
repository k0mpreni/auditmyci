#!/usr/bin/env node

'use strict';

const exec = require('child_process').exec;
const process = require('process');
const fs = require('fs');

const yarnFiles = fs.existsSync('./yarn.lock');
const npmFiles =
  fs.existsSync('./npm-shrinkwrap.json') ||
  fs.existsSync('./package-lock.json');
const packageManager = npmFiles ? 'npm' : 'yarn';

const program = require('commander')
  .option('-l, --low [boolean]', 'Exit if there are low or higher vulnerabilities')
  .option('-m, --moderate [boolean]', 'Exit if there are low or higher vulnerabilities')
  .option('-hi, --high [boolean]', 'Exit if there are high or critical vulnerabilities')
  .option('-c, --critical [boolean]', 'Exit if there are critical vulnerabilities', {
    isDefault: true
  })
  .option('-r, --report [boolean]', 'Show the audit report')
  .parse(process.argv)

const parseMessage = (output, options = {}) => {
  if (options.critical && output.critical > 0) {
    return 'critical';
  }

  if (options.high && (output.critical > 0 || output.high > 0)) {
    return 'high';
  }

  if (
    options.moderate &&
    (output.critical > 0 || output.high > 0 || output.moderate > 0)
  ) {
    return 'moderate';
  }

  if (
    options.low &&
    (output.critical > 0 ||
      output.high > 0 ||
      output.moderate > 0 ||
      output.low > 0)
  ) {
    return 'low';
  }
  return '';
};

const parseOutput = output => {
  if (packageManager === 'yarn') {
    const stdoutJSON = output.split('\n');
    return JSON.parse(stdoutJSON[stdoutJSON.length - 2]).data.vulnerabilities;
  }
  return JSON.parse(output).metadata.vulnerabilities;
};

const run = () => {
  if (npmFiles && yarnFiles) {
    console.log(
      'You have a package-lock.json or a npm-shrinkwrap.json file, and a yarn.lock file. Please use only one package manager.'
    );
    process.exit(1);
  }
  if (!npmFiles && !yarnFiles) {
    console.log(
      'You have no lock file. Either you are not using a package manager or your package manager is not supported yet.'
    );
  }
  exec(`${packageManager} audit --json`, function (error, stdout, stderr) {
    if (stdout) {
      const vulnerabilities = parseOutput(stdout);
      const totalVulnerabilities =
        vulnerabilities.critical +
        vulnerabilities.high +
        vulnerabilities.moderate +
        vulnerabilities.low;

      if (totalVulnerabilities === 0) {
        if (program.report) {
          console.log(stdout);
        }
        return console.log('\x1b[32m', 'SUCCESS: No vulnerability found');
      }

      if (program.report) {
        console.log(stdout);
      }

      const severityType = parseMessage(vulnerabilities, program);
      switch (severityType) {
        case 'critical':
        case 'high':
        case 'moderate':
        case 'low':
          const message = `FAILURE: ${totalVulnerabilities} total vulnerability(ies)`;

          console.log('\x1b[31m', message);
          process.exit(1);
          return;
        case '':
        default:
          if (program.report) {
            console.log(stdout);
          }

          console.log("\x1b[32m", 'SUCCESS: No vulnerability found');

          return;
      }
    }
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

module.exports = run();