/* ******************************************

Sketch to SCSS Convertor
https://github.com/design-ops/sketch-to-scss

/ ******************************************* */

{{#if fonts}}
/* ****************************************** */
/* Fonts                                      */
/* ****************************************** */

{{#each fonts}}
@font-face {
  font-family: "{{family}}";
  font-style: normal;
  src: url('{{path}}'){{#if format}} format("{{format}}"){{/if}};
}

{{/each}}
{{/if}}

{{#if text}}
/* ****************************************** */
/* Text Styles                                */
/* ****************************************** */

{{#each text}}
@mixin text--{{name}} {
  {{#each css}}
  {{name}}: {{{value}}};
  {{/each}}
}

{{/each}}
{{/if}}

{{#if layer}}
/* ****************************************** */
/* Layer Styles                               */
/* ****************************************** */

{{#each layer}}
@mixin layer--{{name}} {
  {{#each css}}
  {{name}}: {{{value}}};
  {{/each}}
}

{{/each}}
{{/if}}

{{#if assets}}
/* ****************************************** */
/* Assets                                     */
/* ****************************************** */

{{#each assets}}
@mixin asset--{{name}} {
  {{#each css}}
  {{name}}: {{{value}}};
  {{/each}}
}

{{/each}}
{{/if}}

{{#if borders}}
/* ****************************************** */
/* Borders                                    */
/* ****************************************** */

{{#each borders}}
@mixin border--{{name}} {
  {{#each css}}
  {{name}}: {{{value}}};
  {{/each}}
}

{{/each}}
{{/if}}
