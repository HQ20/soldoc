const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render HTML Page - Complete folder', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-folder', './test/contracts/', './test', 'xyz', process.cwd());
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
        const text = await page.evaluate((e) => e.textContent, element);
        expect(text).toBe('Plane');
        done();
    });

    /**
     * All the files should be listed in the side menu
     */
    test('should have all files listed (side menu)', async (done) => {
        const cardsNames = [
            'HOME',
            'LICENSE',
        ];
        await page.waitFor('aside#contracts li.list-group-item');
        const cards = await page.$$('aside#contracts li.list-group-item');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
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
            'Example',
            'Ignore',
            'Animal',
            'Mammal',
            'IMammal',
            'Lion',
            'BarbaryLion',
            'Quadruped',
            'WildLife',
            'SimpleStorage',
        ];
        await page.waitFor('ul#contracts-treeview li a');
        const cards = await page.$$('ul#contracts-treeview li a');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });

    /**
     * All the contracts methods should be listed in the side menu
     */
    test('should have all contracts methods listed (side menu)', async (done) => {
        // should also, not list the ignored ones!
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
            'reverseAge',
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
});
