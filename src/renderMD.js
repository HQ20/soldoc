const fs = require('fs');
const path = require('path');

exports.renderContracts = (contractsPreparedData, outputFolder, lineBreak) => {
    contractsPreparedData.forEach((contract) => {
        // transform the template
        let MDContent = `# ${contract.contractName}${lineBreak}`;
        if (contract.contractData.contract !== undefined) {
            if (contract.contractData.contract.dev) {
                MDContent += `*${contract.contractData.contract.dev}*${lineBreak}`;
            }
            if (contract.contractData.contract.notice) {
                MDContent += `${contract.contractData.contract.notice}${lineBreak}`;
            }
        }
        contract.contractData.functions.forEach((f) => {
            MDContent += `## ${f.ast.name}${lineBreak}`;
            if (f.comments === undefined) {
                return;
            }
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
            MDContent += lineBreak;
        });
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, `${contract.filename}.md`),
            MDContent,
        );
    });
};

exports.renderReadme = (outputFolder) => {
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
    const outputReadme = fs.readFileSync(path.join(process.cwd(), 'README.md'));
    // if there's an image reference in readme, copy it
    const files = [];
    // read dir
    const filesList = fs.readdirSync(process.cwd());
    // iterate over what was found
    filesList.forEach((file) => {
        const stats = fs.lstatSync(path.join(process.cwd(), file));
        // if not, push file to list, only if it is valid
        if (stats.isFile() && (path.extname(file) === '.png' || path.extname(file) === '.jpg')) {
            files.push(file);
        }
    });
    // and if the file is n readme, copy it
    files.forEach((file) => {
        if (outputReadme.includes(file)) {
            fs.copyFileSync(path.join(process.cwd(), file), path.join(process.cwd(), outputFolder, file));
        }
    });
};

exports.renderDocumentationIndex = (content, outputFolder, contractsStructure, hasLICENSE, lineBreak) => {
    let documentationIndexContent = content;
    if (hasLICENSE) {
        documentationIndexContent += `\t* [LICENSE](LICENSE.md)${lineBreak}`;
        fs.copyFileSync(
            path.join(process.cwd(), 'LICENSE'),
            path.join(process.cwd(), outputFolder, 'LICENSE.md'),
        );
    }
    documentationIndexContent += `* CONTRACTS${lineBreak}`;
    contractsStructure.forEach((s) => {
        documentationIndexContent += `\t* [${s.name}](${s.name}.md)${lineBreak}`;
    });
    return documentationIndexContent;
};
