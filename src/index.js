const fs = require('fs');

const { walkSync } = require('./utils/utils');
const { prepareForFile } = require('./organize');
const webpage = require('./webpage');
const pdf = require('./pdf');


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
        const files = [];
        // verify if the input is a directory, file or array of files
        if (stats.isDirectory()) {
            // if it's a folder, get all files recursively
            walkSync(filePathInput, []).forEach((filePath) => {
                files.push(filePathInput + filePath);
            });
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
