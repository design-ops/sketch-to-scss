const { Sketch } = require('sketch-constructor')
const { processSketchFile } = require('./lib/processSketch')
const { generateMixin } = require('./lib/genMixin')
const fs = require('fs')

const argv = require('yargs')
    .command('extract', 'Extracts the provided sketch file into css')
    .example('extract -o ./output mysketchfile.sketch -l sass', 'Export the contents of mysketchfile.sketch into the output folder')
    .alias('o', 'output')
    .nargs('o', 1)
    .default('o', `./output`)
    .describe('o', 'Folder to output the mixin and assets.')
    .alias('l', 'lang')
    .nargs('l', 1)
    .default('l', 'css')
    .describe('l', 'Language to generate mixin')
    .choices('l', ['scss', 'less', 'css'])
    .demandCommand(1)
    .help('h')
    .alias('h', 'help')
    .argv

extract(argv['_'][0], argv['l'], argv['o'])

function extract(filename, format, outputFolder) {

    Sketch.fromFile(filename)
        .then(sketch => {
            return processSketchFile(sketch, filename, outputFolder)
        })
        .then(styles => {
            fs.mkdirSync(outputFolder, { recursive: true })
            //console.log(require('util').inspect(styles, {showHidden: false, depth: null}))
            return generateMixin(styles, format, outputFolder)
        })
        .catch(err => {
            console.error("Failed to extract", err)
        })
}
