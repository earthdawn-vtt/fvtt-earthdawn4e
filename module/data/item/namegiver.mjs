import ItemDescriptionTemplate from "./templates/item-description.mjs";
import MovementFields from "../actor/templates/movement.mjs";
import MappingField from "../fields/mapping-field.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { NamegiverSystemData } from "./_types.mjs";
 */

/**
 * Data model for namegiver items.
 * @augments {ItemDataModel<NamegiverSystemData>}
 * @mixes ItemDescriptionTemplate
 * @see {@link NamegiverSystemData} The system data model for namegiver items.
 */
export default class NamegiverData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attributeValues: new MappingField(
        new fields.NumberField( {
          required: true,
          nullable: false,
          min:      1,
          initial:  10,
          integer:  true,
          positive: true,
        } ), {
          initialKeys:     CONFIG.ED4E.attributes,
          initialKeysOnly: true,
        } ),
      karmaModifier: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      ...MovementFields.movement,
      weightMultiplier: new fields.NumberField( {
        required: true,
        nullable: false,
        initial:  1,
        integer:  false,
        positive: true,
      } ),
      tailAttack: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      livingArmorOnly: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      weaponSize: new fields.SchemaField( {
        oneHanded: new fields.SchemaField( {
          min: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  1,
            integer:  false,
            positive: true,
          } ),
          max: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  3,
            integer:  false,
            positive: true,
          } ),
        } ),
        twoHanded: new fields.SchemaField( {
          min: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  4,
            integer:  false,
            positive: true,
          } ),
          max: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  6,
            integer:  false,
            positive: true,
          } )
        } )
      } ),
      abilities: new fields.SetField(
        new fields.DocumentUUIDField( ItemDataModel ),
        {
          required: false,
          nullable: true,
          initial:  [],
        } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Namegiver",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      singleton: true,
      type:      SYSTEM_TYPES.Item.namegiver,
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