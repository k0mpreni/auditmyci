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
  .option('-c, --critical [boolean]', 'Exit if there are critical vulnerabilities', {
    isDefault: true
  })
  .option('-h, --high [boolean]', 'Exit if there are high or critical vulnerabilities')
  .option('-l, --low [boolean]', 'Exit if there are low or higher vulnerabilities')
  .option('-m, --moderate [boolean]', 'Exit if there are low or higher vulnerabilities')
  .option('-r, --report [boolean]', 'Show the audit --json report')
  .option('-s, --succeed [boolean]', 'Let your CI succeed even if there are vulnerabilities')
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

const handleNoVulnerabilities = () => {
  console.log('\x1b[32m', 'SUCCESS: No vulnerability found for this severity type or above');
  process.exit(0);
}

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
    process.exit(1);
  }

  exec(`${packageManager} audit --json`, (_error, stdout, stderr) => {
    if (stderr) {
      console.log(stderr)
      process.exit(1);
    };

    if (stdout) {
      if (program.report) {
        console.log(stdout)
      };
      const vulnerabilities = parseOutput(stdout);
      const totalVulnerabilities =
        vulnerabilities.critical +
        vulnerabilities.high +
        vulnerabilities.moderate +
        vulnerabilities.low;

      if (totalVulnerabilities === 0) {
        handleNoVulnerabilities();
      }

      const severityType = parseMessage(vulnerabilities, program);

      switch (severityType) {
        case 'critical':
        case 'high':
        case 'moderate':
        case 'low':
          const message = `FAILURE: ${totalVulnerabilities} total vulnerability(ies)`;

          console.log('\x1b[31m', message);
          if (!program.succeed) {
            process.exit(1);
          }
          return;
        case '':
        default:
          handleNoVulnerabilities();
          return;
      }
    };
  });
};

module.exports = run();