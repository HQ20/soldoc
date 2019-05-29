const path = require('path');
const fs = require('fs');
const { generate } = require('../../src/index');

describe('Render File - ERC20', () => {
    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        await generate(true, './docs', './test/contracts/ERC20.sol');
        // now let's test the result
    });

    afterAll(() => {
        //
    });

    /**
     * file should have been generated
     */
    test('file should have been generated', (done) => {
        const result = fs.existsSync(path.join(process.cwd(), 'docs'));
        if (result) {
            fs.watch(path.join(process.cwd(), 'docs'), (eventType, filename) => {
                if (eventType === 'change' && filename === 'ERC20.pdf') {
                    done();
                }
            });
        } else {
            fs.watch(path.join(process.cwd()), (e, f) => {
                if (f === 'docs') {
                    fs.watch(path.join(process.cwd(), 'docs'), (eventType, filename) => {
                        if (eventType === 'change' && filename === 'ERC20.pdf') {
                            done();
                        }
                    });
                }
            });
        }
    });
});
