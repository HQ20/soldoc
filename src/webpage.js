const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const emoji = require('node-emoji');
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
function transformTemplate(
    templateFile, contractName, contractData, contractPath, contractsStructure, hasLICENSE,
) {
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
}

/**
 * To write!
 * @param {object} contractsData Obect containing all contracts info
 */
exports.generateDocumentation = (contractsPreparedData, outputFolder) => {
    // create a list of contracts and methods
    const contractsStructure = [];
    const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    contractsPreparedData.forEach((contract) => {
        const contractInfo = {};
        // add name
        contractInfo.name = contract.contractName;
        contractInfo.filename = contract.filename;
        contractInfo.functions = [];
        // add functions name
        contract.contractData.functions.forEach((func) => {
            contractInfo.functions.push({ name: func.ast.name });
        });
        contractsStructure.push(contractInfo);
    });
    // verify if the docs/ folder exist and creates it if not
    const destinationDocsFolderPath = path.join(process.cwd(), outputFolder);
    if (!fs.existsSync(destinationDocsFolderPath)) {
        fs.mkdirSync(destinationDocsFolderPath);
    }
    contractsPreparedData.forEach((contract) => {
        // transform the template
        const HTMLContent = transformTemplate(
            path.join(contract.currentFolder, 'src/template/index.html'),
            contract.contractName,
            contract.contractData,
            contract.solidityFilePath,
            contractsStructure,
            hasLICENSE,
        );
        const formatEmojify = (code, name) => `<i alt="${code}" class="twa twa-${name}"></i>`;
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, `${contract.filename}.html`),
            emoji.emojify(HTMLContent, null, formatEmojify),
        );
    });
    // If there's a README...
    if (fs.existsSync(path.join(process.cwd(), 'README.md'))) {
        // insert into index.html
        const templateContent = String(fs.readFileSync(
            path.join(contractsPreparedData[0].currentFolder, 'src/template/index.html'),
        ));
        const READMEText = String(fs.readFileSync(path.join(process.cwd(), 'README.md'))).trim();
        // render it, from markdown to html
        const READMEconverted = md.render(READMEText);
        const README = READMEconverted
            .replace(new RegExp('<h1>', 'g'), '<h1 class="title is-1">')
            .replace(new RegExp('<h2>', 'g'), '<h2 class="title is-2">')
            .replace(new RegExp('<h3>', 'g'), '<h3 class="title is-3">')
            .replace(new RegExp('<h4>', 'g'), '<h4 class="title is-4">')
            .replace(new RegExp('<ul>', 'g'), '<ul class="menu-list">');
        // console.log(result);
        // put all data together
        const view = {
            contractsStructure,
            hasLICENSE,
            README,
        };
        // calls the render engine
        const output = Mustache.render(templateContent, view);
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, 'index.html'),
            output,
        );
    }
    // If there's a LICENSE
    if (hasLICENSE) {
        // insert into index.html
        const templateContent = String(fs.readFileSync(
            path.join(contractsPreparedData[0].currentFolder, 'src/template/index.html'),
        ));
        const LICENSEText = String(fs.readFileSync(path.join(process.cwd(), 'LICENSE'))).trim();
        const LICENSE = LICENSEText.replace(new RegExp('\\n', 'g'), '<br>');
        // put all data together
        const view = {
            contractsStructure,
            hasLICENSE: true,
            LICENSE,
        };
        // calls the render engine
        const output = Mustache.render(templateContent, view);
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, 'license.html'),
            output,
        );
    }
};
