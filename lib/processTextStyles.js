const { flattenName, doRound, colorToRGBA } = require('./processShared')
const fs = require('fs')
const fontkit = require('fontkit');
const os = require('os')
const util = require('util')
const system = require('system-commands')
const { copyFonts } = require('./copyFonts')

async function processTextStyles(textStyles, fontReferences, outputFolder, sketchFile) {
    let ret = []

    let fontNames = []

    for (let index = 0; index < textStyles.length; ++index) {
        let style = textStyles[index]
        let textStyle = style.value.textStyle
        let shadowStyle = style.value
        let encodedAttributes = textStyle.encodedAttributes
        let fontAttributes = encodedAttributes.MSAttributedStringFontAttribute.attributes
        let paragraphStyle = encodedAttributes.paragraphStyle
        let color = encodedAttributes.MSAttributedStringColorAttribute

        // Store the font name - we deal with the fonts at the end
        if (!fontNames.includes(fontAttributes.name)) {
            fontNames.push(fontAttributes.name)
        }

        let data = {
            name: flattenName(style.name),
            css: [
                { name: "font-family", value: fontName(fontAttributes) },
                { name: "font-size", value: fontSize(fontAttributes) },
                { name: "letter-spacing", value: letterSpacing(encodedAttributes) },
                { name: "line-height", value: lineHeight(paragraphStyle) },
                { name: "color", value: color.toRgbString() },
                { name: "text-align", value: textAlign(paragraphStyle) },
                { name: "vertical-align", value: verticalAlign(textStyle) },
                { name: "text-decoration", value: textDecoration(encodedAttributes) },
                { name: "text-transform", value: textTransform(encodedAttributes) },
                { name: "text-shadow", value: textShadow(shadowStyle) }
            ]
        }
        ret.push(data)
    }

    // 1. Get all the fonts used in the document -> `fontNames`
    // 2. Get the fonts embedded in the document that are used
    const usedFontReferences = extractUsedFontReferences(fontNames, fontReferences)
    let fonts = await copyFonts(fontNames, { sketchFile, usedFontReferences }, outputFolder)

    return { text: ret, fonts: fonts }
}

const extractUsedFontReferences = (fontNames, fontReferences) => {
  let usedFontReferences = []
  for(var index = 0; index < fontNames.length; index++) {
    const name = fontNames[index];
    for(var referenceIndex = 0; referenceIndex < fontReferences.length; referenceIndex++) {
      const reference = fontReferences[referenceIndex];

      // We don't want duplicate font references in the array
      if(usedFontReferences.includes(reference)) {
        continue;
      }

      // Check if the font reference includes the font by the name we are inspecting
      if(!reference.postscriptNames.includes(name)) {
        continue;
      }

      usedFontReferences.push(reference);
    }
  }
  return usedFontReferences;
}


const fontName = (fontAttributes) => {
    return "'" + fontAttributes.name + "'"
}

const fontSize = (fontAttributes) => {
    return fontAttributes.size + "px"
}

const textShadow = (shadowStyle) => {
    let shadows = shadowStyle.shadows
    if (shadows !== undefined && shadows.length > 0) {
        shadows.reverse() // Retun the top most shadows in the Sketch panel
        let textShadows = []
        for (let i = 0; i < shadows.length; i++) {
            let shadow = shadows[i]
            if (shadow.isEnabled == true) {
                let offsetX = shadow.offsetX
                let offsetY = shadow.offsetY
                let blur = shadow.blurRadius
                let shadowColor = colorToRGBA(shadow.color.red, shadow.color.green, shadow.color.blue, shadow.color.alpha)
                textShadows.push(offsetX + "px " + offsetY + "px " + blur + "px " + shadowColor)
            }
        }
        return textShadows.join(", ")
    }
    return "none"
}

const letterSpacing = (encodedAttributes) => {
    return encodedAttributes.kerning ? doRound(encodedAttributes.kerning) + "px" : "normal"
}

const lineHeight = (paragraphStyle) => {
    return paragraphStyle.minimumLineHeight ? doRound(paragraphStyle.minimumLineHeight) + "px" : "normal"
}

const textAlign = (paragraphStyle) => {
    const options = ["left", "right", "center", "justify", "normal"]
    let val = paragraphStyle.alignment
    if (val < options.length) {
        return options[val]
    }
    return "left"
}

const textDecoration = (encodedAttributes) => {
    let options = []
    if (encodedAttributes.underlineStyle == 1) {
        options.push("underline")
    }
    if (encodedAttributes.strikethroughStyle == 1) {
        options.push("line-through")
    }
    if (options.length == 0) {
        return "none"
    }
    return options.join(" ")
}

const textTransform = (encodedAttributes) => {
    let val = encodedAttributes.MSAttributedStringTextTransformAttribute
    let options = ["none", "uppercase", "lowercase"]
    if (val != undefined && val < options.length) {
        return options[val]
    }
    return "none"
}

const verticalAlign = (textStyle) => {
    const options = ["top", "middle", "bottom"]
    let val = textStyle.verticalAlignment
    if (val != undefined && val < options.length) {
        return options[val]
    }
    return `none`
}

module.exports = { processTextStyles: processTextStyles }
