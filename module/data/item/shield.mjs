import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data model template with information on shield items.
 * @property {number} defenseBonusPhysical    physical defense bonus
 * @property {number} defenseBonusMystical    mystical defense bonus
 * @property {number} initiativePenalty     initiative penalty
 * @property {number} shatterThreshold      shatter threshold
 * @property {boolean} shattered           shattered condition
 */
export default class ShieldData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Shield",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      defenseBonus: new fields.SchemaField( {
        physical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        mystical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      initiativePenalty: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      shatterThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      shattered: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      isLiving: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      bowUsage: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
    } );
  }

  // region Macros

  // /** @inheritDoc */
  // getDefaultMacroCommand( options = {} ) {
  //   // Shield items should use actor.rollEquipment() instead of item.system.roll()
  //   return `const item = await fromUuid("${this.parent.uuid}");\nif (item?.isOwned) {\n  await item.actor.rollEquipment(item);\n} else {\n  ui.notifications.warn("Equipment must be owned by an actor to be rolled.");\n}`;
  // }

  // endregion
}