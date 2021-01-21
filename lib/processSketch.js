const { processTextStyles } = require('./processTextStyles')
const { processLayerStyles } = require('./processLayerStyles')
const { processAssets } = require('./processAssets')
const { processBorders } = require('./processBorders')

/**
 *
 * @param {*} sketch The Sketch object to parse
 * @param {*} filepath A path to the sketch file so we can extract assets if we need to
 * @param {*} outputFolder The folder to output any resources if we need to
 */
async function processSketchFile(sketch, filepath, outputFolder) {

    let styles = {layer:[], text:[], assets:[], borders:[]}

    let layerStyles = sketch.getLayerStyles()
    styles.layer = processLayerStyles(layerStyles, filepath, outputFolder)
    // Sort Array based on name
    styles.layer.sort(function(a, b){
        var a1= a.name.toLowerCase(), b1= b.name.toLowerCase();
        if(a1== b1) return 0;
        return a1> b1? 1: -1;
    })
    // console.log(util.inspect(layerStyles, {showHidden: false, depth: null}))
    console.log(`    🎨 Processed ${layerStyles.length} Layer Styles!\n`)

    let textStyles = await processTextStyles(sketch.getTextStyles(), sketch.document.fontReferences, outputFolder, filepath)
    styles.text = textStyles.text
    styles.fonts = textStyles.fonts
    // Sort Array based on name
    styles.text.sort(function(a, b){
        var a1= a.name.toLowerCase(), b1= b.name.toLowerCase();
        if(a1== b1) return 0;
        return a1> b1? 1: -1;
    })
    // console.log(util.inspect(textStyles, {showHidden: false, depth: null}))
    console.log(`    📝 Processed ${textStyles.text.length} Text Styles!\n`)

    // Filter out any layers that aren't "symbolMaster"
    let assets = sketch.pages.flatMap(page => page.layers.filter(layer => layer._class === "symbolMaster" && layer.name != "Button/Shape"))
    styles.assets = await processAssets(assets, filepath, outputFolder)
    // Sort Array based on name
    styles.assets.sort(function(a, b){
        const a1 = a.name.toLowerCase(), b1 = b.name.toLowerCase();
        if(a1 === b1) return 0;
        return a1 > b1 ? 1 : -1;
    })
    // console.log(util.inspect(assets, {showHidden: false, depth: null}))
    console.log(`    🖼️  Processed ${assets.length} Assets!\n`)

    // Filter out any layers that aren't "symbolMaster"
    let borders = sketch.pages.flatMap(page => page.layers.filter(layer => (layer.name === "Button/Shape" || layer.name === "Form/Shape")))
    styles.borders = processBorders(borders)
    // Sort Array based on name
    styles.borders.sort(function(a, b){
        const a1 = a.name.toLowerCase(), b1 = b.name.toLowerCase();
        if(a1 === b1) return 0;
        return a1 > b1 ? 1 : -1;
    })
    // console.log(util.inspect(borders, {showHidden: false, depth: null}))
    console.log(`    🔳 Processed ${borders.length} Border!`)

    return styles

    // console.log(styles.text)
}

module.exports = {processSketchFile: processSketchFile}
