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
        ignore: {
            type: 'string',
        },
    },
});

function main() {
    if (cli.input.length !== 2) {
        console.error('You must be doing somethinf wrong. Use soldoc --help.');
        return 1;
    }

    if (cli.flags.pdf) {
        console.log('Wait...might take a moment!');
    } else {
        console.log('');
    }
    let ignoreList = [];
    if (cli.flags.ignore && cli.flags.ignore.length > 0) {
        const commaPosition = cli.flags.ignore.indexOf(',');
        if (commaPosition >= -1) {
            ignoreList = cli.flags.ignore.split(',');
        }
    }
    return generate(cli.flags.pdf, ignoreList, String(cli.input[0]), String(cli.input[1]));
}

main();
