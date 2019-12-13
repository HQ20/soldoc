import fs from 'fs';
import path from 'path';
import parser from 'solidity-parser-antlr';


export interface ISolDocAST {
    contract?: any;
    constructor?: any;
    events: any[];
    functions: any[];
}

function extendParamsAstWithNatspec(node: any) {
    if (node.parameters === null) {
        return null;
    }
    return node.parameters.map((parameter: any) => (
        {
            ...parameter,
            natspec:
                parameter.name === null ||
                    node.natspec === null ||
                    node.natspec.params === undefined
                    ? ''
                    : node.natspec.params[parameter.name],
        }
    ));
}
function extendReturnParamsAstWithNatspec(node: any) {
    if (node.returnParameters === null || node.returnParameters === undefined) {
        return null;
    }
    return node.returnParameters.map(
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
 * Prepare for the given file.
 * @param {string} solidityFilePath the file's path to be parsed
 */
export function prepareForFile(solidityFilePath: string) {
    // get current path folder
    const currentFolder = path.join(__dirname, '../');
    // read file
    const input = fs.readFileSync(solidityFilePath).toString();
    // parse it using solidity-parser-antlr
    const ast = parser.parse(input);
    // create an array to save the ast and comments
    let contractData: ISolDocAST = {
        events: [] as any,
        functions: [] as any,
    };
    // visit all the methods and add the commands to it
    parser.visit(ast, {
        ContractDefinition: (node: any) => {
            contractData = {
                contract: node,
                ...contractData,
            };
        },
        EventDefinition: (node: any) => {
            contractData.events.push({
                ast: node,
                parameters: extendParamsAstWithNatspec(node),
                returnParameters: extendReturnParamsAstWithNatspec(node),
            });
        },
        FunctionDefinition: (node: any) => {
            if (node.isConstructor) {
                contractData = {
                    constructor: {
                        ast: node,
                        parameters: extendParamsAstWithNatspec(node),
                        returnParameters: extendReturnParamsAstWithNatspec(node),
                    },
                    ...contractData,
                };
            } else {
                contractData.functions.push({
                    ast: node,
                    parameters: extendParamsAstWithNatspec(node),
                    returnParameters: extendReturnParamsAstWithNatspec(node),
                });
            }
        },
    });
    // return new info
    const contractName = ast.children.filter((child: any) => child.type === 'ContractDefinition')[0].name;
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
