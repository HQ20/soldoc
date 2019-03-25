import parser from 'solidity-parser-antlr';
import MapComments from './mapComments';
import fs from 'fs';


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

function generateHTMLForFile(solidityFile) {
    return mergeInfoFile(solidityFile);
}

function generateHTML(files) {
    files.forEach(file => {
        generateHTMLForFile(file);
    });
}
