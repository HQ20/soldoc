import fs from 'fs';
import path from 'path';
import parser from 'solidity-parser-antlr';

import { mapComments } from 'sol-comments-parser';


function extendParamsAstWithNatspec(node: any) {
    return node.parameters === null
        ? null
        : node.parameters.map((parameter: any) => (
            {
                ...parameter,
                natspec: parameter.name === null || node.natspec === null
                    ? ''
                    : node.natspec.params[parameter.name],
            }
        ));
}
function extendReturnParamsAstWithNatspec(node: any) {
    return node.returnParameters === null
        ? null
        : node.returnParameters.map(
            (parameter: any) => (
                {
                    ...parameter,
                    natspec: node.natspec === null
                        ? ''
                        : node.natspec.return,
                }
            ));
}
/**
 * Merges the contract ast and comments into an array.
 * @param {string} solidityFile the file's path to be parsed
 */
function mergeInfoFile(solidityFile: string) {
    // read file
    const input = fs.readFileSync(solidityFile).toString();
    // parse it using solidity-parser-antlr
    const ast = parser.parse(input);
    // filter for contract definition
    const astContract = ast.children.filter((child: any) => child.type === 'ContractDefinition');
    // get filtered comments
    const comments = mapComments(input);
    // get basic information
    const rawContractData = { ast: astContract, comments };
    // create an array to save the ast and comments
    const contractDataWithComments = {
        constructor: null,
        contract: undefined,
        events: [] as any,
        functions: [] as any,
    };
    // visit all the methods and add the commands to it
    parser.visit(rawContractData.ast, {
        EventDefinition: (node: any) => {
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
                params: () => (val: any, render: any) => paramComments.get(render(val)),
            });
        },
        FunctionDefinition: (node: any) => {
            if (node.isConstructor) {
                let paramComments = new Map();
                if (rawContractData.comments.constructor !== undefined) {
                    paramComments = rawContractData.comments.constructor.param;
                }
                contractDataWithComments.constructor = {
                    ast: node,
                    comments: rawContractData.comments.constructor,
                    paramComments,
                    params: () => (val: any, render: any) => paramComments.get(render(val)),
                } as any;
            } else {
                contractDataWithComments.functions.push({
                    ast: node,
                    parameters: extendParamsAstWithNatspec(node),
                    returnParameters: extendReturnParamsAstWithNatspec(node),
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
export function prepareForFile(solidityFilePath: string) {
    // get current path folder
    const currentFolder = path.join(__dirname, '../');
    // get ast and comments
    const [contractName, contractData] = mergeInfoFile(solidityFilePath);
    // get the filename
    const filename = path.parse(solidityFilePath).name;
    return {
        contractData,
        contractName,
        currentFolder,
        filename,
        solidityFilePath,
    };
}

export function organizeContractsStructure(
    contractsPreparedData: any,
) {
    const contractsStructure: any = [];
    contractsPreparedData.forEach((contract: any) => {
        const contractInfo: any = {};
        // add name
        contractInfo.name = contract.contractName;
        contractInfo.filename = contract.filename;
        contractInfo.functions = [];
        // add functions name
        contract.contractData.functions.forEach((func: any) => {
            contractInfo.functions.push({ name: func.ast.name });
        });
        contractsStructure.push(contractInfo);
    });
    return contractsStructure;
}
