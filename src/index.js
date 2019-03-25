const parser = require('solidity-parser-antlr');
const fs = require('fs');

const { mapComments } = require('./mapComments');
const { walkSync } = require('./utils/index');


/**
 * Map the comments and returns the contract ast and the mapped comments.
 * @param {string} solidityFile the file's path to be parsed
 */
function prepareFromFile(solidityFile) {
    // read file
    const input = fs.readFileSync(solidityFile).toString();
    // parse it using solidity-parser-antlr
    const ast = parser.parse(input);
    // filter for contract definition
    const astContract = ast.children.filter(child => child.type === 'ContractDefinition');
    // get filtered comments
    const comments = mapComments(input);
    return { ast: astContract, comments };
}

/**
 * Merges the contract ast and comments into an array.
 * @param {string} solidityFile the file's path to be parsed
 */
function mergeInfoFile(solidityFile) {
    // get basic information
    const rawContractData = prepareFromFile(solidityFile);
    // create an array to save the ast and comments
    const contractDataWithComments = [];
    // visit all the methods and add the commands to it
    parser.visit(rawContractData.ast, {
        FunctionDefinition: (node) => {
            contractDataWithComments.push({ ast: node, comments: rawContractData.comments.get(node.name) });
        },
    });
    // return new info
    return contractDataWithComments;
}

/**
 * Generate HTML for the given file.
 * @param {string} solidityFile the file's path to be parsed
 */
function generateHTMLForFile(solidityFile) {
    // get ast and comments
    const contractData = mergeInfoFile(solidityFile);
    // get the filename
    const filename = solidityFile.match(/\/([a-zA-Z0-9_]+)\.sol/);
    // fulfill the template using contract data
    contractData.forEach(() => {
        // transform the template
        // TODO: in progress
        const HTMLContent = '<p>Hello!</p>';
        // write it to a file
        fs.writeFile(`${process.cwd()}/docs/${filename[1]}.html`, HTMLContent, (err) => {
            if (err) {
                return 1;
            }
            return 0;
        });
    });
}

/**
 * Main method to be called. Will create the HTML using the other methods.
 * @param {array} files array of files path
 */
exports.generateHTML = (filePathInput) => {
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
        files.forEach(file => generateHTMLForFile(file));
        return 0;
    });
};
