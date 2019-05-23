const path = require('path');
const fs = require('fs');

const { prepareForFile } = require('./organize');
const webpage = require('./webpage');
const pdf = require('./pdf');

/**
 * Get all files in folder, recursively.
 * @param {string} folder folder path
 */
function deepListFiles(folder) {
    const files = [];
    // read dir
    const filesList = fs.readdirSync(folder);
    // iterate over what was found
    filesList.forEach((file) => {
        const stats = fs.lstatSync(path.join(folder, file));
        // lets see if it is a directory
        if (stats.isDirectory()) {
            // if so, navigate
            const result = deepListFiles(path.join(folder, file));
            // push them all
            result.forEach(r => files.push(r));
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
 * @param {array} files array of files path
 */
exports.generate = (toPdf, outputFolder, filePathInput) => {
    // verify the type of the given input
    fs.lstat(filePathInput, (err, stats) => {
        // Handle error
        if (err) {
            return 1;
        }
        let files = [];
        // verify if the input is a directory, file or array of files
        if (stats.isDirectory()) {
            // if it's a folder, get all files recursively
            files = deepListFiles(filePathInput);
        } else if (stats.isFile()) {
            // if it's a file, just get the file
            files.push(filePathInput);
        } else {
            //
        }
        // iterate over files to generate HTML
        const prepared = [];
        files.forEach(file => prepared.push(prepareForFile(file)));
        if (toPdf) {
            pdf.generatePDF(prepared, outputFolder);
        } else {
            webpage.generateDocumentation(prepared, outputFolder);
        }
        return 0;
    });
};
