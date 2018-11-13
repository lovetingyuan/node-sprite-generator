'use strict';

var binPack = require('bin-pack');

function scaleImages(images, options) {
    return images.map(function (image) {
        return Object.assign({}, image, {
            width: Math.round(image.width * options.scaling),
            height: Math.round(image.height * options.scaling)
        });
    });
}

module.exports = function generateLayout(images, options) {
    var packed;

    images = scaleImages(images, options);
    images = images.map(function (image) {
        image.width += options.padding;
        image.height += options.padding;
        return image;
    });

    packed = binPack(images);
    images = packed.items.map(function (image) {
        var paddingOffset = options.padding / 2;

        return Object.assign({}, image.item, {
            x: image.x + paddingOffset,
            y: image.y + paddingOffset,
            width: image.width - options.padding,
            height: image.height - options.padding
        });
    });

    return Promise.resolve({
        width: packed.width,
        height: packed.height,
        images: images
    });
};
