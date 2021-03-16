const { flattenName } = require('./processShared')
const svg = require('sketch-to-svg')
const fs = require('fs')

async function processAssets(layers, filepath, outputFolder, base64) {
  let css = []

  for (let index = 0; index < layers.length; ++index) {
    let layer = layers[index]
    let backgroundImage = await assetName(layer, filepath, outputFolder, base64)
    css.push({
      name: flattenName(layer.name),
      css: [
        { name: "background-image", value: backgroundImage },
        { name: "background-repeat", value: "no-repeat" },
        { name: "background-position", value: "center" },
        { name: "width", value: assetWidth(layer) },
        { name: "height", value: assetHeight(layer) }
      ]
    })
  }

  return css
}

/**
 * Return the css for an asset and, if required, place any nested resources into the outputFolder.
 *
 * @param {sketch-constructor.Layer} layer The layer to render as an svg
 * @param {string} filepath The path to the sketch file to extract any assets
 * @param {string} outputFolder The output folder to place extracted assets into
 */

async function assetName(layer, filepath, outputFolder, base64) {

  let options = {
    sketchFilePath: filepath,
    optimizeImageSize: true,
    optimizeImageSizeFactor: 3,
    embedImages: true
  }

  let icon = await svg.createFromLayer(layer, options)

  // Based on the size of the svg, do we embed it or do we include it as an external file?
  if (icon.svg.length > 1024 * 2 && base64 == false) {
    // If the svg is too large, save it as an external file
    let folder = outputFolder + "/assets/images"
    fs.mkdirSync(folder, { recursive: true })

    let filename =  Math.random().toString(36).substring(2, 15) + ".svg" //Buffer.from(layer.name).toString('base64') + ".svg"
    let path = folder + "/" + filename
    fs.writeFileSync(path, icon.svg)

    //console.log(layer.name + ": Too large (" + icon.svg.length +" bytes), saving as external file: assets/images/" + Buffer.from(layer.name).toString('base64') + ".svg")
    return "url('./assets/images/" + filename + "')"
  } else {
    // If Base 64 is forced or if the icon is small enough,
    // we can just embed it directly.
    // console.log(layer.name + ": OK (" + icon.svg.length +" bytes): ")
    return "url('data:image/svg+xml;base64," + Buffer.from(icon.svg).toString('base64') + "')"
  }
}

const assetWidth = (layer) => {
  return layer.frame.width + "px"
}

const assetHeight = (layer) => {
  return layer.frame.height + "px"
}

module.exports = { processAssets: processAssets }
