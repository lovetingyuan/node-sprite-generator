'use strict';

var path = require('path');

function getScaledLayoutForPixelRatio(layout, pixelRatio) {
    var scaledLayout = Object.assign({}, layout);

    if (pixelRatio !== 1) {
        scaledLayout.width = layout.width / pixelRatio;
        scaledLayout.height = layout.height / pixelRatio;

        scaledLayout.images = layout.images.map(function (image) {
            return Object.assign({}, image, {
                x: image.x / pixelRatio,
                y: image.y / pixelRatio,
                width: image.width / pixelRatio,
                height: image.height / pixelRatio
            });
        });
    }

    return scaledLayout;
}

module.exports = function generateSpritesheet(layout, options) {
  var scaledLayout = getScaledLayoutForPixelRatio(layout, options.pixelRatio),
    v = function (value) { return value === 0 ? 0 : value + 'px'; };

  scaledLayout.images = scaledLayout.images.map(function (image) {
      var imageName = path.basename(image.path, path.extname(image.path));
      image.className = options.prefix ? options.prefix + '-' + imageName : imageName;
      return image;
  });

  return Promise.resolve(`.${options.prefix} { background-image: url('./${options.prefix}.png') }\n` + layout.images.map(image => {
    const ret = Object.create(null);
    // ret['background-image'] = `url('${options.spritePath}')`;
    if (options.pixelRatio !== 1) {
      ret['background-size'] = v(scaledLayout.width) + ' ' + v(scaledLayout.height);
    }
    ret['background-position'] = v(-image.x) + ' ' + v(-image.y);
    ret.width = v(image.width);
    ret.height = v(image.height);
    return `.${image.className} { ${Object.keys(ret).map(name => `${name}: ${ret[name]}`).join('; ')}; }`;
  }).join('\n'));
};
