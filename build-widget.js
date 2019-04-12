const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
    const files = [
        './dist/doctor-widget/runtime.js',
        './dist/doctor-widget/polyfills.js',
        './dist/doctor-widget/scripts.js',
        './dist/doctor-widget/main.js',
    ]
    await fs.ensureDir('widget_dist')
    await concat(files, 'widget_dist/cc-doctor-widget.js');
    // await fs.copy('./dist/webcomp1/assets/', 'elements/assets/')

})()