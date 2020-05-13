const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render HTML Page - ERC20', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-erc20', './test/contracts/ERC20.sol', './test', 'xyz', process.cwd());
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/test-html-erc20/ERC20.html'));
    });

    afterAll(async () => {
        // close the browser
        await browser.close();
    });

    /**
     * Title page must be "soldoc"
     */
    test('should be titled "soldoc"', async (done) => {
        await expect(page.title()).resolves.toBe('soldoc | soldoc');
        done();
    });

    /**
     * The main contract being shown should be named "ERC20"
     */
    test('should be named "ERC20"', async (done) => {
        await page.waitFor('h1#contractName');
        const element = await page.$('h1#contractName');
        const text = await page.evaluate((e) => e.textContent, element);
        expect(text).toBe('ERC20');
        done();
    });

    /**
     * All the methods should be listed in the main body
     */
    test('should have all methods listed (main body)', async (done) => {
        const cardsNames = [
            'totalSupply',
            'balanceOf',
            'allowance',
            'transfer',
            'approve',
            'transferFrom',
            'increaseAllowance',
            'decreaseAllowance',
            '_transfer',
            '_mint',
            '_burn',
            '_approve',
            '_burnFrom',
        ];
        await page.waitFor('aside ul#functions li a');
        const cards = await page.$$('aside ul#functions li a');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });

    /**
     * All the inputs and outputs should be listed
     */
    test('should have all inputs and outputs listed', async (done) => {
        // TODO: will be refactored
        // const cardsNames = [
        //     'input',
        //     'address',
        //     'owner',
        //     'The address to query the balance of.',
        //     'output',
        //     'uint256',
        //     'A uint256 representing the amount owned by the passed address.',
        //     'input',
        //     'address',
        //     'owner',
        //     'The address which owns the funds.',
        //     'input',
        //     'address',
        //     'spender',
        //     'The address which will spend the funds.',
        //     'output',
        //     'uint256',
        //     'A uint256 specifying the amount of tokens still available for the spender.',
        // ];
        // await page.waitFor('table.table tbody tr td');
        // const cards = await page.$$('table.table tbody tr td');
        // const allCards = [];
        // for (let c = 0; c < cards.length; c += 1) {
        //     // eslint-disable-next-line no-await-in-loop
        //     const text = await page.evaluate((e) => e.textContent, cards[c]);
        //     allCards.push(text);
        // }
        // expect(allCards).toEqual(expect.arrayContaining(cardsNames));
        done();
    });

    /**
     * All dev comments show be shown correctly
     */
    test('should have all dev comments', async (done) => {
        const cardsNames = [
            'Total number of tokens in existence',
            'Gets the balance of the specified address.',
            'Function to check the amount of tokens that an owner allowed to a spender.',
            'Transfer token to a specified address',
            'Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.'
            + '\nBeware that changing an allowance with this method brings the risk that someone may use '
            + 'both the old\nand the new allowance by unfortunate transaction ordering. One possible '
            + 'solution to mitigate this\nrace condition is to first reduce the spender\'s allowance to '
            + '0 and set the desired value afterwards:\nhttps://github.com/ethereum/EIPs/issues/20#issuecomment-263524729',
            'Transfer tokens from one address to another.\nNote that while this function emits an Approval '
            + 'event, this is not required as per the specification,\nand other compliant implementations '
            + 'may not emit the event.',
            'Increase the amount of tokens that an owner allowed to a spender.\napprove should be '
            + 'called when _allowed[msg.sender][spender] == 0. To increment\nallowed value is better '
            + 'to use this function to avoid 2 calls (and wait until\nthe first transaction is mined)'
            + '\nFrom MonolithDAO Token.sol\nEmits an Approval event.',
            'Decrease the amount of tokens that an owner allowed to a spender.\napprove should be '
            + 'called when _allowed[msg.sender][spender] == 0. To decrement\nallowed value is '
            + 'better to use this function to avoid 2 calls (and wait until\nthe first transaction '
            + 'is mined)\nFrom MonolithDAO Token.sol\nEmits an Approval event.',
            'Transfer token for a specified addresses',
            'Internal function that mints an amount of the token and assigns it to\nan account. '
            + 'This encapsulates the modification of balances such that the\nproper events are emitted.',
            'Internal function that burns an amount of the token of a given\naccount.',
            'Approve an address to spend another addresses\' tokens.',
            'Internal function that burns an amount of the token of a given\naccount, deducting '
            + 'from the sender\'s allowance for said account. Uses the\ninternal burn function.'
            + '\nEmits an Approval event (reflecting the reduced allowance).',
        ];
        await page.waitFor('div.soldoc-box div.box-info p > i');
        const cards = await page.$$('div.soldoc-box div.box-info p > i');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            expect(cardsNames).toContain(text.trim());
        }
        done();
    });
});
