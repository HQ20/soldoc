import fs from 'fs';
import path from 'path';
import { IObjectViewData } from './organize';

export function renderContracts(contractsPreparedData: IObjectViewData[], outputFolder: string, lineBreak: string) {
    contractsPreparedData.forEach((contract) => {
        // transform the template
        let MDContent = `# ${contract.name}${lineBreak}`;
        if (contract.data.contract !== undefined) {
            if (contract.data.contract.natspec.dev) {
                MDContent += `*${contract.data.contract.natspec.dev}*${lineBreak}`;
            }
            if (contract.data.contract.natspec.notice) {
                MDContent += `${contract.data.contract.natspec.notice}${lineBreak}`;
            }
        }
        contract.data.functions.forEach((f) => {
            MDContent += `## ${f.ast.name}${lineBreak}${lineBreak}`;
            if (f.ast.natspec === null) {
                return;
            }
            if (f.ast.natspec.dev) {
                MDContent += `*${f.ast.natspec.dev}*${lineBreak}${lineBreak}`;
            }
            if (f.ast.natspec.notice) {
                MDContent += `${f.ast.natspec.notice}${lineBreak}${lineBreak}`;
            }
            let table = false;
            if (f.parameters.length > 0) {
                table = true;
                MDContent += `${lineBreak}|Input/Output|Data Type|Variable Name|Comment|${lineBreak}`
                    + `|----------|----------|----------|----------|${lineBreak}`;
                f.parameters.forEach((p: any) => {
                    MDContent += `|input|${p.typeName.name}|${p.name}|${p.natspec}|${lineBreak}`;
                });
            }
            if (f.returnParameters !== null && f.returnParameters.length > 0) {
                if (!table) {
                    MDContent += `${lineBreak}|Input/Output|Data Type|Variable Name|Comment|${lineBreak}`
                        + `|----------|----------|----------|----------|${lineBreak}`;
                }
                f.returnParameters.forEach((p: any) => {
                    MDContent += `|output|${p.typeName.name}|${(p.name === null) ? ('N/A') : (p.name)}|`
                        + `${(p.natspec === undefined) ? ('N/A') : (p.natspec)}|${lineBreak}`;
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
}

export function renderReadme(outputFolder: string) {
    let outputReadme: string;
    if (fs.existsSync(path.join(process.cwd(), 'README.md'))) {
        fs.copyFileSync(
            path.join(process.cwd(), 'README.md'),
            path.join(process.cwd(), outputFolder, 'README.md'),
        );
        outputReadme = fs.readFileSync(path.join(process.cwd(), 'README.md')).toString();
    } else {
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, 'README.md'),
            '# Hello',
        );
        outputReadme = '# Hello';
    }
    // if there's an image reference in readme, copy it
    const files: string[] = [];
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
}

export function renderDocumentationIndex(
    content: string,
    outputFolder: string,
    contractsStructure: IObjectViewData[],
    hasLICENSE: boolean,
    lineBreak: string,
) {
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
}
