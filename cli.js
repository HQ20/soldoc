#!/usr/bin/env node
'use strict';
const meow = require('meow');


function cenas(input, flags) {
    if (flags.cenas === true) {
        console.log('Hello ' + input[0]);
    }
}

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
			alias: 'r'
        },
        cenas: {
            type: 'boolean',
        },
	}
});

cenas(cli.input, cli.flags);