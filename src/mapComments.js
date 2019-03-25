/**
 * Get the complete .sol file and extract comments into a map where
 * the key is the function name and the value is the comment to
 * that respective function.
 */
export default (input) => {
    const returnComments = new Map();
    // get original comments
    const comments = input.match(/\/\*\*(\s[ ]+\* [\S ]+)*\s+\*\/\s+function [a-zA-Z0-9_]+\(/gm);
    comments.forEach(comment => {
        // extract only the comment
        const cleanComment = comment.match(/\/\*\*[\W\w]+\*\//);
        // extract the @dev
        const devComment = cleanComment[0].match(/\* @dev ([\w\s*,.\[\]=\(\)':/#\- ]+)/);
        // clean up the comment
        const readableComment = devComment[1].replace(/\s+\*\/?/gm, '');
        // put it in a map
        const functioName = comment.match(/function ([a-zA-Z0-9_]+)\(/)[1];
        returnComments.set(functioName, readableComment);
    });
    return returnComments;
}