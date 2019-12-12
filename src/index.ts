import { Console } from 'console';
import fs from 'fs';
import path from 'path';

import dirTree from 'directory-tree';

import { generateDocumentation as generateDocumentationDocsify } from './docsify';
import { generateDocumentation as generateDocumentationGitbook } from './gitbook';
import { generateDocumentation as generateDocumentationHTML } from './html';
import { prepareForFile } from './organize';
import { generateDocumentation as generateDocumentationPDF } from './pdf';

const terminalConsole = new Console(process.stdout, process.stderr);


/**
 * Get all files in folder, recursively.
 * @param {string} folder folder path
 * @param {array} ignoreFilesList an array of files to be ignored
 */
function deepListFiles(folder: string, ignoreFilesList: string[]): string[] {
    const files: string[] = [];
    // read dir
    const filesList = fs.readdirSync(folder);
    // iterate over what was found
    filesList.forEach((file) => {
        if (ignoreFilesList.includes(file)) {
            return;
        }
        const stats = fs.lstatSync(path.join(folder, file));
        // lets see if it is a directory
        if (stats.isDirectory()) {
            // if so, navigate
            const result = deepListFiles(path.join(folder, file), ignoreFilesList);
            // push them all
            result.forEach((r) => files.push(r));
            return;
        }
        // if not, push file to list, only if it is valid
        if (path.extname(file) === '.sol') {
            files.push(path.join(folder, file));
        }
    });
    return files;
}

/**
 * Main method to be called. Will create the HTML using the other methods.
 * @param {string} outputType the output type of the given documentation
 * @param {string} ignoreFilesList an array of files to be ignored
 * @param {string} outputFolder directory to output the result, either pdf or html
 * @param {string} inputPath the path to file or folder to be analized
 */
export function generate(outputType: string, ignoreFilesList: string[], outputFolder: string, inputPath: string): number {
    // verify the type of the given input
    let stats;
    try {
        stats = fs.lstatSync(inputPath);
    } catch (e) {
        // Handle error
        terminalConsole.log(`The file you are looking for (${inputPath}) doesn't exist!`);
        return 1;
    }

    let files = [];
    // verify if the input is a directory, file or array of files
    if (stats.isDirectory()) {
        // if it's a folder, get all files recursively
        files = deepListFiles(inputPath, ignoreFilesList);
    } else if (stats.isFile() && !ignoreFilesList.includes(inputPath)) {
        // if it's a file, just get the file
        files.push(inputPath);
    }
    // iterate over files to generate HTML
    const prepared: any[] = [];
    files.forEach((file) => prepared.push(prepareForFile(file)));
    // verify if the docs/ folder exist and creates it if not
    const destinationDocsFolderPath = path.join(process.cwd(), outputFolder);
    if (!fs.existsSync(destinationDocsFolderPath)) {
        fs.mkdirSync(destinationDocsFolderPath, { recursive: true });
    }
    const inputStructure = dirTree(inputPath, { exclude: ignoreFilesList.map((i) => new RegExp(i)) });
    if (outputType === 'pdf') {
        generateDocumentationPDF(inputStructure, prepared, outputFolder);
    } else if (outputType === 'html') {
        generateDocumentationHTML(inputStructure, prepared, outputFolder);
    } else if (outputType === 'gitbook') {
        generateDocumentationGitbook(prepared, outputFolder);
    } else if (outputType === 'docsify') {
        generateDocumentationDocsify(prepared, outputFolder);
    } else {
        terminalConsole.error('Invalid output type! Try --help for more info.');
        return 1;
    }
    return 0;
}
