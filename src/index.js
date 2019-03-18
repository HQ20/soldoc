import parser from 'solidity-parser-antlr';
import mapComments from './mapComments';
import fs from 'fs';


function prepareFromFile(filePath) {
    // read file
    const input = fs.readFileSync(filePath).toString();
    // parse it using solidity-parser-antlr
    const ast = parser.parse(input)
    // filter for contract definition
    const astContract = ast.children.filter((child) => child.type === 'ContractDefinition');
    // get filtered comments
    const comments = mapComments(input);
    return {ast: astContract, comments};
}

const result = prepareFromFile('./src/Sample.sol');

console.log(result.comments.get('...'));

// extract multiline comments and function
// \/\*\*(\s[ ]+\* [\S ]+)*\s+\*\/\s+function [a-zA-Z]+\(.*\)

//extract @notice
// \* @notice ([\w\s*. ]+)

// generic
// remove new lines and stars
// \s+\*

// solidity-parser-antlr is important to get variable types and function returns