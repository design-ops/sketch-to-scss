const { flattenName, doRound, colorToRGBA } = require('./processShared')
const fs = require('fs')
const fontkit = require('fontkit');
const os = require('os')
const util = require('util')
const system = require('system-commands')

async function processTextStyles(textStyles, outputFolder) {
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

    let fonts = await copyFonts(fontNames, outputFolder)

    return { text: ret, fonts: fonts }
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

/**
 * Wraps copyFonts to make it read better if you are only copying a single font. See `copyFonts` for more details.
 * 
 * @param {string} name The name of the font to copy
 * @param {string} outputFolder The root folder to output into
 */
async function copyFont(name, outputFolder) { 
    return copyFonts([name], outputFolder).then(fonts => { return fonts.length > 0 ? fonts[0] : undefined })
}

/**
 * Finds and copies the named fonts into the outputFolder. If the destination already contains a file with that name, this method does nothing.
 * 
 * @param {string[]} names The names of the fonts to copy
 * @param {string} outputFolder The root folder to output to - the fonts will be placed in {outputFolder}/assets/fonts
 */
async function copyFonts(names, outputFolder) {

    // Make sure the output folder exists
    let folder = outputFolder + "/assets/fonts/"
    await util.promisify(fs.mkdir)(folder, { recursive: true })

    // Get all the fonts on the system
    let allFonts = await Font.allFonts()

    // We return the created fonts from this method
    let ret = []

    for (let nameIndex = 0; nameIndex < names.length; ++nameIndex) {
        let name = names[nameIndex]

        // Get the font matching the name
        let index = allFonts.findIndex(font => { return font.matches(name) })

        // Did we find it?
        if (index < 0) {
            console.log("      ⚠️  WARNING: Could not find font '" + name + "'")
            continue
        }

        // Get the font we are going to copy
        let font = allFonts[index]

        // We are going to need some constants
        const tempFontPath = os.tmpdir() + "/" + font.filename
        const fontFileName = font.font.fullName + ".ttf"
        const extractedPath = os.tmpdir() + "/" + fontFileName
        const finalPath = folder + "/" + fontFileName
        const xmlPath = os.tmpdir() + "/" + font.font.fullName + ".ttx"
        const extract = "ttx -o \"" + xmlPath + "\" -f -y" + font.collectionIndex + " \"" + tempFontPath + "\""
        const create = "ttx -f \"" + xmlPath + "\""
        const copy = "cp \"" + extractedPath + "\" \"" + finalPath + "\""        

        // Create a copy of that font, pointing it at the final location. Add that copied font to the output
        let returnedFont = {
            family: name, 
            path: "./assets/fonts/" + fontFileName, 
            format: font.format }
        ret.push(returnedFont)

        // If the font has already been copied, we can just bail now
        if (fs.existsSync(finalPath)) {
            continue
        }
        
        // If the font is in a standalone file, just copy it and we are done
        if (!font.isFromCollection) {
            fs.copyFileSync(font.fullPath, finalPath)
            continue
        }

        // We can sync copy the font file across, everything else is a system command, so promises yay.
        fs.copyFileSync(font.fullPath, tempFontPath)
        await system('which ttx')
            .catch(_ => {
                console.log("ERROR: " + font.font.fullName + " is in a font collection (" + font.fullPath + "), but could not be extracted")
                console.log("  (Note, you need to install fonttools - 'brew install fonttools' should do it)")
            })
            .then(_ => { return system(extract) })
            .then(_ => { return system(create) })
            .then(_ => { return system(copy) })
            .catch(err => {
                console.log("ERROR: " + font.font.fullName + " is in a font collection (" + font.fullPath + "), but could not be extracted")
                console.log(err)
            })
    }

    return ret
}

class Font {

    /**
     * The absolute path to the file containing this font
     */
    fullPath

    /**
     * A reference to the nderlying font object
     */
    font

    /**
     * If this font was part of a font collection, this is it's index into that collection (i.e. it was found in a .ttc file)
     */
    collectionIndex

    constructor(fullPath, font) {
        this.fullPath = fullPath
        this.font = font
        this.collectionIndex = undefined
    }

    /**
     * @returns `true` if this font was part of a font collection, `false` otherwise.
     */
    get isFromCollection() {
        return this.collectionIndex != undefined
    }

    /**
     * The filename (path removed) of the file containing this font
     */
    get filename() {
        return this.fullPath.split("/").splice(-1).join()
    }

    /**
     * The formst of the font i.e. opentype, truetype etc.
     */
    get format() {
        let parts = this.fullPath.split('.')
        if (parts.length < 2) { return undefined }
        let extension = parts[parts.length-1]

        switch (extension) {
        case "ttf":
        case "ttc":
        case "dttc":
            return "truetype"
        case "otf": 
            return "opentype"
        case "woff":
            return "woff"
        case "woff2":
            return "woff2"
        case "svg":
            return "svg"
        case "eot":
            return "embedded-opentype"
        }
    }

    /**
     * Helper to decide if this font represents the given name.
     */
    matches(name) {
        return name == this.font.postscriptName || name == this.font.fullName || name == this.font.familyName
    }

    /**
     * Returns a collection of `Font`s from the specified font absolute filename. This will unpack font collection types automagiclly.
     * 
     * @param {string} filename The full path to the font file
     */
    static async allFrom(filename) {
        // Open the font to see if it's a collection
        return new Promise((resolve, reject) => {
            fontkit.open(filename, (error, font) => {
                if (error) {
                    resolve([])
                    return
                }

                if (!font.fonts) {
                    resolve(new Array(new Font(filename, font)))
                    return
                }
    
                let fonts = []
                for (let index = 0; index < font.fonts.length; ++index) {
                    let subfont = new Font(filename, font.fonts[index])
                    subfont.collectionIndex = index
                    fonts.push(subfont)
                }
    
                resolve(fonts)
            })
        })
    }

    /**
     * Returns an array of all the fonts on this machine. This is lazily calculated the first time it's asked for
     * and then cached.
     */
    static async allFonts() {
        const extract = async function (path) {
            let entries = fs.readdirSync(path)
            let fonts = []
            for (let index = 0; index < entries.length; ++index) {
                let file = entries[index]
                let absolute = path + "/" + file

                // If the path is a folder, recurse baby
                if (fs.statSync(absolute).isDirectory()) {
                    fonts.push(await extract(absolute))
                } else {
                    fonts.push(await Font.allFrom(absolute))
                }
            }
            
            return fonts.flat()
        }

        // If we already have the fonts loaded, just return them
        if (!Array.isArray(Font._allFonts)) {
            Font._allFonts = []

            let folders = [os.homedir() + "/Library/Fonts/", "/Library/Fonts", "/System/Library/Fonts"]

            for (let index = 0; index < folders.length; ++index) {
                let extracted = await extract(folders[index])
                Font._allFonts = Font._allFonts.concat(extracted)
            }
        }

        return Font._allFonts
    }
}

// This is populated the first call to Font.allFonts()
Font._allFonts = undefined

module.exports = { processTextStyles: processTextStyles }
