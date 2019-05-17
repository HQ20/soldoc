const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../src/index');

describe('Render Web Page', () => {
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
});
