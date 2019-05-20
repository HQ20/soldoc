const fs = require('fs');
const path = require('path');
const { generate } = require('../src/index');

describe('Render PDF File - ERC20', () => {
    beforeAll(async () => {
        // first render
        generate(true, './docs', './test/contracts/ERC20.sol');
        // now let's test the result
        // TODO:
    });

    afterAll(async () => {
        // close the browser
    });

    /**
     * File should exist
     */
    test('file should exist', async (done) => {
        const result = fs.existsSync(path.join(process.cwd(), 'docs', 'ERC20.pdf'));
        await expect(result).toBe(true);
        done();
    });
});
