import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { ArmorSystemData } from "./_types.mjs";
 */

/**
 * Data model for armor items.
 * @augments {PhysicalItemTemplate<ArmorSystemData>}
 * @mixes ItemDescriptionTemplate
 * @see {@link ArmorSystemData} The system data model for armor items.
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

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.armor,
    }, {
      inplace: false
    },
  ) );

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