const flattenName = (name) => {
    const _names = name.split("/")
    let names = []

    _names.forEach((name) =>{
        // Section Name/Elelemnt Name[Variant]/AtomName -> sectionname--elementname_variant--atomname
        var name1 = name.toLowerCase()
                        .replace("]", "") // Match a [
                        .replace(/\s/gi, "") // Match whitespace
                        .replace(/[[!@#$%^&*().<>?;':"=+{}]/gi, "_"); // Match any of these symbols [!@#$%^&*().<>?;':"=+{}
        names.push(name1)
    })
    return names.join("--")
}

function doRound (number) {
  return Math.round(number * 100) / 100
}

function getAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta+90; // Correct Sketch's 90deg alignment
}

function colorToRGBA(red, green, blue, alpha) {
  return "rgba("+doRound(red*255)+", "+doRound(green*255)+", "+doRound(blue*255)+", "+alpha+") "
}

const getStyleInformation = (lang) => {
     if (lang == "less") {
        return {
            templateFile: "/../lib/template.less.hb",
            ext: "less",
            name: "LESS"
        }
    } else if (lang == "scss") { // if lang == "scss"
        return {
            templateFile: "/../lib/template.scss.hb",
            ext: "scss",
            name: "SCSS"
        }
    } else { // if lang == "css" or default
        return {
            templateFile: "/../lib/template.css.hb",
            ext: "css",
            name: "CSS"
        }
    }
}

module.exports = {flattenName: flattenName, doRound: doRound, getAngle: getAngle, colorToRGBA: colorToRGBA, getStyleInformation: getStyleInformation}
