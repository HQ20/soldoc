const fs = require('fs');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render Gitbook - ERC20', () => {
    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('gitbook', [], './docs/gitbook-test', './test/contracts/ERC20.sol', './test', 'xyz', process.cwd());
    });

    /**
     * The title to be "ERC20"
     */
    test('should be have correct summary', async (done) => {
        const summary = (fs.readFileSync(path.join(process.cwd(), '/docs/gitbook-test/SUMMARY.md'))).toString();
        expect(summary).toMatch('# Summary');
        expect(summary).toMatch('* CONTRACTS\r\n\t* [ERC20](ERC20.md)');
        expect(summary).toMatch('* WELCOME\r\n\t* [LICENSE](LICENSE.md)');
        done();
    });
});
