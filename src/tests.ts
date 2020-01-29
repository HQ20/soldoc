import fs from 'fs';
import path from 'path';
import { parse } from '@typescript-eslint/typescript-estree';


// thanks to Netsi1964 @ https://stackoverflow.com/a/52024318/3348623
function getFilesFromPath(folderPath: string, extension: string): string[] {
    const dir = fs.readdirSync(folderPath);
    const re = new RegExp(extension, 'ig');
    return dir.filter((elm) => re.exec(elm));
}

/**
 * TODO:
 */
export function parseTestsComments(testsPath: string, testsExtension: string): string[] {
    const testFiles = getFilesFromPath(testsPath, testsExtension);
    testFiles.forEach((file) => {
        const code = fs.readFileSync(file).toString();
        const ast = parse(code, {
            comment: true,
            loc: true,
            range: true,
        });
        ast.comments.forEach((comment) => {
            console.log(/@test {([\w#]+)}/ig.exec(comment.value));
        });
    });
    return [];
}
