/* ******************************************

Sketch to Mixin Convertor
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
  font-weight: normal;
  src: url('{{path}}'){{#if format}} format("{{format}}"){{/if}};
}

{{/each}}
{{/if}}

{{#if text}}
/* ****************************************** */
/* Text Styles                                */
/* ****************************************** */

{{#each text}}
.text--{{name}}() {
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
.layer--{{name}}() {
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
.asset--{{name}}() {
  {{#each css}}
  {{name}}: {{{value}}};
  {{/each}}
}

{{/each}}
{{/if}}

{{#if modifiers}}
/* ****************************************** */
/* Modifiers                                  */
/* ****************************************** */

{{#each modifiers}}
.modifier--{{name}}() {
  {{#each css}}
  {{name}}: {{{value}}};
  {{/each}}
}

{{/each}}
{{/if}}
