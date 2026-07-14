import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import * as ITEMS from "../../config/items.mjs";

/**
 * @import { EquipmentSystemData } from "./_types.mjs";
 */

/**
 * Data model for equipment items.
 * @augments {PhysicalItemTemplate<EquipmentSystemData>}
 * @mixes ItemDescriptionTemplate
 * @see {@link EquipmentSystemData} The system data model for equipment items.
 */
export default class EquipmentData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  // region Schema

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
          choices:  ITEMS.ammunitionType,
        } ),
      } ),
      bundleSize: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      equipmentMacro: new fields.DocumentUUIDField( {
        type:     "Macro",
        embedded: false,
      } )
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Equipment",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.equipment,
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

  // region Methods

  /** @inheritDoc */
  async getDefaultMacro( options = {} ) {
    if ( !this.equipmentMacro ) return;
    return fromUuid( this.equipmentMacro );
  }

  // endregion

}