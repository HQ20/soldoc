const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../src/index');

describe('Render Web Page - ERC20', () => {
    let browser;
    let page;

    beforeAll(async () => {
        // first render
        generate(false, './docs', './test/contracts/ERC20.sol');
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/ERC20.html'));
    });

    afterAll(async () => {
        // close the browser
        await browser.close();
    });

    /**
     * Title page must be "soldoc"
     */
    test('should be titled "soldoc"', async (done) => {
        await expect(page.title()).resolves.toBe('soldoc');
        done();
    });

    /**
     * The main contract being shown should be named "ERC20"
     */
    test('should be named "ERC20"', async (done) => {
        await page.waitFor('.Content .Content__Title');
        const element = await page.$('.Content .Content__Title');
        const text = await page.evaluate(e => e.textContent, element);
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
        await page.waitFor('.Card .Card__Title');
        const cards = await page.$$('.Card .Card__Title');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate(e => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
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
            + ' Beware that changing an allowance with this method brings the risk that someone may use '
            + 'both the old and the new allowance by unfortunate transaction ordering. One possible '
            + 'solution to mitigate this race condition is to first reduce the spender\'s allowance to '
            + '0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729',
            'Transfer tokens from one address to another. Note that while this function emits an Approval '
            + 'event, this is not required as per the specification, and other compliant implementations '
            + 'may not emit the event.',
            'Increase the amount of tokens that an owner allowed to a spender. approve should be '
            + 'called when _allowed[msg.sender][spender] == 0. To increment allowed value is better '
            + 'to use this function to avoid 2 calls (and wait until the first transaction is mined) '
            + 'From MonolithDAO Token.sol Emits an Approval event.',
            'Decrease the amount of tokens that an owner allowed to a spender. approve should be '
            + 'called when _allowed[msg.sender][spender] == 0. To decrement allowed value is '
            + 'better to use this function to avoid 2 calls (and wait until the first transaction '
            + 'is mined) From MonolithDAO Token.sol Emits an Approval event.',
            'Transfer token for a specified addresses',
            'Internal function that mints an amount of the token and assigns it to an account. '
            + 'This encapsulates the modification of balances such that the proper events are emitted.',
            'Internal function that burns an amount of the token of a given account.',
            'Approve an address to spend another addresses\' tokens.',
            'Internal function that burns an amount of the token of a given account, deducting '
            + 'from the sender\'s allowance for said account. Uses the internal burn function. '
            + 'Emits an Approval event (reflecting the reduced allowance).',
        ];
        await page.waitFor('.Card p > i');
        const cards = await page.$$('.Card p > i');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate(e => e.textContent, cards[c]);
            // TODO: remove .trim after updating to next version of sol-comments-parser
            expect(cardsNames).toContain(text.trim());
        }
        done();
    });
});
