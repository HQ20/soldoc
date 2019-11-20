#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var meow_1 = __importDefault(require("meow"));
var index_1 = require("./index");
var helpMessage = "\n\uD83D\uDC3C\uFE0F .- hello friend, here's what I have. Thanks to use soldoc.\n\nUsage\n    $ soldoc [options] <output-folder> <file(s)>\n\nOptions\n    --help, -h  To get help\n    --output -o The output type [html/pdf/gitbook/docsify] default: html\n    --ignore -i An array of files to ignore\n\nExamples\n    $ soldoc docs/ contracts/Sample.sol\n    $ soldoc docs/ contracts/\n    $ soldoc --output pdf docs/ Sample.sol\n    $ soldoc --output gitbook --ignore Migrations.sol docs/ Sample.sol\n";
var cli = meow_1.default(helpMessage, {
    flags: {
        output: {
            type: 'string',
            alias: 'o',
            default: 'html',
        },
        ignore: {
            type: 'string',
            alias: 'i',
        },
    },
});
function main() {
    if (cli.input.length !== 2) {
        // eslint-disable-next-line no-console
        console.error('You must be doing something wrong. There\'s a 🐼️ available to help you, '
            + 'just write \'soldoc --help\'.\r\n\r\n\t🐼 ️🐼️ are really cool! Aren\'t they?');
        return 1;
    }
    // pdf generation is a bit slower
    if (cli.flags.output === 'pdf') {
        // eslint-disable-next-line no-console
        console.log('Wait...might take a moment! 🐼️ is doing is stuff...');
    }
    var ignoreList = [];
    if (cli.flags.ignore && cli.flags.ignore.length > 0) {
        var commaPosition = cli.flags.ignore.indexOf(',');
        if (commaPosition >= -1) {
            ignoreList = cli.flags.ignore.split(',');
        }
    }
    return index_1.generate(cli.flags.output, ignoreList, String(cli.input[0]), String(cli.input[1]));
}
main();
//# sourceMappingURL=cli.js.map