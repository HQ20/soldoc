#!/usr/bin/env node


const meow = require('meow');
const { generateHTML } = require('../src/webpage');
const { generatePDF } = require('../src/pdf');

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

if (cli.flags.pdf === true) {
    console.log('Not fully implamented yet!');
    // generatePDF(String(cli.input));
} else {
    generateHTML(String(cli.input));
}
