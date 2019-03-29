/**
 * Get the complete .sol file and extract comments into a map where
 * the key is the function name and the value is the comment to
 * that respective function.
 */
exports.mapComments = (input) => {
    const returnComments = new Map();
    // get original comments
    const rawComments = input.match(/\/\*\*(\s[ ]+\* [\S ]+)*\s+\*\/\s+function [a-zA-Z0-9_]+\(/gm);
    rawComments.forEach((comment) => {
        // extract only the comment
        const cleanComment = comment.match(/\/\*\*[\W\w]+\*\//);
        // split by types
        const splitComments = cleanComment[0].split(/\* (@dev|@param|@return)/);
        // start clean arrays
        const paramComments = new Map();
        let devComment = '';
        let returnComment = '';
        for (let c = 1; c < splitComments.length; c += 2) {
            // if it's a param, extract the name
            if (splitComments[c] === '@param') {
                // get param name
                const paramName = splitComments[c + 1].match(/ ([\w\d_]*) /)[1];
                // clean up the comment
                const readableComment = splitComments[c + 1].split(paramName)[1].replace(/\s+\*\/?/gm, '');
                // add to array
                paramComments.set(paramName, readableComment);
            } else if (splitComments[c] === '@return') {
                // clean up the comment
                const readableComment = splitComments[c + 1].replace(/\s+\*\/?/gm, '');
                returnComment = readableComment;
            } else if (splitComments[c] === '@dev') {
                // clean up the comment
                const readableComment = splitComments[c + 1].replace(/\s+\*\/?/gm, '');
                devComment = readableComment;
            }
        }
        // put it in a map
        const functioName = comment.match(/function ([a-zA-Z0-9_]+)\(/)[1];
        returnComments.set(
            functioName,
            {
                // only for test purposes
                paramComments,
                dev: devComment,
                return: returnComment,
                params: () => (val, render) => paramComments.get(render(val)),
            },
        );
    });
    return returnComments;
};
