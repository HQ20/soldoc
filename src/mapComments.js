export default (input) => {
    const returnComments = new Map();
    // get original comments
    const comments = input.match(/\/\*\*(\s[ ]+\* [\S ]+)*\s+\*\/\s+function [a-zA-Z]+\(/gm);
    // extract the @notice
    const noticeComment = comments[0].match(/\* @notice ([\w\s*. ]+)/);
    // clean up the comment
    const readableComment = noticeComment[1].replace(/\s+\*/gm, '');
    // put it in a map
    const functioName = comments[0].match(/function (.*)\(/)[1];
    returnComments.set(functioName, readableComment);
    return returnComments;
}