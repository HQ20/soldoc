import fs from 'fs';
import path from 'path';

import { DirectoryTree } from 'directory-tree';
import { emojify } from 'node-emoji';
import toPdf from 'pdf-from-html';
import {
    organizeContractsStructure,
} from './organize';
import {
    transformTemplate,
} from './renderHTML';


const defaultTemplatePath = 'dist/template/pdf/index.html';

/**
 * @param contractsPreparedData prepared data
 */
export function generateDocumentation(inputStructure: DirectoryTree, contractsPreparedData: any, outputFolder: any) {
    // create a list of contracts and methods
    const contractsStructure = organizeContractsStructure(contractsPreparedData);
    const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    contractsPreparedData.forEach(async (contract: any) => {
        // transform the template
        let HTMLContent = transformTemplate(
            inputStructure,
            path.join(contract.currentFolder, defaultTemplatePath),
            contract.contractName,
            contract.contractData,
            contract.solidityFilePath,
            contractsStructure,
            hasLICENSE,
        );
        // transform damn weird URLS into real liks
        const match = HTMLContent.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
        if (match !== null) {
            let transform = match.map((url: any) => url.replace(/&#x2F;/g, '/'));
            transform = transform.map((url: any) => `<a href="${url}">${url}</a>`);
            for (let i = 0; i < match.length; i += 1) {
                HTMLContent = HTMLContent.replace(match[i], transform[i]);
            }
        }
        const formatEmojify = (code: any, name: any) => `<i alt="${code}" class="twa twa-${name}"></i>`;
        // generate
        await toPdf.generatePDF(
            outputFolder,
            contract.filename,
            emojify(HTMLContent, null as any, formatEmojify),
        );
    });
}
