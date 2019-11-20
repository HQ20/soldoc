"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var solidity_parser_antlr_1 = __importDefault(require("solidity-parser-antlr"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var sol_comments_parser_1 = require("sol-comments-parser");
/**
 * Map the comments and returns the contract ast and the mapped comments.
 * @param {string} solidityFile the file's path to be parsed
 */
function prepareFromFile(solidityFile) {
    // read file
    var input = fs_1.default.readFileSync(solidityFile).toString();
    // parse it using solidity-parser-antlr
    var ast = solidity_parser_antlr_1.default.parse(input);
    // filter for contract definition
    var astContract = ast.children.filter(function (child) { return child.type === 'ContractDefinition'; });
    // get filtered comments
    var comments = sol_comments_parser_1.mapComments(input);
    return { ast: astContract, comments: comments };
}
/**
 * Merges the contract ast and comments into an array.
 * @param {string} solidityFile the file's path to be parsed
 */
function mergeInfoFile(solidityFile) {
    // get basic information
    var rawContractData = prepareFromFile(solidityFile);
    // create an array to save the ast and comments
    var contractDataWithComments = {
        contract: undefined,
        constructor: null,
        events: [],
        functions: [],
    };
    // visit all the methods and add the commands to it
    solidity_parser_antlr_1.default.visit(rawContractData.ast, {
        EventDefinition: function (node) {
            var paramComments = new Map();
            var rawComments;
            if (rawContractData.comments.event !== undefined) {
                if (rawContractData.comments.event.get(node.name) !== undefined) {
                    paramComments = rawContractData.comments.event.get(node.name).param;
                    rawComments = rawContractData.comments.event.get(node.name);
                }
            }
            contractDataWithComments.events.push({
                ast: node,
                comments: rawComments,
                paramComments: paramComments,
                params: function () { return function (val, render) { return paramComments.get(render(val)); }; },
            });
        },
        FunctionDefinition: function (node) {
            if (node.isConstructor) {
                var paramComments_1 = new Map();
                if (rawContractData.comments.constructor !== undefined) {
                    paramComments_1 = rawContractData.comments.constructor.param;
                }
                contractDataWithComments.constructor = {
                    ast: node,
                    comments: rawContractData.comments.constructor,
                    paramComments: paramComments_1,
                    params: function () { return function (val, render) { return paramComments_1.get(render(val)); }; },
                };
            }
            else {
                var paramComments_2 = new Map();
                var rawComments = void 0;
                if (rawContractData.comments.function !== undefined) {
                    if (rawContractData.comments.function.get(node.name) !== undefined) {
                        paramComments_2 = rawContractData.comments.function.get(node.name).param;
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
                    paramComments: paramComments_2,
                    params: function () { return function (val, render) { return paramComments_2.get(render(val)); }; },
                });
            }
        },
    });
    // add contract comments
    if (rawContractData.comments.contract !== undefined) {
        contractDataWithComments.contract = rawContractData
            .comments.contract.get(path_1.default.parse(solidityFile).name);
    }
    // return new info
    return [rawContractData.ast[0].name, contractDataWithComments];
}
/**
 * Prepare for the given file.
 * @param {string} solidityFilePath the file's path to be parsed
 */
function prepareForFile(solidityFilePath) {
    // get current path folder
    var currentFolder = path_1.default.join(__dirname, '../');
    // get ast and comments
    var _a = mergeInfoFile(solidityFilePath), contractName = _a[0], contractData = _a[1];
    // get the filename
    var filename = path_1.default.parse(solidityFilePath).name;
    return {
        filename: filename, currentFolder: currentFolder, contractName: contractName, contractData: contractData, solidityFilePath: solidityFilePath,
    };
}
exports.prepareForFile = prepareForFile;
;
function organizeContractsStructure(contractsPreparedData) {
    var contractsStructure = [];
    contractsPreparedData.forEach(function (contract) {
        var contractInfo = {};
        // add name
        contractInfo.name = contract.contractName;
        contractInfo.filename = contract.filename;
        contractInfo.functions = [];
        // add functions name
        contract.contractData.functions.forEach(function (func) {
            contractInfo.functions.push({ name: func.ast.name });
        });
        contractsStructure.push(contractInfo);
    });
    return contractsStructure;
}
exports.organizeContractsStructure = organizeContractsStructure;
;
//# sourceMappingURL=organize.js.map