const fs = require('fs');
const path = require('path');
const { generate } = require('../dist/index');

describe('Render MD - ERC20', () => {
    let mdResultFile;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        // can be docsify or gitbook, they generate the same result
        generate('docsify', [], './docs/test-rendermd', './test/contracts/ERC20.sol');
        // now let's test the result
        mdResultFile = (fs.readFileSync(path.join(process.cwd(), '/docs/test-rendermd/ERC20.md'))).toString();
    });

    /**
     * The title to be "ERC20"
     */
    test('should be named "ERC20"', async (done) => {
        expect(mdResultFile).toMatch('# ERC20');
        done();
    });

    /**
     * The functions
     */
    test('should list all the functions', async (done) => {
        expect(mdResultFile).toMatch('## totalSupply');
        expect(mdResultFile).toMatch('## balanceOf');
        expect(mdResultFile).toMatch('## allowance');
        expect(mdResultFile).toMatch('## transfer');
        expect(mdResultFile).toMatch('## approve');
        expect(mdResultFile).toMatch('## transferFrom');
        expect(mdResultFile).toMatch('## increaseAllowance');
        expect(mdResultFile).toMatch('## decreaseAllowance');
        expect(mdResultFile).toMatch('## _transfer');
        expect(mdResultFile).toMatch('## _mint');
        expect(mdResultFile).toMatch('## _burn');
        expect(mdResultFile).toMatch('## _approve');
        expect(mdResultFile).toMatch('## _burnFrom');
        done();
    });

    /**
     * Render dev comments
     */
    test('should list dev comments in functions', async (done) => {
        expect(mdResultFile).toMatch('*Function to check the amount of tokens that '
            + 'an owner allowed to a spender.*');
        expect(mdResultFile).toMatch('*Transfer token to a specified address*');
        expect(mdResultFile).toMatch('*Transfer tokens from one address to another.'
            + ' Note that while this function emits an Approval event, this is not required as '
            + 'per the specification, and other compliant implementations may not emit the event.*');
        done();
    });

    /**
     * Render tables
     */
    test('should list input/output tables', async (done) => {
        expect(mdResultFile).toMatch(
            '|Input/Output|Data Type|Variable Name|Comment|\r\n'
            + '|----------|----------|----------|----------|\r\n'
            + '|input|address|spender|The address which will spend the funds.|\r\n'
            + '|input|uint256|value|The amount of tokens to be spent.|\r\n'
            + '|output|bool|N/A|N/A|',
        );
        done();
    });
});
