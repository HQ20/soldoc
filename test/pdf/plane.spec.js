const path = require('path');
const fs = require('fs');
const pdfUtil = require('pdf-to-text');

const { generate } = require('../../dist/index');

describe('Render File - Plane', () => {
    beforeAll(() => {
        jest.setTimeout(20000);
        // first render
        generate('pdf', [], './docs/test-pdf-plane', './test/contracts/Plane.sol', './test', 'xyz');
        // now let's test the result
    });

    afterAll(() => {
        //
    });

    /**
     * file should have been generated
     */
    test('file should have been generated', (done) => {
        const result = fs.existsSync(path.join(process.cwd(), 'docs/test-pdf-plane'));
        if (result) {
            fs.watch(path.join(process.cwd(), 'docs/test-pdf-plane'), (eventType, filename) => {
                if (eventType === 'change' && filename === 'Plane.pdf') {
                    done();
                }
            });
        } else {
            fs.watch(path.join(process.cwd()), (e, f) => {
                if (f === 'test-pdf-plane') {
                    fs.watch(path.join(process.cwd(), 'docs/test-pdf-plane'), (eventType, filename) => {
                        if (eventType === 'change' && filename === 'Plane.pdf') {
                            done();
                        }
                    });
                }
            });
        }
    });

    /**
     * Read file text
     */
    test('should have the text', (done) => {
        const pdfPath = path.join(process.cwd(), 'docs/test-pdf-plane', 'Plane.pdf');
        const content = [
            'Plane',
            'This is a plane constructor',
            'May flight, or may not',
            'Land',
            'Emitted by land function',
            'uint256',
            '_time',
            'The time it lands',
            'land',
        ];

        pdfUtil.pdfToText(pdfPath, (err, data) => {
            if (err) {
                throw (err);
            }
            content.forEach((c) => {
                expect(data.indexOf(c) > -1).toBeTruthy();
            });
            done();
        });
    });
});
