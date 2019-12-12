import fs from 'fs';
import path from 'path';

import { getLanguage, highlight } from 'highlight.js';
import mdemoji from 'markdown-it-emoji';
import { render } from 'mustache';
import { IFolderStructure } from '.';

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

/**
 * Using the given parameters, calls the Mustache engine
 * and renders the HTML page.
 * @param {string} templateFile Path for template file
 * @param {string} contractName Contract name
 * @param {object} contractData Contract data, containing ast and comments to be rendered
 * @param {string} contractPath Path to contract file
 */
export function transformTemplate(
    inputStructure: IFolderStructure[],
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

export function renderLicense(
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

export function renderReadme(
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
