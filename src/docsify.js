const fs = require('fs');
const path = require('path');
const {
    organizeContractsStructure,
} = require('./organize');

const lineBreak = '\r\n';

/**
 * @param contractsPreparedData prepared data
 */
exports.generateDocumentation = (contractsPreparedData, outputFolder) => {
    // create a list of contracts and methods
    const contractsStructure = organizeContractsStructure(contractsPreparedData);
    const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    // verify if the docs/ folder exist and creates it if not
    const destinationDocsFolderPath = path.join(process.cwd(), outputFolder);
    if (!fs.existsSync(destinationDocsFolderPath)) {
        fs.mkdirSync(destinationDocsFolderPath);
    }
    contractsPreparedData.forEach((contract) => {
        // transform the template
        let MDContent = `# ${contract.contractName}${lineBreak}`;
        if (contract.contractData.contract.dev) {
            MDContent += `*${contract.contractData.contract.dev}*${lineBreak}`;
        }
        if (contract.contractData.contract.notice) {
            MDContent += `${contract.contractData.contract.notice}${lineBreak}`;
        }
        contract.contractData.functions.forEach((f) => {
            MDContent += `## ${f.ast.name}${lineBreak}`;
            if (f.comments.dev) {
                MDContent += `*${f.comments.dev}*${lineBreak}`;
            }
            if (f.comments.notice) {
                MDContent += `${f.comments.notice}${lineBreak}`;
            }
            let table = false;
            if (f.ast.parameters.parameters.length > 0) {
                table = true;
                MDContent += `${lineBreak}|Input/Output|Data Type|Variable Name|Comment|${lineBreak}`
                    + `|----------|----------|----------|----------|${lineBreak}`;
                f.ast.parameters.parameters.forEach((p) => {
                    MDContent += `|input|${p.typeName.name}|${p.name}|${f.comments.param.get(p.name)}|${lineBreak}`;
                });
            }
            if (f.ast.returnParameters !== null && f.ast.returnParameters.parameters.length > 0) {
                if (!table) {
                    MDContent += `${lineBreak}|Input/Output|Data Type|Variable Name|Comment|${lineBreak}`
                        + `|----------|----------|----------|----------|${lineBreak}`;
                }
                f.ast.returnParameters.parameters.forEach((p) => {
                    MDContent += `|output|${p.typeName.name}|${(p.name === null) ? ('N/A') : (p.name)}|`
                        + `${(f.comments.return.length === 0) ? ('N/A') : (f.comments.return)}|${lineBreak}`;
                });
            }
        });
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, `${contract.filename}.md`),
            MDContent,
        );
    });
    // generate summary file (essential in gitbook)
    let SUMMARYContent = '# Summary\r\n';
    contractsStructure.forEach((s) => {
        SUMMARYContent += `* [${s.name}](${s.name}.md)${lineBreak}`;
        s.functions.forEach((f) => {
            SUMMARYContent += `\t* [${f.name}](${s.name}.md)${lineBreak}`;
        });
        if (hasLICENSE) {
            SUMMARYContent += `* [LICENSE](LICENSE.md)${lineBreak}`;
        }
    });
    // create summary file
    fs.writeFileSync(
        path.join(process.cwd(), outputFolder, 'SUMMARY.md'),
        SUMMARYContent,
    );
    // Copy readme if it exists, otherwise, create a sampe
    if (fs.existsSync(path.join(process.cwd(), 'README.md'))) {
        fs.copyFileSync(
            path.join(process.cwd(), 'README.md'),
            path.join(process.cwd(), outputFolder, 'README.md'),
        );
    } else {
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, 'README.md'),
            '# Hello',
        );
    }
    // copy html base
    fs.copyFileSync(
        path.join(__dirname, 'template/docsify/index.html'),
        path.join(process.cwd(), outputFolder, 'index.html'),
    );
    // write nojekill
    fs.writeFileSync(
        path.join(process.cwd(), outputFolder, '.nojekill'),
        '# Hello',
    );
};
