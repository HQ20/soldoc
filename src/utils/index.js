const fs = require('fs');

/**
 * List all files in a directory in Node.js recursively in a synchronous fashion
 * Thanks to https://gist.github.com/kethinov/6658166#gistcomment-1603591
 */
exports.walkSync = (dir, filelist) => {
    const files = fs.readdirSync(dir);
    // eslint-disable-next-line no-param-reassign
    filelist = filelist || [];
    files.forEach((file) => {
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            // eslint-disable-next-line no-param-reassign
            filelist = this(`${dir}/${file}`, filelist);
        } else {
            filelist.push(file);
        }
    });
    return filelist;
};
