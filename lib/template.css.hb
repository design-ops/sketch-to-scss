/* ******************************************

Sketch to CSS Convertor
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
  src: local("{{fontname}}"),
       local("{{family}}"),
       url("{{path}}"){{#if format}} format("{{format}}"){{/if}};
}

{{/each}}
{{/if}}

{{#if text}}
/* ****************************************** */
/* Text Styles                                */
/* ****************************************** */
:root {
  {{#each text as |style|}}
  /* {{style.name}} */
  {{#each css as |property|}}
  --text--{{style.name}}--{{property.name}}: {{{property.value}}};
  {{/each}}

  {{/each}}
}
{{/if}}

{{#if layer}}
/* ****************************************** */
/* Layer Styles                               */
/* ****************************************** */
:root {
  {{#each layer as |style|}}
  /* {{style.name}} */
  {{#each css as |property|}}
  --layer--{{style.name}}--{{property.name}}: {{{property.value}}};
  {{/each}}

  {{/each}}
}
{{/if}}

{{#if assets}}
/* ****************************************** */
/* Assets                                     */
/* ****************************************** */
:root {
  {{#each assets as |style|}}
  /* {{style.name}} */
  {{#each css as |property|}}
  --asset--{{style.name}}--{{property.name}}: {{{property.value}}};
  {{/each}}

  {{/each}}
}
{{/if}}

{{#if modifiers}}
/* ****************************************** */
/* Modifiers                                  */
/* ****************************************** */
:root {
  {{#each modifiers as |style|}}
  /* {{style.name}} */
  {{#each css as |property|}}
  --modifier--{{style.name}}--{{property.name}}: {{{property.value}}};
  {{/each}}

  {{/each}}
}
{{/if}}
