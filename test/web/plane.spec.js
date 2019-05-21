const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../src/index');

describe('Render Web Page - Plane', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate(false, './docs', './test/contracts/Plane.sol');
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
     * All the methods should be listed in the main body
     */
    test('should have all methods listed (main body)', async (done) => {
        const cardsNames = [
            'constructor',
            'Land',
            'land',
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
     * The title comment
     */
    test('should title comment', async (done) => {
        await page.waitFor('.Content h3');
        const element = await page.$('.Content h3');
        const text = await page.evaluate(e => e.textContent, element);
        // TODO: remove trim
        expect(text.trim()).toBe('The Plane contract :airplane:');
        done();
    });

    /**
     * All the authors should be listed in the main body
     */
    test('should have all authors listed', async (done) => {
        const cardsNames = [
            'by Wilbur & Orville',
            'by Bernardo Vieira',
        ];
        await page.waitFor('#author');
        const cards = await page.$$('#author');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate(e => e.textContent, cards[c]);
            // TODO: remove trim
            expect(cardsNames).toContain(text.trim());
        }
        done();
    });
});
