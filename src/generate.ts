import fs from 'fs';
import path from 'path';

import { DirectoryTree } from 'directory-tree';
import { emojify } from 'node-emoji';
import toPdf from 'pdf-from-html';
import {
    organizeContractsStructure,
} from './organize';

import { getLanguage, highlight } from 'highlight.js';
import mdemoji from 'markdown-it-emoji';
import { render } from 'mustache';

// tslint:disable-next-line: no-var-requires
const md = require('markdown-it')({
    highlight(str: any, lang: any) {
        if (lang && getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${
                    highlight(lang, str, true).value
                    }</code></pre>`;
                // tslint:disable-next-line: no-empty
            } catch (__) { }
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
    html: true,
    linkify: true,
    typographer: true,
});

// use mdemoji plugin
md.use(mdemoji);
// set mdemoji rules
md.renderer.rules.emoji = (token: any, idx: any) => `<i class="twa twa-${token[idx].markup}"></i>`;



export class Generate {
    private htmlDefaultTemplatePath = 'dist/template/html/index.html';
    private pdfDefaultTemplatePath = 'dist/template/pdf/index.html';

    constructor() {
        //
    }

    /**
     * TODO: to write!
     */
    public html(inputStructure: DirectoryTree, contractsPreparedData: any, outputFolder: any) {
        // create a list of contracts and methods
        const contractsStructure = organizeContractsStructure(contractsPreparedData);
        const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
        contractsPreparedData.forEach((contract: any) => {
            // transform the template
            let HTMLContent = this.transformTemplate(
                inputStructure,
                path.join(contract.currentFolder, this.htmlDefaultTemplatePath),
                contract.contractName,
                contract.contractData,
                contract.solidityFilePath,
                contractsStructure,
                hasLICENSE,
            );
            // transform damn weird URLS into real liks
            const match = HTMLContent.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
            if (match !== null) {
                let transform = match.map((url: string) => url.replace(/&#x2F;/g, '/'));
                transform = transform.map((url: string) => `<a href="${url}">${url}</a>`);
                for (let i = 0; i < match.length; i += 1) {
                    HTMLContent = HTMLContent.replace(match[i], transform[i]);
                }
            }
            const formatEmojify = (code: any, name: any) => `<i alt="${code}" class="twa twa-${name}"></i>`;
            // write it to a file
            fs.writeFileSync(
                path.join(process.cwd(), outputFolder, `${contract.filename}.html`),
                emojify(HTMLContent, null as any, formatEmojify),
            );
        });
        // If there's a README...
        if (fs.existsSync(path.join(process.cwd(), 'README.md'))) {
            // insert into index.html
            const templateContent = String(fs.readFileSync(
                path.join(contractsPreparedData[0].currentFolder, this.htmlDefaultTemplatePath),
            ));
            const outputReadme = this.renderReadme(templateContent, contractsStructure, hasLICENSE);
            // write it to a file
            fs.writeFileSync(
                path.join(process.cwd(), outputFolder, 'index.html'),
                outputReadme,
            );
            // if there's an image reference in readme, copy it
            const files: any = [];
            // read dir
            const filesList = fs.readdirSync(process.cwd());
            // iterate over what was found
            filesList.forEach((file) => {
                const stats = fs.lstatSync(path.join(process.cwd(), file));
                // if not, push file to list, only if it is valid
                if (stats.isFile() && path.extname(file) === '.png') {
                    files.push(file);
                }
            });
            // and if the file is n readme, copy it
            files.forEach((file: any) => {
                if (outputReadme.includes(file)) {
                    fs.copyFileSync(path.join(process.cwd(), file), path.join(process.cwd(), outputFolder, file));
                }
            });
        }
        // If there's a LICENSE
        if (hasLICENSE) {
            // insert into index.html
            const templateContent = String(fs.readFileSync(
                path.join(contractsPreparedData[0].currentFolder, this.htmlDefaultTemplatePath),
            ));
            const outputLicense = this.renderLicense(templateContent, contractsStructure);
            // write it to a file
            fs.writeFileSync(
                path.join(process.cwd(), outputFolder, 'license.html'),
                outputLicense,
            );
        }
        return 0;
    }

    /**
     * TODO: to write!
     */
    public pdf(inputStructure: DirectoryTree, contractsPreparedData: any, outputFolder: any) {
        // create a list of contracts and methods
        const contractsStructure = organizeContractsStructure(contractsPreparedData);
        const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
        contractsPreparedData.forEach(async (contract: any) => {
            // transform the template
            let HTMLContent = this.transformTemplate(
                inputStructure,
                path.join(contract.currentFolder, this.pdfDefaultTemplatePath),
                contract.contractName,
                contract.contractData,
                contract.solidityFilePath,
                contractsStructure,
                hasLICENSE,
            );
            // transform damn weird URLS into real liks
            const match = HTMLContent.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
            if (match !== null) {
                let transform = match.map((url: string) => url.replace(/&#x2F;/g, '/'));
                transform = transform.map((url: string) => `<a href="${url}">${url}</a>`);
                for (let i = 0; i < match.length; i += 1) {
                    HTMLContent = HTMLContent.replace(match[i], transform[i]);
                }
            }
            const formatEmojify = (code: string, name: string) => `<i alt="${code}" class="twa twa-${name}"></i>`;
            // generate
            await toPdf.generatePDF(
                outputFolder,
                contract.filename,
                emojify(HTMLContent, null as any, formatEmojify),
            );
        });
    }

    /**
     * Using the given parameters, calls the Mustache engine
     * and renders the HTML page.
     * @param {string} templateFile Path for template file
     * @param {string} contractName Contract name
     * @param {object} contractData Contract data, containing ast and comments to be rendered
     * @param {string} contractPath Path to contract file
     */
    private transformTemplate(
        inputStructure: DirectoryTree,
        templateFile: any,
        contractName: any,
        contractData: any,
        contractPath: any,
        contractsStructure: any,
        hasLICENSE: any,
    ) {
        // read template into a string
        const templateContent = String(fs.readFileSync(templateFile));
        // put all data together
        const view = {
            CONTRACT: true,
            contract: {
                name: contractName,
            },
            contractData,
            contractStructure: contractsStructure.filter((c: any) => c.name === contractName)[0],
            contracts: contractsStructure,
            currentDate: new Date(),
            filePath: contractPath,
            folderStructure: JSON.stringify(inputStructure),
            hasLICENSE,
        };
        // calls the render engine
        const output = render(templateContent, view);
        return output;
    }

    private renderLicense(
        templateContent: any, contractsStructure: any,
    ) {
        const LICENSEText = String(fs.readFileSync(path.join(process.cwd(), 'LICENSE'))).trim();
        const LICENSE = LICENSEText.replace(/\n/g, '<br>');
        // put all data together
        const view = {
            LICENSE,
            contractsStructure,
            hasLICENSE: true,
        };
        // calls the render engine
        return render(templateContent, view);
    }

    private renderReadme(
        templateContent: any, contractsStructure: any, hasLICENSE: any,
    ) {
        const READMEText = String(fs.readFileSync(path.join(process.cwd(), 'README.md'))).trim();
        // render it, from markdown to html
        const READMEconverted = md.render(READMEText);
        const README = READMEconverted
            .replace(/<h1>/g, '<h1 class="title is-1">')
            .replace(/<h2>/g, '<h2 class="title is-2">')
            .replace(/<h3>/g, '<h3 class="title is-3">')
            .replace(/<h4>/g, '<h4 class="title is-4">')
            .replace(/<ul>/g, '<ul class="menu-list">');
        // put all data together
        const view = {
            README,
            contractsStructure,
            hasLICENSE,
        };
        // calls the render engine
        return render(templateContent, view);
    }
}
