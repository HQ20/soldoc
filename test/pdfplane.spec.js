const fs = require('fs');
const path = require('path');
const { generate } = require('../src/index');

describe('Render PDF File - Plane', () => {
    beforeAll(async () => {
        // first render
        generate(true, './docs', './test/contracts/Plane.sol');
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
        const result = fs.existsSync(path.join(process.cwd(), 'docs', 'Plane.pdf'));
        await expect(result).toBe(true);
        done();
    });
});
