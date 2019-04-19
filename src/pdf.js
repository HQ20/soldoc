const toPdf = require('pdf-from-html');
const hljs = require('highlight.js');
const emoji = require('markdown-it-emoji');
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

// use emoji plugin
md.use(emoji);
// set emoji rules
md.renderer.rules.emoji = (token, idx) => `<i class="em em-${token[idx].markup}"></i>`;


/**
 * @param contractsPreparedData prepared data
 */
exports.generatePDF = (contractsPreparedData, outputFolder) => {
    let content = '';
    contractsPreparedData.forEach((contract) => {
        //
        content += `# ${contract.contractName}`;
        // add functions name
        contract.contractData.functions.forEach((func) => {
            content += `\n\r### ${func.ast.name}`;
            content += `\n\r**@dev** ${func.comments.dev}`;
            if (func.ast.parameters !== null) {
                func.ast.parameters.parameters.forEach((commentInput) => {
                    content += `\n\r**@param** ${commentInput.typeName.name} `
                    + `${commentInput.name} ${func.comments.paramComments.get(commentInput.name)}`;
                });
            }
            if (func.ast.returnParameters !== null) {
                func.ast.returnParameters.parameters.forEach((commentInput) => {
                    content += `\n\r**@return** ${commentInput.typeName.name} `
                    + `${commentInput.name} ${func.comments.return}`;
                });
            }
        });
        // render it, from markdown to html
        const result = md.render(String(content));
        // generate
        toPdf.generatePDF(outputFolder, contract.filename, result);
    });
};
