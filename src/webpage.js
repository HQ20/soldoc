const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');


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
exports.generateDocumentation = (contractsPreparedData, outputFolder) => {
    // create a list of contracts and methods
    const contractsStructure = [];
    contractsPreparedData.forEach((contract) => {
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
    contractsPreparedData.forEach((contract) => {
        // verify if the docs/ folder exist and creates it if not
        const destinationDocsFolderPath = path.join(process.cwd(), outputFolder);
        if (!fs.existsSync(destinationDocsFolderPath)) {
            fs.mkdirSync(destinationDocsFolderPath);
        }
        // transform the template
        const HTMLContent = transformTemplate(
            path.join(contract.currentFolder, 'src/template/index.html'),
            contract.contractName,
            contract.contractData,
            contract.solidityFilePath,
            contractsStructure,
        );
        // write it to a file
        fs.writeFileSync(path.join(process.cwd(), outputFolder, `${contract.filename}.html`), HTMLContent);
        // copy styles
        fs.copyFileSync(
            path.join(contract.currentFolder, 'src/template/reset.css'),
            path.join(process.cwd(), outputFolder, 'reset.css'),
        );
        fs.copyFileSync(
            path.join(contract.currentFolder, 'src/template/styles.css'),
            path.join(process.cwd(), outputFolder, 'styles.css'),
        );
    });
};
