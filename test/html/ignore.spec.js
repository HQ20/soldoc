const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render HTML Page - Ignore', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-ignore', './test/contracts/ignore/Ignore.sol');
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/test-html-ignore/Ignore.html'));
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
     * All the methods should be listed in the main body
     */
    test('should have no methods listed (main body)', async (done) => {
        const cardsNames = [
            'ignoredAlone',
            'ignoredCombined',
        ];
        await page.waitFor('aside');
        const fullHTML = await page.content();
        for (let c = 0; c < cardsNames.length; c += 1) {
            expect(fullHTML).not.toContain(cardsNames[c]);
        }
        done();
    });
});
