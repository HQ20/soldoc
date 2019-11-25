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
    // generate summary file (essential in gitbook)
    var SUMMARYContent = "# Summary\r\n* WELCOME" + lineBreak;
    SUMMARYContent = renderMD_1.renderDocumentationIndex(SUMMARYContent, outputFolder, contractsStructure, hasLICENSE, lineBreak);
    // create summary file
    fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, 'SUMMARY.md'), SUMMARYContent);
    // Copy readme if it exists, otherwise, create a sampe
    renderMD_1.renderReadme(outputFolder);
}
exports.generateDocumentation = generateDocumentation;
//# sourceMappingURL=gitbook.js.map