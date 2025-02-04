export * as actor from "./actor/_module.mjs";
export * as advancement from "./advancement/_module.mjs";
export * as configs from "./configs/_module.mjs";
export * as effect from "./effect/_module.mjs";
export * as global from "./global/_module.mjs";
export * as item from "./item/_module.mjs";
export * as journal from "./journal/_module.mjs";


/**
 * Build an array of select options from a provided model schema, like `system.schema.fields`.
 * This is used to populate a select picker with available data fields. The value of each option is the field's
 * {@link DataField#fieldPath}. This works recursively for nested fields/schemas, where the group of the option is the
 * parent schema's label.
 * This is mainly intended for building a human-readable list for {@link ActiveEffect}'s `key` field.
 * @param {DataField|SchemaField} fields - The fields to build options from
 * @returns {FormSelectOption[]} - The select options, flattened for nested fields/schemas
 */
export function buildSelectOptionsFromModel( fields ) {
  const options = [];

  for ( const field of Object.values( fields ) ) {
    if( field.fields ) {
      options.push( ...buildSelectOptionsFromModel( field.fields ) );
    } else {
      const groupName = field.parent?.label || field.parent?.name;
      const group = groupName === "system" ? "" : game.i18n.localize( groupName ) || "";
      const option = {
        value:    field.fieldPath,
        label:    game.i18n.localize( field.label ),
        group:    group,
        disabled: false,
        selected: false,
        rule:     false,
      };
      options.push( option );
    }
  }

  return options;
}