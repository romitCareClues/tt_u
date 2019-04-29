const fs = require('fs-extra');
const concat = require('concat');
const minify = require('@node-minify/core');
const uglifyjs = require('@node-minify/uglify-js');
const gcc = require('@node-minify/google-closure-compiler');

const args = process.argv.slice(2);
const environment = args[0];

const sourcePath1 = './init-widget/configuration.js';
const sourcePath2 = './init-widget/init-widget.js';

const tempDestinationPath = './dist/doctor-widget/assets/js/temp1-widget-initiator.js';
const tempDestinationPath2 = './dist/doctor-widget/assets/js/temp-2widget-initiator.js';
const finalPath = './dist/doctor-widget/assets/js/widget-initiator.min.js';

(async function build() {
    const files = [sourcePath1, sourcePath2];
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
                                fs.readFile(finalPath, 'utf8', function (err, data) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    var result = data.replace(`var ENV = "development";`, `var ENV = "${environment}";`);

                                    fs.writeFile(finalPath, result, 'utf8', function (err) {
                                        if (err) return console.log(err);
                                        else return console.log('finalPath - success' + environment);
                                    });
                                });
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