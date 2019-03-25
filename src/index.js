import parser from 'solidity-parser-antlr';
import MapComments from './mapComments';
import fs from 'fs';


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
    const astContract = ast.children.filter((child) => child.type === 'ContractDefinition');
    // get filtered comments
    const comments = MapComments(input);
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
        FunctionDefinition: function (node) {
            contractDataWithComments.push({ ast: node, comments: rawContractData.comments.get(node.name) });
        }
    });
    // return new info
    return contractDataWithComments;
}

/**
 * Generate HTML for the given file.
 * @param {string} solidityFile the file's path to be parsed
 */
function generateHTMLForFile(solidityFile) {
    return mergeInfoFile(solidityFile);
}

/**
 * Main method to be called. Will create the HTML using the other methods.
 * @param {array} files array of files path
 */
function generateHTML(files) {
    files.forEach(file => {
        generateHTMLForFile(file);
    });
}
