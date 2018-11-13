'use strict';

var Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
    R = require('ramda'),
    generateLayout = require('./binpackLayout'),
    renderStylesheet = require('./stylesheet'),
    glob = Promise.promisify(require('glob')),
    mkdirp = Promise.promisify(require('mkdirp')),
    compositor = require('./compositor'),
    readFile = Promise.promisify(fs.readFile),
    writeFile = Promise.promisify(fs.writeFile),
    MAX_PARALLEL_FILE_READS = 80,
    defaultOptions = {
        src: [],
        layoutOptions: {
            padding: 0,
            scaling: 1
        },
        compositorOptions: {
            compressionLevel: 6,
            filter: 'all'
        },
        stylesheetOptions: {
            spritePath: null,
            prefix: '',
            pixelRatio: 1
        }
    };

function readAllSources(readFile, glob, src) {
    var stringSources = R.filter(R.is(String))(src),
        otherSources = R.difference(src, stringSources);

    return Promise.map(stringSources, R.unary(glob))
        .then(R.flatten)
        .then(R.uniq)
        .map(function (path) {
            return readFile(path).then(R.assoc('data', R.__, { path: path }));
        })
        .then(R.union(otherSources));
}

function generateSprite(userOptions, callback) {
    if (!userOptions.namespace) {
        userOptions.namespace = 'sprite';
    }
    userOptions.dist = userOptions.dist && (path.isAbsolute(userOptions.dist) ?
        path.resolve(process.cwd(). userOptions.dist) :
        userOptions.dist);
    var options = {
        src: userOptions.src || [],
        compositorOptions: Object.assign(defaultOptions.compositorOptions, userOptions.compositorOptions),
        layoutOptions: Object.assign(defaultOptions.layoutOptions, userOptions.layoutOptions),
        stylesheetOptions: Object.assign(defaultOptions.stylesheetOptions, userOptions.stylesheetOptions),
    };
    options.stylesheetOptions.prefix = userOptions.namespace;

    return readAllSources(readFile, glob, options.src)
        .map(compositor.readImage, { concurrency: MAX_PARALLEL_FILE_READS })
        .then(R.partialRight(generateLayout, [ options.layoutOptions ]))
        .tap(function createTargetDirectories() {
            if (userOptions.dist) {
                return mkdirp(userOptions.dist);
            }
        })
        .then(function renderStylesheetAndImage(generatedLayout) {
            return Promise.all([
                renderStylesheet(generatedLayout, options.stylesheetOptions),
                compositor.render(generatedLayout, options.compositorOptions)
            ]);
        })
        .tap(function writeStylesheetAndImage(args) {
            const [stylesheet, sprite] = args;
            if (userOptions.dist) {
                return Promise.all([
                    writeFile(path.posix.join(userOptions.dist, userOptions.namespace + '.css'), stylesheet),
                    writeFile(path.posix.join(userOptions.dist, userOptions.namespace + '.png'), sprite),
                ]);
            } else {
                callback(null, args);
            }
        }).catch(callback);
}

module.exports = generateSprite;
