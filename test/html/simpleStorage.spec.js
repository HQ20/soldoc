const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render HTML Page - SimpleStorage', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-simpleStorage', './test/contracts/SimpleStorage.sol', './test/example_test_contracts', '\.(spec|test)\.[tj]s\.txt', '/my/base/fs');
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/test-html-simpleStorage/SimpleStorage.html'));
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
     * The main contract being shown should be named "SimpleStorage"
     */
    test('should be named "SimpleStorage"', async (done) => {
        await page.waitFor('h1#contractName');
        const element = await page.$('h1#contractName');
        const text = await page.evaluate((e) => e.textContent, element);
        expect(text).toBe('SimpleStorage');
        done();
    });

    /**
     * The main contract being shown should be named "SimpleStorage"
     */
    test('should find all the links to tests', async (done) => {
        const cardsNames = [
            'file:///my/base/fs/test/example_test_contracts/some.test.js.txt',
            'file:///my/base/fs/test/example_test_contracts/some.test.js.txt',
            'file:///my/base/fs/test/example_test_contracts/some.test.js.txt',
            'file:///my/base/fs/test/example_test_contracts/some.test.ts.txt',
        ];
        await page.waitFor('div#test-links a');
        const cards = await page.$$('div#test-links a');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.href, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });
});
