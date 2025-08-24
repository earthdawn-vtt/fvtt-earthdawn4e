import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";

/**
 * Data model template with information on equipment items.
 * @property {boolean} consumable check if item will be consumed on usage
 * @property {string} ammunition which type of ammo it is.
 */
export default class EquipmentData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Equipment",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      consumable: new fields.BooleanField( {
        required: true,
      } ),
      ammunition: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ED4E.ammunitionType,
        } ),
      } ),
      bundleSize: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
    } );
  }

  // region Macros

  /** @inheritDoc */
  getDefaultMacroCommand( options = {} ) {
    console.log( "EquipmentData.getDefaultMacroCommand called for:", this.parent.name );
    // Equipment items should use actor.rollEquipment() instead of item.system.roll()
    return `const item = await fromUuid("${this.parent.uuid}");\nif (item?.isOwned) {\n  await item.actor.rollEquipment(item);\n} else {\n  ui.notifications.warn("Equipment must be owned by an actor to be rolled.");\n}`;
  }

  // endregion
}