#!/usr/bin/env node


const meow = require('meow');
const { generateHTML } = require('../src/index');

const helpMessage = `
Usage
    $ soldoc <file(s)>

Options
    --help, -h  To get help

Examples
    $ foo contracts/Sample.sol
    $ foo contracts/
`;
const cli = meow(helpMessage);

generateHTML(String(cli.input));
