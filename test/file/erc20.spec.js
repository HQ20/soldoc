const path = require('path');
const fs = require('fs');
const { generate } = require('../../src/index');

describe('Render File - ERC20', () => {
    beforeAll(async () => {
        jest.setTimeout(20000);
        // first render
        generate(true, './docs', './test/contracts/ERC20.sol');
        // now let's test the result
    });

    afterAll(async () => {
        //
    });

    /**
     * file should have been generated
     */
    test('file should have been generated', async (done) => {
        fs.watch(path.join(process.cwd()), (e, f) => {
            if (f === 'docs') {
                fs.watch(path.join(process.cwd(), 'docs'), (eventType, filename) => {
                    if (eventType === 'change' && filename === 'ERC20.pdf') {
                        done();
                    }
                });
            }
        });
    });
});
