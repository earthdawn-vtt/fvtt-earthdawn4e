import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * Data model template with information on namegiver items.
 * @property {number} firePowerPoints   Fire power of the weapon
 * @property {number} crewWeapon        required crew to handle the weapon
 * @property {number} rangeShort        short range
 * @property {number} rangeLong         long range
 * @property {number} salvoCost         cost per salvo
 * @property {number} characterDamage   weapon damage on a sentient being
 */
export default class ShipWeaponData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      firePowerPoints: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      crewWeapon: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,

      } ),
      range: new fields.SchemaField( {
        short: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        long: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      salvoCost: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      characterDamage: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.ShipWeapon",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.shipWeapon,
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
    return Object.assign( rollData, {} );
  }

  // endregion
}