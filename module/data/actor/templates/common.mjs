import { ActorDataModel } from "../../abstract.mjs";
import ActorDescriptionTemplate from "./description.mjs";
import MappingField from "../../fields/mapping-field.mjs";

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
        label:           "ED.Attributes.globalBonuses"
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
        label:           "ED.Config.Eae"
      } )
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}