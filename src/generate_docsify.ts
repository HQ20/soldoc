import fs from 'fs';
import path from 'path';
import {
    organizeContractsStructure,
} from './organize';
import {
    renderContracts,
    renderDocumentationIndex,
    renderReadme,
} from './generate_renderMD';

const lineBreak = '\r\n';

/**
 * @param contractsPreparedData prepared data
 */
export function generateDocumentation(contractsPreparedData: any, outputFolder: any) {
    // create a list of contracts and methods
    const contractsStructure = organizeContractsStructure(contractsPreparedData);
    const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    renderContracts(contractsPreparedData, outputFolder, lineBreak);
    // generate _sidebar file (essential in docsify, to have a custom sidebar)
    let SIDEBARContent = `* WELCOME${lineBreak}\t* [Home](/)${lineBreak}`;
    SIDEBARContent = renderDocumentationIndex(
        SIDEBARContent, outputFolder, contractsStructure, hasLICENSE, lineBreak,
    );
    // create _sidebar file
    fs.writeFileSync(
        path.join(process.cwd(), outputFolder, '_sidebar.md'),
        SIDEBARContent,
    );
    // Copy readme if it exists, otherwise, create a sampe
    renderReadme(outputFolder);
    // copy html base
    fs.copyFileSync(
        path.join(__dirname, 'template/docsify/index.html'),
        path.join(process.cwd(), outputFolder, 'index.html'),
    );
    // write nojekill
    fs.writeFileSync(
        path.join(process.cwd(), outputFolder, '.nojekill'),
        ' ',
    );
}
