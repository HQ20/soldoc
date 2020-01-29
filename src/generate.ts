import fs from 'fs';
import path from 'path';

import dirTree from 'directory-tree';

import { DirectoryTree } from 'directory-tree';
import { emojify } from 'node-emoji';
import toPdf from 'pdf-from-html';
import {
    IObjectViewData, parseSingleSolidityFile,
} from './solidity';

import { getLanguage, highlight } from 'highlight.js';
import mdemoji from 'markdown-it-emoji';
import { render } from 'mustache';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const md = require('markdown-it')({
    highlight(str: string, lang: string) {
        if (lang && getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${
                    highlight(lang, str, true).value}</code></pre>`;
                // eslint-disable-next-line no-empty
            } catch (__) { }
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
    html: true,
    linkify: true,
    typographer: true,
});

md.use(mdemoji);
md.renderer.rules.emoji = (token: [{ markup: string }], idx: number): string => `<i class="twa twa-${token[idx].markup}"></i>`;



/**
 * TODO: to write!
 */
export class Generate {
    private lineBreak = '\r\n';
    private htmlDefaultTemplatePath = 'dist/template/html/index.html';
    private pdfDefaultTemplatePath = 'dist/template/pdf/index.html';
    private docsifyDefaultHTMLTemplatePath = 'template/docsify/index.html';
    private contracts: IObjectViewData[] = [];
    private inputPathStructure: DirectoryTree;
    private outputPath: string;
    private hasLICENSE: boolean;

    /**
     * TODO: to write!
     */
    public constructor(files: string[], exclude: string[], inputPath: string, outputPath: string) {
        files.forEach((file) => this.contracts.push(parseSingleSolidityFile(file)));
        this.outputPath = outputPath;
        this.inputPathStructure = dirTree(inputPath, { exclude: exclude.map((i) => new RegExp(i)) });
        this.hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    }

    /**
     * TODO: to write!
     */
    public gitbook(): void {
        this.renderContracts();
        // generate summary file (essential in gitbook)
        let SUMMARYContent = `# Summary\r\n* WELCOME${this.lineBreak}`;
        SUMMARYContent = this.renderDocumentationIndex(
            SUMMARYContent,
        );
        // create summary file
        fs.writeFileSync(
            path.join(process.cwd(), this.outputPath, 'SUMMARY.md'),
            SUMMARYContent,
        );
        this.renderReadme(true);
    }

    /**
     * TODO: to write!
     */
    public docsify(): void {
        this.renderContracts();
        // generate _sidebar file (essential in docsify, to have a custom sidebar)
        let SIDEBARContent = `* WELCOME${this.lineBreak}\t* [Home](/)${this.lineBreak}`;
        SIDEBARContent = this.renderDocumentationIndex(
            SIDEBARContent,
        );
        // create _sidebar file
        fs.writeFileSync(
            path.join(process.cwd(), this.outputPath, '_sidebar.md'),
            SIDEBARContent,
        );
        this.renderReadme(true);
        // copy html base
        fs.copyFileSync(
            path.join(__dirname, this.docsifyDefaultHTMLTemplatePath),
            path.join(process.cwd(), this.outputPath, 'index.html'),
        );
        // write nojekill
        fs.writeFileSync(
            path.join(process.cwd(), this.outputPath, '.nojekill'),
            ' ',
        );
    }

    /**
     * TODO: to write!
     */
    public html(): number {
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
        this.renderReadme(false);
        // if there's a LICENSE
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
            const outputLicense = render(templateContent, view);
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
    public async pdf(): Promise<void> {
        const totalContracts = this.contracts.length;
        for (let c = 0; c < totalContracts; c += 1) {
            let HTMLContent = this.mustacheRender(
                path.join(this.contracts[c].folder, this.pdfDefaultTemplatePath),
                this.contracts[c],
            );
            HTMLContent = this.fixUrls(HTMLContent);
            await toPdf.generatePDF(
                this.outputPath,
                this.contracts[c].filename,
                this.applyEmojify(HTMLContent),
            );
        }
    }

    /**
     * TODO: to write!
     */
    private renderContracts(): void {
        this.contracts.forEach((contract) => {
            // transform the template
            let MDContent = `# ${contract.name}${this.lineBreak}`;
            if (contract.data.contract !== undefined) {
                if (contract.data.contract.natspec.dev) {
                    MDContent += `*${contract.data.contract.natspec.dev}*${this.lineBreak}`;
                }
                if (contract.data.contract.natspec.notice) {
                    MDContent += `${contract.data.contract.natspec.notice}${this.lineBreak}`;
                }
            }
            contract.data.functions.forEach((f) => {
                MDContent += `## ${f.ast.name}${this.lineBreak}${this.lineBreak}`;
                if (f.ast.natspec === null) {
                    return;
                }
                if (f.ast.natspec.dev) {
                    MDContent += `*${f.ast.natspec.dev}*${this.lineBreak}${this.lineBreak}`;
                }
                if (f.ast.natspec.notice) {
                    MDContent += `${f.ast.natspec.notice}${this.lineBreak}${this.lineBreak}`;
                }
                let table = false;
                if (f.parameters.length > 0) {
                    table = true;
                    MDContent += `${this.lineBreak}|Input/Output|Data Type|Variable Name|Comment|${this.lineBreak}`
                        + `|----------|----------|----------|----------|${this.lineBreak}`;
                    f.parameters.forEach((p: any) => {
                        MDContent += `|input|${p.typeName.name}|${p.name}|${p.natspec}|${this.lineBreak}`;
                    });
                }
                if (f.returnParameters !== null && f.returnParameters.length > 0) {
                    if (!table) {
                        MDContent += `${this.lineBreak}|Input/Output|Data Type|Variable Name|Comment|${this.lineBreak}`
                            + `|----------|----------|----------|----------|${this.lineBreak}`;
                    }
                    f.returnParameters.forEach((p: any) => {
                        MDContent += `|output|${p.typeName.name}|${(p.name === null) ? ('N/A') : (p.name)}|`
                            + `${(p.natspec === undefined) ? ('N/A') : (p.natspec)}|${this.lineBreak}`;
                    });
                }
                MDContent += this.lineBreak;
            });
            // write it to a file
            fs.writeFileSync(
                path.join(process.cwd(), this.outputPath, `${contract.filename}.md`),
                MDContent,
            );
        });
    }

    /**
     * TODO: to write!
     */
    private renderReadme(original: boolean): void {
        let outputReadme = '# Hello';
        if (fs.existsSync(path.join(process.cwd(), 'README.md'))) {
            outputReadme = fs.readFileSync(path.join(process.cwd(), 'README.md')).toString();
        }
        if (original) {
            fs.writeFileSync(
                path.join(process.cwd(), this.outputPath, 'README.md'),
                outputReadme,
            );
        } else {
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
            outputReadme = render(templateContent, view);
            fs.writeFileSync(
                path.join(process.cwd(), this.outputPath, 'index.html'),
                outputReadme,
            );
        }
        // if there's an image reference in readme, copy it
        const files: string[] = [];
        const filesList = fs.readdirSync(process.cwd());
        filesList.forEach((file) => {
            const stats = fs.lstatSync(path.join(process.cwd(), file));
            if (stats.isFile() && (path.extname(file) === '.png' || path.extname(file) === '.jpg')) {
                files.push(file);
            }
        });
        // and if the file is a readme, copy it
        files.forEach((file) => {
            if (outputReadme.includes(file)) {
                fs.copyFileSync(path.join(process.cwd(), file), path.join(process.cwd(), this.outputPath, file));
            }
        });
    }

    /**
     * TODO: to write!
     */
    private renderDocumentationIndex(
        content: string,
    ): string {
        let documentationIndexContent = content;
        if (this.hasLICENSE) {
            documentationIndexContent += `\t* [LICENSE](LICENSE.md)${this.lineBreak}`;
            fs.copyFileSync(
                path.join(process.cwd(), 'LICENSE'),
                path.join(process.cwd(), this.outputPath, 'LICENSE.md'),
            );
        }
        documentationIndexContent += `* CONTRACTS${this.lineBreak}`;
        this.contracts.forEach((s) => {
            documentationIndexContent += `\t* [${s.name}](${s.name}.md)${this.lineBreak}`;
        });
        return documentationIndexContent;
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
    ): string {
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

    private fixUrls(content: string): string {
        const match = content.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
        if (match !== null) {
            let transform = match.map((url: string) => url.replace(/&#x2F;/g, '/'));
            transform = transform.map((url: string) => `<a href="${url}">${url}</a>`);
            for (let i = 0; i < match.length; i += 1) {
                content = content.replace(match[i], transform[i]);
            }
        }
        return content;
    };

    private applyEmojify(content: string): string {
        const formatEmojify = (code: string, name: string): string => `<i alt="${code}" class="twa twa-${name}"></i>`;
        return emojify(content, null as any, formatEmojify);
    };
}
