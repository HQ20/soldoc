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

const defaultTemplatePath = 'src/template/web/index.html';


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
