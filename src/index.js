const path = require('path');
const fs = require('fs');

const { prepareForFile } = require('./organize');
const html = require('./html');
const pdf = require('./pdf');
const gitbook = require('./gitbook');
const docsify = require('./docsify');

/**
 * Get all files in folder, recursively.
 * @param {string} folder folder path
 * @param {array} ignoreFilesList an array of files to be ignored
 */
function deepListFiles(folder, ignoreFilesList) {
    const files = [];
    // read dir
    const filesList = fs.readdirSync(folder);
    // iterate over what was found
    filesList.forEach((file) => {
        if (ignoreFilesList.includes(file)) {
            return;
        }
        const stats = fs.lstatSync(path.join(folder, file));
        // lets see if it is a directory
        if (stats.isDirectory()) {
            // if so, navigate
            const result = deepListFiles(path.join(folder, file), ignoreFilesList);
            // push them all
            result.forEach((r) => files.push(r));
            return;
        }
        // if not, push file to list, only if it is valid
        if (path.extname(file) === '.sol') {
            files.push(path.join(folder, file));
        }
    });
    return files;
}

/**
 * Main method to be called. Will create the HTML using the other methods.
 * @param {string} outputType the output type of the given documentation
 * @param {string} ignoreFilesList an array of files to be ignored
 * @param {string} outputFolder directory to output the result, either pdf or html
 * @param {string} filePathInput the path to file or folder to be analized
 */
exports.generate = (outputType, ignoreFilesList, outputFolder, filePathInput) => {
    // verify the type of the given input
    let stats;
    try {
        stats = fs.lstatSync(filePathInput);
    } catch (e) {
        // Handle error
        // eslint-disable-next-line no-console
        console.log(`The file you are looking for (${filePathInput}) doesn't exist!`);
        return 1;
    }

    let files = [];
    // verify if the input is a directory, file or array of files
    if (stats.isDirectory()) {
        // if it's a folder, get all files recursively
        files = deepListFiles(filePathInput, ignoreFilesList);
    } else if (stats.isFile() && !ignoreFilesList.includes(filePathInput)) {
        // if it's a file, just get the file
        files.push(filePathInput);
    }
    // iterate over files to generate HTML
    const prepared = [];
    files.forEach((file) => prepared.push(prepareForFile(file)));
    // verify if the docs/ folder exist and creates it if not
    const destinationDocsFolderPath = path.join(process.cwd(), outputFolder);
    if (!fs.existsSync(destinationDocsFolderPath)) {
        fs.mkdirSync(destinationDocsFolderPath, { recursive: true });
    }
    if (outputType === 'pdf') {
        pdf.generateDocumentation(prepared, outputFolder);
    } else if (outputType === 'html') {
        html.generateDocumentation(prepared, outputFolder);
    } else if (outputType === 'gitbook') {
        gitbook.generateDocumentation(prepared, outputFolder);
    } else if (outputType === 'docsify') {
        docsify.generateDocumentation(prepared, outputFolder);
    } else {
        // eslint-disable-next-line no-console
        console.error('Invalid output type! Try --help for more info.');
        return 1;
    }
    return 0;
};
