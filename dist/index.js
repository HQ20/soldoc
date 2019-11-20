"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var prepareForFile = require('./organize').prepareForFile;
var html = require('./html');
var pdf = require('./pdf');
var gitbook = require('./gitbook');
var docsify = require('./docsify');
/**
 * Get all files in folder, recursively.
 * @param {string} folder folder path
 * @param {array} ignoreFilesList an array of files to be ignored
 */
function deepListFiles(folder, ignoreFilesList) {
    var files = [];
    // read dir
    var filesList = fs_1.default.readdirSync(folder);
    // iterate over what was found
    filesList.forEach(function (file) {
        if (ignoreFilesList.includes(file)) {
            return;
        }
        var stats = fs_1.default.lstatSync(path_1.default.join(folder, file));
        // lets see if it is a directory
        if (stats.isDirectory()) {
            // if so, navigate
            var result = deepListFiles(path_1.default.join(folder, file), ignoreFilesList);
            // push them all
            result.forEach(function (r) { return files.push(r); });
            return;
        }
        // if not, push file to list, only if it is valid
        if (path_1.default.extname(file) === '.sol') {
            files.push(path_1.default.join(folder, file));
        }
    });
    return files;
}
/**
 * Main method to be called. Will create the HTML using the other methods.
 * @param {string} outputType the output type of the given documentation
 * @param {string} ignoreFilesList an array of files to be ignored
 * @param {string} outputFolder directory to output the result, either pdf or html
 * @param {string} inputPath the path to file or folder to be analized
 */
function generate(outputType, ignoreFilesList, outputFolder, inputPath) {
    // verify the type of the given input
    var stats;
    try {
        stats = fs_1.default.lstatSync(inputPath);
    }
    catch (e) {
        // Handle error
        // eslint-disable-next-line no-console
        console.log("The file you are looking for (" + inputPath + ") doesn't exist!");
        return 1;
    }
    var files = [];
    // verify if the input is a directory, file or array of files
    if (stats.isDirectory()) {
        // if it's a folder, get all files recursively
        files = deepListFiles(inputPath, ignoreFilesList);
    }
    else if (stats.isFile() && !ignoreFilesList.includes(inputPath)) {
        // if it's a file, just get the file
        files.push(inputPath);
    }
    // iterate over files to generate HTML
    var prepared = [];
    files.forEach(function (file) { return prepared.push(prepareForFile(file)); });
    // verify if the docs/ folder exist and creates it if not
    var destinationDocsFolderPath = path_1.default.join(process.cwd(), outputFolder);
    if (!fs_1.default.existsSync(destinationDocsFolderPath)) {
        fs_1.default.mkdirSync(destinationDocsFolderPath, { recursive: true });
    }
    if (outputType === 'pdf') {
        pdf.generateDocumentation(prepared, outputFolder);
    }
    else if (outputType === 'html') {
        html.generateDocumentation(prepared, outputFolder);
    }
    else if (outputType === 'gitbook') {
        gitbook.generateDocumentation(prepared, outputFolder);
    }
    else if (outputType === 'docsify') {
        docsify.generateDocumentation(prepared, outputFolder);
    }
    else {
        // eslint-disable-next-line no-console
        console.error('Invalid output type! Try --help for more info.');
        return 1;
    }
    return 0;
}
exports.generate = generate;
;
//# sourceMappingURL=index.js.map