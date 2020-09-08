const { getStyleInformation } = require('./processShared')
const hb = require('handlebars')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function generateMixin(styles, lang, outputFolder) {
    const styleInformation = getStyleInformation(lang)
    let templateFile = styleInformation.templateFile
    let ext = styleInformation.ext
    let name = styleInformation.name

    return readFile(outputFolder + templateFile)
        .then(src => {
            const text = src.toString()
            const template = hb.compile(text)
            const output = template(styles)
            return writeFile(outputFolder + `/sketch.${ext}`, output)
        })
        .then(_ => {
            console.log(`\n    🎉 ${name} has been generated:\n       ${outputFolder}\n\n`)
        })
}

module.exports = { generateMixin: generateMixin }
