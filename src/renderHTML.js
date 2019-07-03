const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
// to render README.md
const hljs = require('highlight.js');
const mdemoji = require('markdown-it-emoji');
const md = require('markdown-it')({
    highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${
                    hljs.highlight(lang, str, true).value
                }</code></pre>`;
                // eslint-disable-next-line no-empty
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
md.renderer.rules.emoji = (token, idx) => `<i class="twa twa-${token[idx].markup}"></i>`;

/**
 * Using the given parameters, calls the Mustache engine
 * and renders the HTML page.
 * @param {string} templateFile Path for template file
 * @param {string} contractName Contract name
 * @param {object} contractData Contract data, containing ast and comments to be rendered
 * @param {string} contractPath Path to contract file
 */
exports.transformTemplate = (
    templateFile, contractName, contractData, contractPath, contractsStructure, hasLICENSE,
) => {
    // read template into a string
    const templateContent = String(fs.readFileSync(templateFile));
    // put all data together
    const view = {
        filePath: contractPath,
        contract: {
            name: contractName,
        },
        contractData,
        contractsStructure,
        currentDate: new Date(),
        hasLICENSE,
        CONTRACT: true,
    };
    // calls the render engine
    const output = Mustache.render(templateContent, view);
    return output;
};

exports.renderLicense = (
    templateContent, contractsStructure,
) => {
    const LICENSEText = String(fs.readFileSync(path.join(process.cwd(), 'LICENSE'))).trim();
    const LICENSE = LICENSEText.replace(/\n/g, '<br>');
    // put all data together
    const view = {
        contractsStructure,
        hasLICENSE: true,
        LICENSE,
    };
    // calls the render engine
    return Mustache.render(templateContent, view);
};

exports.renderReadme = (
    templateContent, contractsStructure, hasLICENSE,
) => {
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
        contractsStructure,
        hasLICENSE,
        README,
    };
    // calls the render engine
    return Mustache.render(templateContent, view);
};
