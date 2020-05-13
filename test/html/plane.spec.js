const puppeteer = require('puppeteer');
const path = require('path');
const { generate } = require('../../dist/index');

describe('Render HTML Page - Plane', () => {
    let browser;
    let page;

    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate('html', [], './docs/test-html-plane', './test/contracts/Plane.sol', './test', 'xyz', process.cwd());
        // now let's test the result
        // open the browser
        browser = await puppeteer.launch();
        // open a new page
        page = await browser.newPage();
        // and navigate to the rendered page
        await page.goto(path.join('file://', process.cwd(), '/docs/test-html-plane/Plane.html'));
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
     * All the methods should be listed in the main body
     */
    test('should have all methods listed (main body)', async (done) => {
        // TODO: will be refactored
        // const cardsNames = [
        //     'constructor',
        //     'Land',
        //     'land',
        // ];
        // await page.waitFor('strong.method');
        // const cards = await page.$$('strong.method');
        // for (let c = 0; c < cards.length; c += 1) {
        //     // eslint-disable-next-line no-await-in-loop
        //     const text = await page.evaluate((e) => e.textContent, cards[c]);
        //     expect(cardsNames).toContain(text);
        // }
        done();
    });
    /**
     * All the variables should be listed in the main body
     */
    test('should have all variables listed (main body)', async (done) => {
        const cardsNames = [
            'name',
        ];
        await page.waitFor('strong.variable');
        const cards = await page.$$('strong.variable');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            expect(cardsNames).toContain(text);
        }
        done();
    });

    /**
     * The title comment
     */
    test('should title comment', async (done) => {
        await page.waitFor('div.container h2.subtitle');
        const element = await page.$('div.container h2.subtitle');
        const text = await page.evaluate((e) => e.textContent, element);
        // TODO: remove trim
        // because of them emoji there's an extra space. TODO: improve it!
        expect(text.replace(/\n[ ]*/g, '').trim()).toBe('The Plane contract by @Wilbur & Orville');
        done();
    });

    /**
     * All the authors should be listed in the main body
     */
    test('should have all authors listed', async (done) => {
        const cardsNames = [
            '@Wilbur & Orville',
            '@Bernardo Vieira',
        ];
        await page.waitFor('#author');
        const cards = await page.$$('#author');
        for (let c = 0; c < cards.length; c += 1) {
            // eslint-disable-next-line no-await-in-loop
            const text = await page.evaluate((e) => e.textContent, cards[c]);
            // TODO: remove trim
            expect(cardsNames).toContain(text.trim());
        }
        done();
    });
});
