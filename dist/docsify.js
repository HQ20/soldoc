"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var organize_1 = require("./organize");
var renderMD_1 = require("./renderMD");
var lineBreak = '\r\n';
/**
 * @param contractsPreparedData prepared data
 */
function generateDocumentation(contractsPreparedData, outputFolder) {
    // create a list of contracts and methods
    var contractsStructure = organize_1.organizeContractsStructure(contractsPreparedData);
    var hasLICENSE = fs_1.default.existsSync(path_1.default.join(process.cwd(), 'LICENSE'));
    renderMD_1.renderContracts(contractsPreparedData, outputFolder, lineBreak);
    // generate _sidebar file (essential in docsify, to have a custom sidebar)
    var SIDEBARContent = "* WELCOME" + lineBreak + "\t* [Home](/)" + lineBreak;
    SIDEBARContent = renderMD_1.renderDocumentationIndex(SIDEBARContent, outputFolder, contractsStructure, hasLICENSE, lineBreak);
    // create _sidebar file
    fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, '_sidebar.md'), SIDEBARContent);
    // Copy readme if it exists, otherwise, create a sampe
    renderMD_1.renderReadme(outputFolder);
    // copy html base
    fs_1.default.copyFileSync(path_1.default.join(__dirname, 'template/docsify/index.html'), path_1.default.join(process.cwd(), outputFolder, 'index.html'));
    // write nojekill
    fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, '.nojekill'), ' ');
}
exports.generateDocumentation = generateDocumentation;
;
//# sourceMappingURL=docsify.js.map