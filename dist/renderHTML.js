"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var mustache_1 = require("mustache");
// to render README.md
var highlight_js_1 = require("highlight.js");
var markdown_it_emoji_1 = __importDefault(require("markdown-it-emoji"));
var md = require('markdown-it')({
    highlight: function (str, lang) {
        if (lang && highlight_js_1.getLanguage(lang)) {
            try {
                return "<pre class=\"hljs\"><code>" + highlight_js_1.highlight(lang, str, true).value + "</code></pre>";
                // eslint-disable-next-line no-empty
            }
            catch (__) { }
        }
        return "<pre class=\"hljs\"><code>" + md.utils.escapeHtml(str) + "</code></pre>";
    },
    html: true,
    linkify: true,
    typographer: true,
});
// use mdemoji plugin
md.use(markdown_it_emoji_1.default);
// set mdemoji rules
md.renderer.rules.emoji = function (token, idx) { return "<i class=\"twa twa-" + token[idx].markup + "\"></i>"; };
/**
 * Using the given parameters, calls the Mustache engine
 * and renders the HTML page.
 * @param {string} templateFile Path for template file
 * @param {string} contractName Contract name
 * @param {object} contractData Contract data, containing ast and comments to be rendered
 * @param {string} contractPath Path to contract file
 */
function transformTemplate(templateFile, contractName, contractData, contractPath, contractsStructure, hasLICENSE) {
    // read template into a string
    var templateContent = String(fs_1.default.readFileSync(templateFile));
    // put all data together
    var view = {
        filePath: contractPath,
        contract: {
            name: contractName,
        },
        contractData: contractData,
        contractsStructure: contractsStructure,
        currentDate: new Date(),
        hasLICENSE: hasLICENSE,
        CONTRACT: true,
    };
    // calls the render engine
    var output = mustache_1.render(templateContent, view);
    return output;
}
exports.transformTemplate = transformTemplate;
;
function renderLicense(templateContent, contractsStructure) {
    var LICENSEText = String(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'LICENSE'))).trim();
    var LICENSE = LICENSEText.replace(/\n/g, '<br>');
    // put all data together
    var view = {
        contractsStructure: contractsStructure,
        hasLICENSE: true,
        LICENSE: LICENSE,
    };
    // calls the render engine
    return mustache_1.render(templateContent, view);
}
exports.renderLicense = renderLicense;
;
function renderReadme(templateContent, contractsStructure, hasLICENSE) {
    var READMEText = String(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'README.md'))).trim();
    // render it, from markdown to html
    var READMEconverted = md.render(READMEText);
    var README = READMEconverted
        .replace(/<h1>/g, '<h1 class="title is-1">')
        .replace(/<h2>/g, '<h2 class="title is-2">')
        .replace(/<h3>/g, '<h3 class="title is-3">')
        .replace(/<h4>/g, '<h4 class="title is-4">')
        .replace(/<ul>/g, '<ul class="menu-list">');
    // put all data together
    var view = {
        contractsStructure: contractsStructure,
        hasLICENSE: hasLICENSE,
        README: README,
    };
    // calls the render engine
    return mustache_1.render(templateContent, view);
}
exports.renderReadme = renderReadme;
;
//# sourceMappingURL=renderHTML.js.map