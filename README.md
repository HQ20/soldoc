# soldoc

soldoc is a solidity documentation generator. This generator was created due to a need of giving documentation to a client. Thinking about it, we first created this tool to generate an HTML self hosted page, but then we also decided to generate a PDF.

## Features
* Generates documentation with soft colors :eyes:
* Generates a basic PDF :necktie:
* Really fast :rabbit2:

## Installation and Usage

```bash
# Move to your project folder.
cd project-folder/

# Install soldoc.
npm install --save-dev soldoc

# Run soldoc.
soldoc docs/ Sample.sol

# View documentation
open ./docs/Sample.html
```

## Use internally

Your can also use soldoc within your project
```ts
import { generate } from 'soldoc';

generate(toPdf: boolean, outputFolder: string, filePathInput: string)
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0](LICENSE)
