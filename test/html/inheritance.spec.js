const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render HTML Page - Inheritance (Barbary Lion)', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-inheritance', './test/contracts/inheritance/BarbaryLion.sol', './test', 'xyz', process.cwd());
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/test-html-inheritance/BarbaryLion.html'));
    });

    afterAll(async () => {
        // close the browser
        await browser.close();
    });

    /**
     * The main contract being shown should be named "BarbaryLion"
     */
    test('should be named "BarbaryLion"', async (done) => {
        await page.waitFor('h1#contractName');
        const element = await page.$('h1#contractName');
        const text = await page.evaluate((e) => e.textContent, element);
        expect(text).toBe('BarbaryLion');
        done();
    });

    /**
     * All the contracts inherited should be listed in the side menu
     */
    test('should have all inherited contracts listed (side menu)', async (done) => {
        // should also, not list the ignored ones!
        const cardsNames = [
            'Lion',
        ];
        await page.waitFor('aside ul#inheritance li a');
        const cards = await page.$$('aside ul#inheritance li a');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });
});


describe('Render HTML Page - Inheritance (Lion)', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-inheritance', './test/contracts/inheritance/Lion.sol', './test', 'xyz', process.cwd());
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/test-html-inheritance/Lion.html'));
    });

    afterAll(async () => {
        // close the browser
        await browser.close();
    });

    /**
     * The main contract being shown should be named "BarbaryLion"
     */
    test('should be named "Lion"', async (done) => {
        await page.waitFor('h1#contractName');
        const element = await page.$('h1#contractName');
        const text = await page.evaluate((e) => e.textContent, element);
        expect(text).toBe('Lion');
        done();
    });

    /**
     * All the contracts inherited should be listed in the side menu
     */
    test('should have all inherited contracts listed (side menu)', async (done) => {
        // should also, not list the ignored ones!
        const cardsNames = [
            'Quadruped',
            'WildLife',
        ];
        await page.waitFor('aside ul#inheritance li a');
        const cards = await page.$$('aside ul#inheritance li a');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });
});
