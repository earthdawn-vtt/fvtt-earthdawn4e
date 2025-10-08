import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data model template with information on "class"-like items: paths, disciplines, and questors.
 * @property {number} physicalArmor                     Physical Armor
 * @property {number} mysticalArmor                     Mystical Armor
 * @property {number} forgeBonusPhysical                Forge Bonus for Physical Armor
 * @property {number} forgeBonusMystical                Forge Bonus for Mystical Armor
 * @property {number} initiativePenalty                 Initiative Penalty
 * @property {object} piecemeal                         piecemeal armor Object
 * @property {boolean} piecemeal.isPiecemeal            selector if armor is piecemeal or not
 * @property {number} piecemeal.size                    piecemeal Armor size value can be 1, 2 or 3
 */
export default class ArmorData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      physical: new fields.SchemaField( {
        armor: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        forgeBonus: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      mystical: new fields.SchemaField( {
        armor: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        forgeBonus: new fields.NumberField( {
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
      isLiving: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      piecemeal: new fields.SchemaField( {
        isPiecemeal: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        size: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          max:      3,
          initial:  0,
          integer:  true,
        } ),
      }, {
        required: true,
        nullable: false,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Armor",
  ];

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {
      physicalArmor:      this.physical.armor + this.physical.forgeBonus,
      mysticalArmor:      this.mystical.armor + this.mystical.forgeBonus,
      physicalBaseArmor:  this.physical.armor,
      mysticalBaseArmor:  this.mystical.armor,
      physicalForgeBonus: this.physical.forgeBonus,
      mysticalForgeBonus: this.mystical.forgeBonus,
      piecemealSize:      this.piecemeal.size,
    } );
  }

  // endregion

}