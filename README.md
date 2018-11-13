# node-sprite-generator-simple

Generates image sprites and their spritesheets (css, stylus, sass, scss or less) from sets of images. Supports retina sprites.

Simplify [node-sprite-generator](https://github.com/selaux/node-sprite-generator)

## Installation

```bash
npm install node-sprite-generator-simple
```

## Usage

```javascript
const nsg = require('node-sprite-generator');

nsg({
    src: [
        'images/sprite/*.png'
    ],
    pixelRatio: 1,
    namespace: 'sprite', // used as dist file name, default is "sprite", must be a valid file name.
    dist: 'assets' // must be a directory, will not output final file if omit this option.
}, function (err, result) { // if dist is not provided, result is available as { css, image }
    if (err) {
        console.log('errors: ', err);
    } else {
        console.log('generated!');
    }
});
```

## License
MIT