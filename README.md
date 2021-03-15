# Sketch to CSS Mixin
Sketch to CSS Mixins provides a SASS or LESS conversion of all the **Layer Styles**, **Text Styles** & **Symbol Masters** in your Sketch document. For extensive re-usability all these styles are converted and outputted into a s
single SASS or LESS file in the form of Mixins. 

A [**SASS**](https://sass-lang.com/) or [**LESS**](http://lesscss.org/tools/#frameworks-using-less) pre-processor is required.

## Install 

To install the convertor, run `npm i` inside the `sketch-to-css-mixin` project folder.

## Usage

#### Runing the script

To run directly, use node i.e.

`node index.js <sketch-file-name>`

or, running through npm you have to add a `--` to split out your arguments from npm's arguments i.e.

`npm start -- <sketch-file-name>`

#### Output

By default, the results will appear in the `output` folder in the project - this folder can be changed using the `-o` argument.

#### Selecting Mixin flavor

SASS is output by default, but you can specify which Mixin flavor you prefer by using the `-l` argument (either `-l sass` or `-l less`).

#### Need help?

You can also get help by running `npm start -- -h`, which should list out any other arguments we've forgotten to explain here, with examples.

## What to expect

The convertor will export a single **SASS** or **LESS** file containing **Mixins** of every **Text Style**, **Layer Style** and **Symbol Master** in your Sketch document.

The convertor will also extract required files like **Fonts**, **Bitmaps** and any **SVG's** greater than 2kb in filesize.

All files will be automatically linked within the Mixin file.

```
  sketch.scss (or .less)
   └ assets
     └ fonts
     └ images
```

### /sketch.scss (or /sketch.less)

This is the main file where you will find all the @mixins.

*Note: All SVG's under 2kb will be referenced and encoded directly in this file as Base64, the rest will be extracted as files in the images folder.*

### /assets/fonts/

Fonts being used by any Text Style.

### /assets/images/

Bitmaps & SVG's (over 2Kb) used in any Layer Style or Symbol Master.

*Note: Bitmaps in Symbol Masters will be extracted as SVG's.*


## Mixin name convention

All **Layer Style**, **Text Style**, and **Asset** names in your document are converted based on the following rules:

* A prefix is added
* To lower case
* Spaces are removed
* `/` is converted to `--`
* `[]` is converted to `_`
* Any symbol `!@#$%^&*().<>?;':"=+{}` is converted to `_`

### Example conversions

|Type|Sketch Name|Converted name|
|---|---|---|
|**Text Style**|`Subtitle Center` |`text--subtitlecenter`|
|**Text Style**|`Button/Primary/Label`| `text--button--primary--label`|
|**Text Style**|`Button/Primary[highlighted]/Label`| `text--button--primary_highlighted--label`|
|**Layer Style**|`Background` |`layer--background`|
|**Layer Style**|`Primary Button/Background`| `layer--primarybutton--background`|
|**Layer Style**|`Primary Button[hover]/Background`| `layer--primarybutton_hover--background`|
|**Symbol Master**|`Icon/Logo` |`asset--icon--logo`|



## Layer Styles

### Mixin properties

##### For CSS (sketch.css)
```css
--layer--[layer style name]--background-color: [ background-color ];
--layer--[layer style name]--background-image: [ background-image ], [ background-image ], ... ;
--layer--[layer style name]--background-repeat: [ background-repeat ];
--layer--[layer style name]--background-size: [ background-size ];
--layer--[layer style name]--opacity: [ opacity ];
--layer--[layer style name]--mix-blend-mode: [ mix-blend-mode ];
--layer--[layer style name]--border: [ border ];
--layer--[layer style name]--box-shadow: [ box-shadow ], [ box-shadow ], ... ;
```

##### For SASS (sketch.scss)
```css
@mixin layer--[layer style name] {
	background-color: [ background-color ];
	background-image: [ background-image ], [ background-image ], ... ;
	background-repeat: [ background-repeat ];
	background-size: [ background-size ];
	opacity: [ opacity ];
	mix-blend-mode: [ mix-blend-mode ];
	border: [ border ];
	box-shadow: [ box-shadow ], [ box-shadow ], ... ;
}
```
##### For LESS (sketch.less)
```css
.layer--[layer style name]() {
	background-color: [ background-color ];
	background-image: [ background-image ], [ background-image ], ... ;
	background-repeat: [ background-repeat ];
	background-size: [ background-size ];
	opacity: [ opacity ];
	mix-blend-mode: [ mix-blend-mode ];
	border: [ border ];
	box-shadow: [ box-shadow ], [ box-shadow ], ... ;
}
```

### Fills

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Solid Color**|Used only when a single Fill is applied, Opacity |`background-color`|
|**Solid Color**|Used when multiple Fills are applied, Opacity |`background-image`|
|**Linear Gradient**|Supports multiple Gradients, Opacity, Support for angles |`background-image`|
|**Radial Gradient**|Supports multiple Gradients, Opacity - *Does not display properly due to a difference in how Sketch and CSS renders these gradients.* |`background-image`|
|**Angular Gradient**|Supports multiple Gradients, Opacity - *Does not display properly due to a difference in how Sketch and CSS renders these gradients.* |`background-image`|
|**Pattern Fill**|Supports multiple Images, Opacity |`background-image`|
|**Fill Type**|Tile Image |`background-repeat`|
|**Fill Type**|Tile Image, Image Size, Fill Image, Fit Image or Stretch Image |`background-size`|

### Opacity

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Opacity**|You can apply overall opacity to a layer but be carefull as this property can be inherited by children in HTML. **Please use Color Fill Opacity instead.** |`opacity`|
|**Blend Modes**|Normal, Darken, Multiply, Color Burn, Lighten, Screen, Color Dodge, Overlay, Soft Light, Hard Light, Difference, Exclusion, Hue, Saturation, Color, Luminosity|`mix-blend-mode`|

### Borders

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Solid Color**|Color, Width (Top Left, Top Right, Bottom Right, Bottom Left), Style (Dashed, Dotted or Solid)|`border`|

### Shadows

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Solid Color**|Supports multiple Shadows, X Offset, Y Offset, Blur, Spread, Opacity |`box-shadow`|

### Inner Shadows

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Solid Color**|Supports multiple Shadows, X Offset, Y Offset, Blur, Spread, Opacity |`box-shadow`|



## Text Styles

### Mixin properties

##### For CSS (sketch.css)
```css
--text--[asset name]--font-family: [ font-family ];
--text--[asset name]--font-size: [ font-size ];
--text--[asset name]--letter-spacing: [ letter-spacing ];
--text--[asset name]--line-height: [ line-height ];
--text--[asset name]--color: [ color ];
--text--[asset name]--text-align: [ text-align ];
--text--[asset name]--vertical-align: [ vertical-align ];
--text--[asset name]--text-decoration: [ text-decoration ];
--text--[asset name]--text-transfomr: [ text-transform ];
--text--[asset name]--text-shadow: [ text-shadow ], [ text-shadow ], ... ;
```

##### For SASS (sketch.scss)
```css
@mixin text--[asset name] {
	font-family: [ font-family ];
	font-size: [ font-size ];
	letter-spacing: [ letter-spacing ];
	line-height: [ line-height ];
	color: [ color ];
	text-align: [ text-align ];
	vertical-align: [ vertical-align ];
	text-decoration: [ text-decoration ];
	text-transfomr: [ text-transform ];
	text-shadow: [ text-shadow ], [ text-shadow ], ... ;
}
```
##### For LESS (sketch.less)
```css
.text--[asset name]() {
	font-family: [ font-family ];
	font-size: [ font-size ];
	letter-spacing: [ letter-spacing ];
	line-height: [ line-height ];
	color: [ color ];
	text-align: [ text-align ];
	vertical-align: [ vertical-align ];
	text-decoration: [ text-decoration ];
	text-transfomr: [ text-transform ];
	text-shadow: [ text-shadow ], [ text-shadow ], ... ;
}
```

### Text

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Font Name**|Font Family Name, Font Style |`font-family`|
|**Font Size**|Font Size |`font-size`|
|**Color**|Color, Opacity |`color`|
|**Character**|Spacing between characters |`letter-spacing`|
|**Line**|Spacing between line |`line-height`|

### Alignment

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Horizontal Alignment**|Left, Center, Right, Justified |`text-align`|
|**Vertical Alignment**|Top, Middle, Bottom |`vertical-align`|

### Text Options

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Text Decoration**|None, Underline, Strikethrough |`text-decoration`|
|**Text Transform**|Normal, Uppercase, Lowercase |`text-transform`|

### Shadows

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Solid Color**|Supports multiple Shadows, X Offset, Y Offset, Blur, Spread, Opacity |`text-shadow`|


## Assets

### Mixin properties

##### For CSS (sketch.css)
```css
--asset--[asset name]--background-image: [ url(' filename.svg | base64 ') ];
--asset--[asset name]--background-repeat: no-repeat;
--asset--[asset name]--background-position: center;
--asset--[asset name]--width: [ width ];
--asset--[asset name]--height: [ height ];
```

##### For SASS (sketch.scss)
```css
@mixin asset--[asset name] {
	background-image: [ url(' filename.svg | base64 ') ];
	background-repeat: no-repeat;
	background-position: center;
	width: [ width ];
	height: [ height ];
}
```
##### For LESS (sketch.less)
```css
.asset--[asset name]() {
	background-image: [ url(' filename.svg | base64 ') ];
	background-repeat: no-repeat;
	background-position: center;
	width: [ width ];
	height: [ height ];
}
```

### Properties

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Asset Name**|Extracts the name of the Symbol Master |`background-image`|
|**Width**|Asset artboard width |`width`|
|**Height**|Asset artboard height |`height`|



## Modifiers

In Sketch, some styling attributes are not included in the shared styles. That is why we need to create seperate methods to use them. Current;y we only support Corner Radius.

#### Mixin properties

##### For CSS (sketch.css)
```css
--modifier--[asset name]--border-radius: [ Xpx | Xpx Xpx Xpx Xpx ];
```

##### For SASS (sketch.scss)
```css
@mixin modifier--[asset name] {
	border-radius: [ Xpx | Xpx Xpx Xpx Xpx ];
}
```

##### For LESS (sketch.less)
```css
.modifier--[asset name]() {
	border-radius: [ Xpx | Xpx Xpx Xpx Xpx ];
}
```

#### Corner Radius
The convertor looks for any artboard with a name that ends with ` --radius` and uses the topmost's layer rounded corner settings. This is because rounded corners are not part of the Layer Style in Sketch.

|Sketch Property|Description|CSS Property|
|---|---|---|
|**Radius (Rounded Corners)**|Single number for all corners, individual numbers for each corner.  |`border-radius`|

