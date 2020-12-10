const { flattenName } = require('./processShared')

const processModifiers = (layers) => {
    return layers.map((layer) => {
      return {
          name: flattenName(layer.name),
          css: [
            { name: "border-radius", value: borderRadius(layer) }
          ]
      }
    })
}

const borderRadius = (layer) => {
  layer.layers.reverse()

  const cornerRadius = []

  if (layer.name.endsWith(" --radius") && layer.layers.length > 0) {

    for(let i=0;i<layer.layers[0].points.length;i++){
      let corner = layer.layers[0].points[i]
      cornerRadius.push(corner.cornerRadius+"px")
    }

    return cornerRadius.join(" ")+" !important"
  }
  return "none"
}

module.exports = { processModifiers: processModifiers }
