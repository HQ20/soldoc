const parser = require('solidity-parser-antlr');
const path = require('path');
const fs = require('fs');
const Mustache = require('mustache');

const { mapComments } = require('./mapComments');
const { walkSync } = require('./utils/utils');


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
    const contractDataWithComments = { constructor: null, events: [], functions: [] };
    // visit all the methods and add the commands to it
    parser.visit(rawContractData.ast, {
        EventDefinition: (node) => {
            contractDataWithComments.events.push({ ast: node });
        },
    });
    parser.visit(rawContractData.ast, {
        FunctionDefinition: (node) => {
            if (node.isConstructor) {
                contractDataWithComments.constructor = { ast: node };
            } else {
                contractDataWithComments.functions.push({ ast: node, comments: rawContractData.comments.get(node.name) });
            }
        },
    });
    // return new info
    return [rawContractData.ast[0].name, contractDataWithComments];
}

/**
 * Generate HTML for the given file.
 * @param {string} solidityFile the file's path to be parsed
 */
function prepareForHTMLFile(solidityFile) {
    // get current path folder
    const currentFolder = path.join(__dirname, '../');
    // get ast and comments
    const [contractName, contractData] = mergeInfoFile(solidityFile);
    // get the filename
    const filename = solidityFile.match(/\/([a-zA-Z0-9_]+)\.sol/)[1];
    return {
        filename, currentFolder, contractName, contractData,
    };
}

/**
 * Using the given parameters, calls the Mustache engine
 * and renders the HTML page.
 * @param {string} templateFile Path for template file
 * @param {string} contractName Contract name
 * @param {object} contractData Contract data, containing ast and comments to be rendered
 * @param {string} contractPath Path to contract file
 */
function transformTemplate(templateFile, contractName, contractData, contractPath, contractsStructure) {
    // read template into a string
    const templateContent = String(fs.readFileSync(templateFile));
    // put all data together
    const view = {
        filePath: contractPath,
        contract: {
            name: contractName,
        },
        contractData,
        contractsStructure,
        currentDate: new Date(),
    };
    // calls the render engine
    const output = Mustache.render(templateContent, view);
    return output;
}

/**
 * To write!
 * @param {object} contractsData Obect containing all contracts info
 */
function generateDocumentation(contractsData) {
    // create a list of contracts and methods
    const contractsStructure = [];
    contractsData.forEach((contract) => {
        const contractInfo = {};
        // add name
        contractInfo.name = contract.contractName;
        contractInfo.functions = [];
        // add functions name
        contract.contractData.functions.forEach((func) => {
            contractInfo.functions.push({ name: func.ast.name });
        });
        contractsStructure.push(contractInfo);
    });
    contractsData.forEach((contract) => {
        // verify if the docs/ folder exist and creates it if not
        const destinationDocsFolderPath = `${process.cwd()}/docs/`;
        if (!fs.existsSync(destinationDocsFolderPath)) {
            fs.mkdirSync(destinationDocsFolderPath);
        }
        // transform the template
        const HTMLContent = transformTemplate(
            `${contract.currentFolder}src/template/index.html`,
            contract.contractName,
            contract.contractData,
            contract.solidityFile,
            contractsStructure,
        );
        // write it to a file
        fs.writeFileSync(`${process.cwd()}/docs/${contract.filename}.html`, HTMLContent);
        // copy styles
        fs.copyFileSync(`${contract.currentFolder}src/template/reset.css`, `${process.cwd()}/docs/reset.css`);
        fs.copyFileSync(`${contract.currentFolder}src/template/styles.css`, `${process.cwd()}/docs/styles.css`);
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
        const prepared = [];
        files.forEach(file => prepared.push(prepareForHTMLFile(file)));
        generateDocumentation(prepared);
        return 0;
    });
};
