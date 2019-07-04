const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../src/index');

describe('Render HTML Page - Complete folder', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-folder', './test/contracts/');
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/test-html-folder/Plane.html'));
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
     * The main contract being shown should be named "Plane"
     */
    test('should be named "Plane"', async (done) => {
        await page.waitFor('h1#contractName');
        const element = await page.$('h1#contractName');
        const text = await page.evaluate(e => e.textContent, element);
        expect(text).toBe('Plane');
        done();
    });

    /**
     * All the contracts should be listed in the side menu
     */
    test('should have all contracts listed (side menu)', async (done) => {
        const cardsNames = [
            'ERC20',
            'IERC20',
            'Plane',
            'Tree',
        ];
        await page.waitFor('aside.menu p.menu-label');
        const cards = await page.$$('aside.menu p.menu-label');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate(e => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });

    /**
     * All the contracts methods should be listed in the side menu
     */
    test('should have all contracts methods listed (side menu)', async (done) => {
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
            'transfer',
            'approve',
            'transferFrom',
            'totalSupply',
            'balanceOf',
            'allowance',
            'land',
            'age',
        ];
        await page.waitFor('aside.menu ul a');
        const cards = await page.$$('aside.menu ul a');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate(e => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });
});
