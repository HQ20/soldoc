const fs = require('fs');
const path = require('path');
const {
    organizeContractsStructure,
} = require('./organize');
const {
    renderContracts,
    renderReadme,
    renderDocumentationIndex,
} = require('./renderMD');

const lineBreak = '\r\n';

/**
 * @param contractsPreparedData prepared data
 */
exports.generateDocumentation = (contractsPreparedData, outputFolder) => {
    // create a list of contracts and methods
    const contractsStructure = organizeContractsStructure(contractsPreparedData);
    const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    renderContracts(contractsPreparedData, outputFolder, lineBreak);
    // generate summary file (essential in gitbook)
    let SUMMARYContent = `# Summary\r\n* WELCOME${lineBreak}`;
    SUMMARYContent = renderDocumentationIndex(
        SUMMARYContent, outputFolder, contractsStructure, hasLICENSE, lineBreak,
    );
    // create summary file
    fs.writeFileSync(
        path.join(process.cwd(), outputFolder, 'SUMMARY.md'),
        SUMMARYContent,
    );
    // Copy readme if it exists, otherwise, create a sampe
    renderReadme(outputFolder);
};
