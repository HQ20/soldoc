#!/usr/bin/env node


const meow = require('meow');
const { generateHTML } = require('../src/index');


const cli = meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
    flags: {
        rainbow: {
            type: 'boolean',
            alias: 'r',
        },
        cenas: {
            type: 'boolean',
        },
    },
});

generateHTML(String(cli.input));
