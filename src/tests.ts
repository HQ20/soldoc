import fs from 'fs';
import path from 'path';
import { parse } from '@typescript-eslint/typescript-estree';
import { SourceLocation } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';


// thanks to Netsi1964 @ https://stackoverflow.com/a/52024318/3348623
function getFilesFromPath(folderPath: string, extension: string): string[] {
    const dir = fs.readdirSync(folderPath);
    const re = new RegExp(extension, 'ig');
    return dir.filter((elm) => re.exec(elm));
}

export interface IMethodTestComment {
    filePath: string;
    name: string;
    loc: SourceLocation;
}
/**
 * TODO:
 */
export function parseTestsComments(testsPath: string, testsExtension: string): Map<string, IMethodTestComment[]> {
    const testFiles = getFilesFromPath(testsPath, testsExtension);
    const result = new Map<string, IMethodTestComment[]>();
    testFiles.forEach((file) => {
        const filePath = path.join(testsPath, file);
        const code = fs.readFileSync(filePath).toString();
        const ast = parse(code, {
            comment: true,
            loc: true,
            range: true,
        });
        ast.comments.forEach((comment) => {
            const query = /@test {([\w#]+)}/ig.exec(comment.value);
            if (query !== null && query !== undefined) {
                const content = query[1];
                if (content !== null && content !== undefined) {
                    const contentHashtag = content.indexOf('#');
                    const contractName = content.substr(0, contentHashtag > 0 ? contentHashtag : content.length);
                    let commentMap = result.get(contractName);
                    if (commentMap === null || commentMap === undefined) {
                        commentMap = [];
                    }
                    if (contentHashtag > 0) {
                        commentMap.push({
                            filePath,
                            loc: comment.loc,
                            name: content.substr(contentHashtag + 1, content.length),
                        });
                    } else {
                        commentMap.push({
                            filePath,
                            loc: comment.loc,
                            name: '#',
                        });
                    }
                    result.set(contractName, commentMap);
                }
            }
        });
    });
    return result;
}
