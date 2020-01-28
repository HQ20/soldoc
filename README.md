<div align="center">
    <img width="768" src="soldoc.png">
</div>

> soldoc is a solidity documentation generator. This generator was created due to a need of giving documentation to developers and clients. Thinking about it, we first created this tool to generate a standalone HTML page, but then we also decided to generate a PDF.

<div align="center">
    <div>
        <a
            href="https://www.npmjs.com/package/soldoc"><img
                src="https://img.shields.io/npm/dm/soldoc.svg" /></a>&emsp;
        <a
            href="https://travis-ci.org/HQ20/soldoc"><img
                src="https://travis-ci.org/HQ20/soldoc.svg?branch=master" /></a>&emsp;
        <a
            href="https://coveralls.io/github/HQ20/soldoc?branch=master"><img
                src="https://coveralls.io/repos/github/HQ20/soldoc/badge.svg?branch=master" /></a>&emsp;
        <a
            href="https://app.netlify.com/sites/soldoc-demo/deploys"><img
                src="https://api.netlify.com/api/v1/badges/084d2d9e-5f67-46c8-a8e7-22d73f2f707d/deploy-status" /></a>&emsp;
        <a
            href="https://dependabot.com"><img
                src="https://api.dependabot.com/badges/status?host=github&repo=HQ20/soldoc" /></a>&emsp;
    </div>
</div>

See demo [here](https://soldoc-demo.netlify.com/).

Please note that, there's also a pdf example in `./example` folder. This pdf is a first draft. We intend to have a better template and open the opportunity to get new templates.

## Features
* Generates documentation with soft colors :eyes:
* The generated output can be standalone HTML :grin:, a PDF file :necktie:, gitbook format :scream: or docsify format :boom:
* All formats support emojis :speak_no_evil:
* Ignore documentation generator for some specific files :sunglasses:
* Really fast :rabbit2:

## Installation and Usage

```bash
# Go to your project folder.
cd project-folder/

# Install soldoc.
npm install --save-dev soldoc

# Install soldoc's peerDependencies (in case you don't have them yet).
npm install --save-dev directory-tree highlight.js markdown-it markdown-it-emoji meow mustache node-emoji pdf-from-html

# Run soldoc.
npx soldoc docs/ Sample.sol

# View documentation
open ./docs/Sample.html
```

soldoc supports many output formats, being pure HTML the default one.

Use `soldoc --help` to get more information about output formats and other options.

## Use internally

Your can also use soldoc within your project
```ts
import { generate } from 'soldoc';

generate(outputType: string, ignoreFilesList: string[], outputFolder: string, inputPath: string)
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0](LICENSE)

## Credits
Credits to all external open/free material used.

Thank you all.

The [sun](https://www.iconfinder.com/icons/2995005/giallo_sole_soleggiato_sun_sunny_weather_yellow_icon), the [A Directory Tree List Style A PEN BY Alex Raven](https://codepen.io/asraven/pen/qbrQMX), the [Font Family](https://www.dafont.com/pt/subscriber.font). As well as [Connor](https://github.com/connorltodd), who drafted the initial HTML template, and [zlocate](https://github.com/zlocate)

Thank you. Danke. Merci. Grazie. Gracias. Arigato. Obrigado.
