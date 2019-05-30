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
    contractsPreparedData.forEach(async (contract) => {
        let content = '';
        // extract contracts comments
        if (contract.contractData.contract !== undefined) {
            const {
                title, dev, notice, author,
            } = contract.contractData.contract;
            content += `# ${contract.contractName}`;
            if (title.length > 0 || author.length > 0) {
                content += '\n\r\\- ';
                if (title.length > 0) {
                    content += `${title} `;
                }
                if (author.length > 0) {
                    content += `*by ${author}*`;
                }
            }
            if (notice.length > 0) {
                content += `\n\r${notice}`;
            }
            if (dev.length > 0) {
                content += `\n\r*${dev}*`;
            }
        }
        // extract constructor comments
        if (contract.contractData.constructor !== null) {
            const {
                dev, notice, author,
            } = contract.contractData.constructor.comments;
            if (notice.length > 0) {
                content += `\n\r${notice}`;
            }
            if (dev.length > 0) {
                content += `\n\r*${dev}*`;
            }
            if (author.length > 0) {
                content += `\n\r\\- *by ${author}*`;
            }
        }
        // extract event comments
        contract.contractData.events.forEach((event) => {
            content += `\n\r## ${event.ast.name}`;
            if (event.comments === undefined) {
                return;
            }
            const {
                notice, dev, author,
            } = event.comments;
            if (notice.length > 0) {
                content += `\n\r${notice}`;
            }
            if (dev.length > 0) {
                content += `\n\r**@dev** ${dev}`;
            }
            if (author.length > 0) {
                content += `\n\r*by ${author}*`;
            }
            if (event.ast.parameters !== null) {
                event.ast.parameters.parameters.forEach((commentInput) => {
                    content += `\n\r* @param \`${commentInput.typeName.name}\` `
                        + `**${commentInput.name}** ${event.comments.param.get(commentInput.name)}`;
                });
            }
        });
        // extract functions comments
        contract.contractData.functions.forEach((func) => {
            content += `\n\r## ${func.ast.name}`;
            if (func.comments === undefined) {
                return;
            }
            const {
                notice, dev, author,
            } = func.comments;
            if (notice.length > 0) {
                content += `\n\r* ${notice}`;
            }
            if (dev.length > 0) {
                content += `\n\r**@dev** ${dev}`;
            }
            if (author.length > 0) {
                content += `\n\r*by ${author}*`;
            }
            if (func.ast.parameters !== null) {
                func.ast.parameters.parameters.forEach((commentInput) => {
                    content += `\n\r@param \`${commentInput.typeName.name}\` `
                        + `**${commentInput.name}** ${func.paramComments.get(commentInput.name)}`;
                });
            }
            if (func.ast.returnParameters !== null) {
                func.ast.returnParameters.parameters.forEach((commentOutput) => {
                    content += `\n\r@return \`${commentOutput.typeName.name}\` `
                        + `${func.comments.return}`;
                });
            }
        });
        // render it, from markdown to html
        const result = md.render(String(content));
        // generate
        await toPdf.generatePDF(outputFolder, contract.filename, result);
    });
};
