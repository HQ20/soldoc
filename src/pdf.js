const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const toPdf = require('pdf-from-html');
const hljs = require('highlight.js');
const emoji = require('node-emoji');
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
    linkify: true,
    typographer: true,
});
const { transformTemplate } = require('./renderHTML');

// use emoji plugin
md.use(mdemoji);
// set emoji rules
md.renderer.rules.emoji = (token, idx) => `<i class="em em-${token[idx].markup}"></i>`;


const defaultTemplatePath = 'src/template/pdf/index.html';

/**
 * @param contractsPreparedData prepared data
 */
exports.generatePDF = (contractsPreparedData, outputFolder) => {
    contractsPreparedData.forEach(async (contract) => {
        let HTMLContent = transformTemplate(
            path.join(contract.currentFolder, defaultTemplatePath),
            contract.contractName,
            contract.contractData,
            contract.solidityFilePath,
        );
        // transform damn weird URLS into real liks
        const match = HTMLContent.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
        if (match !== null) {
            let transform = match.map(url => url.replace(/&#x2F;/g, '/'));
            transform = transform.map(url => `<a href="${url}">${url}</a>`);
            for (let i = 0; i < match.length; i += 1) {
                HTMLContent = HTMLContent.replace(match[i], transform[i]);
            }
        }
        const formatEmojify = (code, name) => `<i alt="${code}" class="twa twa-${name}"></i>`;
        // generate
        await toPdf.generatePDF(
            outputFolder,
            contract.filename,
            emoji.emojify(HTMLContent, null, formatEmojify),
        );
    });
};
