const parser = require('solidity-parser-antlr');
const path = require('path');
const fs = require('fs');

const { mapComments } = require('sol-comments-parser');


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
    const contractDataWithComments = { constructor: null, events: [], functions: [] };
    // visit all the methods and add the commands to it
    parser.visit(rawContractData.ast, {
        EventDefinition: (node) => {
            let paramComments = new Map();
            let rawComments;
            if (rawContractData.comments.event !== undefined) {
                if (rawContractData.comments.event.get(node.name) !== undefined) {
                    paramComments = rawContractData.comments.event.get(node.name).param;
                    rawComments = rawContractData.comments.event.get(node.name);
                }
            }
            contractDataWithComments.events.push({
                ast: node,
                comments: rawComments,
                paramComments,
                params: () => (val, render) => paramComments.get(render(val)),
            });
        },
        FunctionDefinition: (node) => {
            if (node.isConstructor) {
                let paramComments = new Map();
                if (rawContractData.comments.constructor !== undefined) {
                    paramComments = rawContractData.comments.constructor.param;
                }
                contractDataWithComments.constructor = {
                    ast: node,
                    comments: rawContractData.comments.constructor,
                    paramComments,
                    params: () => (val, render) => paramComments.get(render(val)),
                };
            } else {
                let paramComments = new Map();
                let rawComments;
                if (rawContractData.comments.function !== undefined) {
                    if (rawContractData.comments.function.get(node.name) !== undefined) {
                        paramComments = rawContractData.comments.function.get(node.name).param;
                        rawComments = rawContractData.comments.function.get(node.name);
                    }
                }
                contractDataWithComments.functions.push({
                    ast: node,
                    isPublic: node.visibility === 'public',
                    isPrivate: node.visibility === 'private',
                    isInternal: node.visibility === 'internal',
                    isExternal: node.visibility === 'external',
                    comments: rawComments,
                    paramComments,
                    params: () => (val, render) => paramComments.get(render(val)),
                });
            }
        },
    });
    // add contract comments
    if (rawContractData.comments.contract !== undefined) {
        contractDataWithComments.contract = rawContractData
            .comments.contract.get(path.parse(solidityFile).name);
    }
    // return new info
    return [rawContractData.ast[0].name, contractDataWithComments];
}

/**
 * Prepare for the given file.
 * @param {string} solidityFilePath the file's path to be parsed
 */
exports.prepareForFile = (solidityFilePath) => {
    // get current path folder
    const currentFolder = path.join(__dirname, '../');
    // get ast and comments
    const [contractName, contractData] = mergeInfoFile(solidityFilePath);
    // get the filename
    const filename = path.parse(solidityFilePath).name;
    return {
        filename, currentFolder, contractName, contractData, solidityFilePath,
    };
};

exports.organizeContractsStructure = (
    contractsPreparedData,
) => {
    const contractsStructure = [];
    contractsPreparedData.forEach((contract) => {
        const contractInfo = {};
        // add name
        contractInfo.name = contract.contractName;
        contractInfo.filename = contract.filename;
        contractInfo.functions = [];
        // add functions name
        contract.contractData.functions.forEach((func) => {
            contractInfo.functions.push({ name: func.ast.name });
        });
        contractsStructure.push(contractInfo);
    });
    return contractsStructure;
};
