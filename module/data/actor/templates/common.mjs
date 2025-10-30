import ActorDescriptionTemplate from "./description.mjs";
import MappingField from "../../fields/mapping-field.mjs";
import ActorDataModel from "../../abstract/actor-data-model.mjs";
import TruePatternData from "../../thread/true-pattern.mjs";

/**
 * A template for all actors that share the common template.
 * @mixin
 */
export default class CommonTemplate extends ActorDataModel.mixin(
  ActorDescriptionTemplate
) {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      globalBonuses: new MappingField( new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          step:     1,
          initial:  0,
          integer:  true,
        } )
      } ), {
        initialKeys:     CONFIG.ED4E.globalBonuses,
        initialKeysOnly: true,
      } ),
      singleBonuses: new MappingField( new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          step:     1,
          initial:  0,
          integer:  true,
        } )
      } ), {
        initialKeys:     CONFIG.ED4E.singleBonuses,
        initialKeysOnly: true,
      } ),
      favorites: new fields.SetField(
        new fields.DocumentUUIDField( {
          required: false,
        } ),
        {
          initial:         [],
          nullable:        false,
          required:        true,
          initialKeysOnly: true,
        }
      ),
      truePattern: TruePatternData.asEmbeddedDataField(),
    } );
  }

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Common",
  ];

  // endregion

}