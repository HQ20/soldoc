import parser from 'solidity-parser-antlr';
import MapComments from './mapComments';
import fs from 'fs';


function prepareFromFile(filePath) {
    // read file
    const input = fs.readFileSync(filePath).toString();
    // parse it using solidity-parser-antlr
    const ast = parser.parse(input);
    // filter for contract definition
    const astContract = ast.children.filter((child) => child.type === 'ContractDefinition');
    // get filtered comments
    const comments = MapComments(input);
    return {ast: astContract, comments};
}
