const { flattenName, doRound, getAngle, colorToRGBA } = require('./processShared')
const fs = require('fs')

const processLayerStyles = (layerStyles, filepath, outputFolder) => {
    let ret = []

    let sketchFile = require('sketch-to-svg').SketchFile.from(filepath)

    layerStyles.forEach((style)=>{
        let layerStyle = style.value
        let contextSettings = layerStyle.contextSettings
        let data = {
            name: flattenName(style.name),
            css: [
                { name: "background-color", value: backgroundColor(layerStyle) },
                { name: "background-image", value: backgroundImage(layerStyle, sketchFile, outputFolder) },
                { name: "background-repeat", value: backgroundRepeat(layerStyle) },
                { name: "background-size", value: backgroundSize(layerStyle) },
                { name: "opacity", value: opacity(contextSettings) },
                { name: "mix-blend-mode", value: backgroundBlend(contextSettings) },
                { name: "border", value: border(layerStyle) },
                { name: "box-shadow", value: shadow(layerStyle) }
            ]
        }
        ret.push(data)
    })

    return ret
}

module.exports = {processLayerStyles: processLayerStyles}

const backgroundColor = (layerStyle) => {
    let fills = layerStyle.fills
    if (fills !== undefined && fills.length > 0) {
      if (fills.length == 1) {
        for(let i=0;i<fills.length;i++){
          let fill = fills[i]
          if (fill.fillType == 0 && fill.isEnabled == true) {
              return fill.color.toRgbString()
          }
          return "transparent"
        }
      }
    }
    return "transparent"
}

const backgroundImage = (layerStyle, sketchFile, outputFolder) => {
    let fills = layerStyle.fills
    if (fills !== undefined && fills.length > 0) {
      fills.reverse() // Retun the top most color in the Sketch panel

      let backgroundColors = []

        for(let i=0;i<fills.length;i++){
            let fill = fills[i]

            if (fill.fillType == 0 && fills.length == 1 ) {
              return "none"
            } else {

              if (fill.fillType == 0 && fill.isEnabled == true) { // Solid Colors
                backgroundColors.push("linear-gradient("+fill.color.toRgbString()+", "+fill.color.toRgbString()+")")
              }

              if (fill.fillType == 1 && fill.isEnabled == true) { // Gradients
                if (fill.gradient.gradientType == 0) { // Linear Gradients

                  let gradientStops = []
                  let coords1 = JSON.parse( "[" + fill.gradient.from.slice(1,-1) + "]")
                  let coords2 = JSON.parse( "[" + fill.gradient.to.slice(1,-1) + "]")
                  let angle = getAngle(coords1[0], coords1[1], coords2[0], coords2[1])
                  for(let i=0;i<fill.gradient.stops.length;i++){
                    let stop = fill.gradient.stops[i]
                    gradientStops.push(colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha) + stop.position*100 +"%")
                  }
                  backgroundColors.push("linear-gradient("+doRound(angle)+"deg, "+ gradientStops.join(", ") +")")
                }

                if (fill.gradient.gradientType == 1) { // Radial Gradients
                  let gradientStops = []
                  let coords1 = JSON.parse( "[" + fill.gradient.from.slice(1,-1) + "]")
                  for(let i=0;i<fill.gradient.stops.length;i++){
                    let stop = fill.gradient.stops[i]
                    gradientStops.push(colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha) + doRound(stop.position*100) +"%")
                  }
                  backgroundColors.push("radial-gradient(ellipse farthest-side at "+ doRound(coords1[0]*100) +"% "+ doRound(coords1[1]*100) +"%,"+ gradientStops.join(", ") +")")
                }

                if (fill.gradient.gradientType == 2) { // Angular Gradients
                  let gradientStops = []
                  for(let i=0;i<fill.gradient.stops.length;i++){
                    let stop = fill.gradient.stops[i]
                    gradientStops.push(colorToRGBA(stop.color.red, stop.color.green, stop.color.blue, stop.color.alpha) + stop.position*360 +"deg")
                  }
                  backgroundColors.push("conic-gradient(from 90deg at 50%, "+ gradientStops.join(", ") +")")
                }
              }

              if (fill.fillType == 4 && fill.isEnabled == true) { // Images
                // Copy the image from the sketch file to the output folder
                let imageOutputFolder = outputFolder + "/assets/images"
                let imageName = fill.image._ref.split("/").splice(-1)

                // Note - this will be async, but we just carry on anyway because we don't use any of the output.
                fs.mkdir(imageOutputFolder, { recursive: true }, () => {
                  sketchFile.contentsPath()
                    .then(contentsPath => {
                      fs.copyFileSync(contentsPath + "/" + fill.image._ref, imageOutputFolder + "/" + imageName)
                    })
                })

                backgroundColors.push("url('./assets/images/" + imageName + "')")
              }
          }
        }

      return backgroundColors.join(", ")
    }

    return "none"
}

const backgroundRepeat = (layerStyle) => {
    let fills = layerStyle.fills
    let patternFillTypes = ["repeat", "repeat", "no-repeat","no-repeat"]
    if (fills !== undefined && fills.length > 0) {
        for(let i=0;i<fills.length;i++){
            let fill = fills[i]
            if (fill.fillType == 4 && fill.isEnabled == true) {
                return patternFillTypes[fill.patternFillType]
            }
        }
    }
    return "none"
}

const backgroundSize = (layerStyle) => {
    let fills = layerStyle.fills
    if (fills !== undefined && fills.length > 0) {
        for(let i=0;i<fills.length;i++){
            let fill = fills[i]

            // Size is not right: doRound(fill.patternTileScale)*100+"%"
            // Sketch size is proportionate to the files
            // CSS size is proportionate to the parent container
            // Using "auto" for now
            let patternFillTypes = ["auto", "cover", "100% 100%", "contain"]

            if (fill.fillType == 4 && fill.isEnabled == true) {
                return patternFillTypes[fill.patternFillType]
            }
        }
    }
    return "none"
}

const opacity = (contextSettings) => {
    if (contextSettings) {
        return contextSettings.opacity
    }
    return "1"
}

const backgroundBlend = (contextSettings) => {
    let blendModes = ["normal", "darken", "multiply", "color-burn", "lighten", "screen", "color-dodge", "overlay", "soft-light", "hard-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"]
    if (contextSettings) {
        return blendModes[contextSettings.blendMode]
    }
    return "0"
}

const border = (layerStyle) => {
    let borders = layerStyle.borders
    let borderOptions = layerStyle.borderOptions.dashPattern
    if (borders !== undefined && borders.length > 0) {
      for(let i=0;i<borders.length;i++){
          let border = borders[i]
          let borderType
          if (border.isEnabled == true) {
              let borderWidth = border.thickness
              let borderType = (borderOptions.length > 0) ? ( borderOptions[0] == borderOptions[1] ? "dotted" : "dashed") : "solid"
              let borderColor = colorToRGBA(border.color.red, border.color.green, border.color.blue, border.color.alpha)
              return borderWidth+"px "+borderType+" "+borderColor
          }
      }
    }
    return "none"
}

const shadow = (layerStyle) => {

  const layerShadows = []

  let shadows = layerStyle.shadows
  if (shadows !== undefined && shadows.length > 0) {
    shadows.reverse() // Retun the top most shadows in the Sketch panel
    for(let i=0;i<shadows.length;i++){
      let shadow = shadows[i]
      if (shadow.isEnabled == true) {
          let offsetX = shadow.offsetX
          let offsetY = shadow.offsetY
          let blur = shadow.blurRadius
          let spread = shadow.spread
          let shadowColor = colorToRGBA(shadow.color.red, shadow.color.green, shadow.color.blue, shadow.color.alpha)
          layerShadows.push(offsetX+"px "+offsetY+"px "+blur+"px "+spread+"px "+shadowColor)
      }
    }
  }

  let innerShadows = layerStyle.innerShadows
  if (innerShadows !== undefined && innerShadows.length > 0) {
    innerShadows.reverse() // Retun the top most inner shadows in the Sketch panel
    for(let i=0;i<innerShadows.length;i++){
        let innerShadow = innerShadows[i]
        if (innerShadow.isEnabled == true) {
            let offsetX = innerShadow.offsetX
            let offsetY = innerShadow.offsetY
            let blur = innerShadow.blurRadius
            let spread = innerShadow.spread
            let innerShadowColor = colorToRGBA(innerShadow.color.red, innerShadow.color.green, innerShadow.color.blue, innerShadow.color.alpha)
            layerShadows.push("inset "+offsetX+"px "+offsetY+"px "+blur+"px "+spread+"px "+innerShadowColor)
        }
      }
    }

    return (layerShadows !== undefined && layerShadows.length > 0) ? layerShadows.join(", ") : "none"
}
