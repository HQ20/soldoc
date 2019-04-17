const fs = require('fs');
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
exports.generateDocumentation = (contractsPreparedData) => {
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
};
