const { getStyleInformation } = require('./processShared')
const hb = require('handlebars')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function generateMixin(styles, lang, outputFolder) {
    const styleInformation = getStyleInformation(lang)

    return readFile(styleInformation.templateFile)
        .then(src => {
            const text = src.toString()
            const template = hb.compile(text)
            const output = template(styles)
            return writeFile(outputFolder + `/sketch.${styleInformation.ext}`, output)
        })
        .then(_ => {
            console.log(`\n    🎉 ${styleInformation.name} has been generated in:`,'\x1b[1m\x1b[35m',`"${outputFolder}"\n\n`)
        })
}

module.exports = { generateMixin: generateMixin }
