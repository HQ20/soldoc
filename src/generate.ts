import fs from 'fs';
import path from 'path';

import dirTree from 'directory-tree';

import { DirectoryTree } from 'directory-tree';
import { emojify } from 'node-emoji';
import toPdf from 'pdf-from-html';
import {
    IObjectViewData, prepareForFile,
} from './organize';

import { getLanguage, highlight } from 'highlight.js';
import mdemoji from 'markdown-it-emoji';
import { render } from 'mustache';

// tslint:disable-next-line: no-var-requires
const md = require('markdown-it')({
    highlight(str: string, lang: string) {
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

md.use(mdemoji);
md.renderer.rules.emoji = (token: Array<{ markup: string }>, idx: number) => `<i class="twa twa-${token[idx].markup}"></i>`;



export class Generate {
    private htmlDefaultTemplatePath = 'dist/template/html/index.html';
    private pdfDefaultTemplatePath = 'dist/template/pdf/index.html';
    private contracts: IObjectViewData[] = [];
    private inputPathStructure: DirectoryTree;
    private outputPath: string;
    private hasLICENSE: boolean;

    constructor(files: string[], exclude: string[], inputPath: string, outputPath: string) {
        files.forEach((file) => this.contracts.push(prepareForFile(file)));
        this.outputPath = outputPath;
        this.inputPathStructure = dirTree(inputPath, { exclude: exclude.map((i) => new RegExp(i)) });
        this.hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    }

    /**
     * TODO: to write!
     */
    public html() {
        this.contracts.forEach((contract) => {
            let HTMLContent = this.mustacheRender(
                path.join(contract.folder, this.htmlDefaultTemplatePath),
                contract,
            );
            HTMLContent = this.fixUrls(HTMLContent);
            fs.writeFileSync(
                path.join(process.cwd(), this.outputPath, `${contract.filename}.html`),
                this.applyEmojify(HTMLContent),
            );
        });
        if (fs.existsSync(path.join(process.cwd(), 'README.md'))) {
            const templateContent = String(fs.readFileSync(
                path.join(this.contracts[0].folder, this.htmlDefaultTemplatePath),
            ));
            const pureREADME = String(fs.readFileSync(path.join(process.cwd(), 'README.md'))).trim();
            const view = {
                README: md.render(pureREADME),
                contractsStructure: this.contracts,
                folderStructure: JSON.stringify(this.inputPathStructure),
                hasLICENSE: this.hasLICENSE,
            };
            const outputReadme = render(templateContent, view);
            fs.writeFileSync(
                path.join(process.cwd(), this.outputPath, 'index.html'),
                outputReadme,
            );
            const files: string[] = [];
            const filesList = fs.readdirSync(process.cwd());
            filesList.forEach((file) => {
                const stats = fs.lstatSync(path.join(process.cwd(), file));
                if (stats.isFile() && path.extname(file) === '.png') {
                    files.push(file);
                }
            });
            files.forEach((file) => {
                if (outputReadme.includes(file)) {
                    fs.copyFileSync(path.join(process.cwd(), file), path.join(process.cwd(), this.outputPath, file));
                }
            });
        }
        if (this.hasLICENSE) {
            const templateContent = String(fs.readFileSync(
                path.join(this.contracts[0].folder, this.htmlDefaultTemplatePath),
            ));
            const LICENSEText = String(fs.readFileSync(path.join(process.cwd(), 'LICENSE'))).trim();
            const LICENSE = LICENSEText.replace(/\n/g, '<br>');
            const view = {
                LICENSE,
                contractsStructure: this.contracts,
                folderStructure: JSON.stringify(this.inputPathStructure),
                hasLICENSE: true,
            };
            const outputLicense =  render(templateContent, view);
            fs.writeFileSync(
                path.join(process.cwd(), this.outputPath, 'license.html'),
                outputLicense,
            );
        }
        return 0;
    }

    /**
     * TODO: to write!
     */
    public pdf() {
        this.contracts.forEach(async (contract) => {
            let HTMLContent = this.mustacheRender(
                path.join(contract.folder, this.pdfDefaultTemplatePath),
                contract,
            );
            HTMLContent = this.fixUrls(HTMLContent);
            await toPdf.generatePDF(
                this.outputPath,
                contract.filename,
                this.applyEmojify(HTMLContent),
            );
        });
    }

    /**
     * Using the given parameters, calls the Mustache engine
     * and renders the HTML page.
     * @param {string} templateFilePath Path for template file
     * @param {string} contract contract object
     */
    private mustacheRender(
        templateFilePath: string,
        contract: IObjectViewData,
    ) {
        const templateContent = String(fs.readFileSync(templateFilePath));
        const view = {
            contract,
            contracts: this.contracts,
            currentDate: new Date(),
            folderStructure: JSON.stringify(this.inputPathStructure),
            hasLICENSE: this.hasLICENSE,
        };
        const output = render(templateContent, view);
        return output;
    }

    private fixUrls = (content: string) => {
        const match = content.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
        if (match !== null) {
            let transform = match.map((url: string) => url.replace(/&#x2F;/g, '/'));
            transform = transform.map((url: string) => `<a href="${url}">${url}</a>`);
            for (let i = 0; i < match.length; i += 1) {
                content = content.replace(match[i], transform[i]);
            }
        }
        return content;
    }

    private applyEmojify = (content: string) => {
        const formatEmojify = (code: string, name: string) => `<i alt="${code}" class="twa twa-${name}"></i>`;
        return emojify(content, null as any, formatEmojify);
    }
}
