#!/usr/bin/env node


const meow = require('meow');
const { generate } = require('../src/index');

const helpMessage = `
Usage
    $ soldoc [options] <output-folder> <file(s)>

Options
    --help, -h  To get help
    --pdf to generate a PDF file

Examples
    $ soldoc docs/ contracts/Sample.sol
    $ soldoc docs/ contracts/
    $ soldoc --pdf docs/ Sample.sol
`;
const cli = meow(helpMessage, {
    flags: {
        pdf: {
            type: 'boolean',
        },
    },
});

console.log('Wait...might take a moment!');
generate(cli.flags.pdf, String(cli.input[0]), String(cli.input[1]));
