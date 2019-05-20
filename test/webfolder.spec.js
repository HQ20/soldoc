const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../src/index');

describe('Render Web Page - Complete folder', () => {
    let browser;
    let page;

    beforeAll(async () => {
        // first render
        generate(false, './docs', './test/contracts/');
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/Plane.html'));
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
        await page.waitFor('.Content .Content__Title');
        const element = await page.$('.Content .Content__Title');
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
        await page.waitFor('dt');
        const cards = await page.$$('dt');
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
        await page.waitFor('dd');
        const cards = await page.$$('dd');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate(e => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });
});
