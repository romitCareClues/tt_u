const fs = require('fs-extra');
const concat = require('concat');
const minify = require('@node-minify/core');
const uglifyjs = require('@node-minify/uglify-js');
const gcc = require('@node-minify/google-closure-compiler');

(async function build() {
    const tempDestinationPath = './dist/doctor-widget/assets/js/temp1-widget-initiator.js';
    const tempDestinationPath2 = './dist/doctor-widget/assets/js/temp-2widget-initiator.js';
    const finalPath = './dist/doctor-widget/assets/js/widget-initiator.min.js';
    const files = [
        './init-widget/configuration.js',
        './init-widget/init-widget.js'
    ];
    await fs.ensureDir('./dist/doctor-widget/assets/js');
    await concat(files, tempDestinationPath).then((result) => {
        console.log('tempDestinationPath - success');
        minify({
            compressor: gcc,
            input: tempDestinationPath,
            output: tempDestinationPath2,
            sync: true,
            callback: function (err, min) {
                if (!err) {
                    console.log('tempDestinationPath2 - success');
                    minify({
                        compressor: uglifyjs,
                        input: tempDestinationPath2,
                        output: finalPath,
                        callback: function (err, min) {
                            if (!err) {
                                console.log('finalPath - success');
                            }
                            else {
                                console.log('finalPath_error -> ' + err);
                            }
                        }
                    });
                }
                else {
                    console.log('tempDestinationPath2_error -> ' + err);
                }
            }
        });
    });
})()