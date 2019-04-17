#!/usr/bin/env node


const meow = require('meow');
const { generate } = require('../src/index');

const helpMessage = `
Usage
    $ soldoc <file(s)>

Options
    --help, -h  To get help
    --pdf to generate a PDF file

Examples
    $ soldoc contracts/Sample.sol
    $ soldoc contracts/
    $ soldoc --pdf Sample.sol
`;
const cli = meow(helpMessage, {
    flags: {
        pdf: {
            type: 'boolean',
        },
    },
});

console.log('Wait...might take a moment!');
generate(String(cli.input), cli.flags.pdf);
