const hb = require('handlebars')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function generateMixin(styles, lang, outputFolder) {
    if (lang == "less") {
        let templateFile = `/../lib/template.less.hb`
        let ext = "less"
        let name = "LESS"
    } else { // if lang == "sass"
        let templateFile = `/../lib/template.scss.hb`
        let ext = "scss"
        let name = "SASS"
    }
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
