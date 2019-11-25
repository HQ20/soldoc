"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var node_emoji_1 = require("node-emoji");
var organize_1 = require("./organize");
var renderHTML_1 = require("./renderHTML");
var defaultTemplatePath = 'src/template/html/index.html';
/**
 * To write!
 * @param {object} contractsData Obect containing all contracts info
 */
function generateDocumentation(contractsPreparedData, outputFolder) {
    // create a list of contracts and methods
    var contractsStructure = organize_1.organizeContractsStructure(contractsPreparedData);
    var hasLICENSE = fs_1.default.existsSync(path_1.default.join(process.cwd(), 'LICENSE'));
    contractsPreparedData.forEach(function (contract) {
        // transform the template
        var HTMLContent = renderHTML_1.transformTemplate(path_1.default.join(contract.currentFolder, defaultTemplatePath), contract.contractName, contract.contractData, contract.solidityFilePath, contractsStructure, hasLICENSE);
        // transform damn weird URLS into real liks
        var match = HTMLContent.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
        if (match !== null) {
            var transform = match.map(function (url) { return url.replace(/&#x2F;/g, '/'); });
            transform = transform.map(function (url) { return "<a href=\"" + url + "\">" + url + "</a>"; });
            for (var i = 0; i < match.length; i += 1) {
                HTMLContent = HTMLContent.replace(match[i], transform[i]);
            }
        }
        var formatEmojify = function (code, name) { return "<i alt=\"" + code + "\" class=\"twa twa-" + name + "\"></i>"; };
        // write it to a file
        fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, contract.filename + ".html"), node_emoji_1.emojify(HTMLContent, null, formatEmojify));
    });
    // If there's a README...
    if (fs_1.default.existsSync(path_1.default.join(process.cwd(), 'README.md'))) {
        // insert into index.html
        var templateContent = String(fs_1.default.readFileSync(path_1.default.join(contractsPreparedData[0].currentFolder, defaultTemplatePath)));
        var outputReadme_1 = renderHTML_1.renderReadme(templateContent, contractsStructure, hasLICENSE);
        // write it to a file
        fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, 'index.html'), outputReadme_1);
        // if there's an image reference in readme, copy it
        var files_1 = [];
        // read dir
        var filesList = fs_1.default.readdirSync(process.cwd());
        // iterate over what was found
        filesList.forEach(function (file) {
            var stats = fs_1.default.lstatSync(path_1.default.join(process.cwd(), file));
            // if not, push file to list, only if it is valid
            if (stats.isFile() && path_1.default.extname(file) === '.png') {
                files_1.push(file);
            }
        });
        // and if the file is n readme, copy it
        files_1.forEach(function (file) {
            if (outputReadme_1.includes(file)) {
                fs_1.default.copyFileSync(path_1.default.join(process.cwd(), file), path_1.default.join(process.cwd(), outputFolder, file));
            }
        });
    }
    // If there's a LICENSE
    if (hasLICENSE) {
        // insert into index.html
        var templateContent = String(fs_1.default.readFileSync(path_1.default.join(contractsPreparedData[0].currentFolder, defaultTemplatePath)));
        var outputLicense = renderHTML_1.renderLicense(templateContent, contractsStructure);
        // write it to a file
        fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, 'license.html'), outputLicense);
    }
    return 0;
}
exports.generateDocumentation = generateDocumentation;
//# sourceMappingURL=html.js.map