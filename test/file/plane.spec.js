const path = require('path');
const fs = require('fs');
const pdfUtil = require('pdf-to-text');

const { generate } = require('../../src/index');

describe('Render File - Plane', () => {
    beforeAll(() => {
        jest.setTimeout(20000);
        // first render
        generate(true, './docs', './test/contracts/Plane.sol');
        // now let's test the result
    });

    afterAll(() => {
        console.log('afterAll');
        //
    });

    /**
     * file should have been generated
     */
    test('file should have been generated', (done) => {
        const result = fs.existsSync(path.join(process.cwd(), 'docs'));
        if (result) {
            fs.watch(path.join(process.cwd(), 'docs'), (eventType, filename) => {
                if (eventType === 'change' && filename === 'Plane.pdf') {
                    done();
                }
            });
        } else {
            fs.watch(path.join(process.cwd()), (e, f) => {
                if (f === 'docs') {
                    fs.watch(path.join(process.cwd(), 'docs'), (eventType, filename) => {
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
        const pdfPath = path.join(process.cwd(), 'docs', 'Plane.pdf');
        const content = [
            'Plane',
            '- The Plane contract',
            'by Wilbur & Orville',
            'This is a plane constructor',
            '*May flight, or may not *',
            '- *by Bernardo Vieira *',
            'Land',
            'This is a plane event',
            '@dev Emitted by land function',
            '*by Bernardo Vieira *',
            '@param uint256 _time The time it lands',
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
