import fs from 'fs';
import path from 'path';
import parser from 'solidity-parser-antlr';


export interface ISolDocAST {
    contract?: any;
    constructor?: any;
    events: any[];
    functions: any[];
}
export interface IObjectViewData {
    data: ISolDocAST;
    filename: string;
    folder: string;
    name: string;
    path: string;
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
export function prepareForFile(solidityFilePath: string): IObjectViewData {
    const folder = path.join(__dirname, '../');
    const input = fs.readFileSync(solidityFilePath).toString();
    const ast = parser.parse(input);
    let data: ISolDocAST = {
        events: [] as any,
        functions: [] as any,
    };
    // visit all the methods and add the commands to it
    parser.visit(ast, {
        ContractDefinition: (node: any) => {
            data = {
                contract: node,
                ...data,
            };
        },
        EventDefinition: (node: any) => {
            data.events.push({
                ast: node,
                parameters: extendParamsAstWithNatspec(node),
                returnParameters: extendReturnParamsAstWithNatspec(node),
            });
        },
        FunctionDefinition: (node: any) => {
            if (node.isConstructor) {
                data = {
                    constructor: {
                        ast: node,
                        parameters: extendParamsAstWithNatspec(node),
                        returnParameters: extendReturnParamsAstWithNatspec(node),
                    },
                    ...data,
                };
            } else {
                data.functions.push({
                    ast: node,
                    parameters: extendParamsAstWithNatspec(node),
                    returnParameters: extendReturnParamsAstWithNatspec(node),
                });
            }
        },
    });
    const name = ast.children.filter((child: any) => child.type === 'ContractDefinition')[0].name;
    const filename = path.parse(solidityFilePath).name;
    return {
        data,
        filename,
        folder,
        name,
        path: solidityFilePath,
    };
}
