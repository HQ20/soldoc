const fs = require('fs');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render Docssify - ERC20', () => {
    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('docsify', [], './docs/docsify-test', './test/contracts/ERC20.sol', './test', 'xyz');
    });

    /**
     * The have correct sidebar
     */
    test('should have correct _sidebar', async (done) => {
        const summary = (fs.readFileSync(path.join(process.cwd(), '/docs/docsify-test/_sidebar.md'))).toString();
        expect(summary).toMatch('* CONTRACTS\r\n\t* [ERC20](ERC20.md)');
        expect(summary).toMatch('* WELCOME\r\n\t* [Home](/)\r\n\t* [LICENSE](LICENSE.md)');
        done();
    });

    /**
     * The have correct sidebar
     */
    test('should have .nojekill file', async (done) => {
        expect(fs.existsSync(path.join(process.cwd(), '/docs/docsify-test/.nojekill'))).toBeTruthy();
        done();
    });
});
