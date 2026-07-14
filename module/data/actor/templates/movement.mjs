/**
 * @import { MovementData } from "./_types.mjs";
 */

/**
 * Shared fields for movement data.
 * @see {@link MovementData} The system data model produced by these fields.
 */
export default class MovementFields {

  /**
   * Fields that describe movement shared between sentient actors and namegiver items.
   * @type {{ movement: MovementData }}
   */
  static get movement() {
    const fields = foundry.data.fields;
    return {
      movement: new fields.SchemaField( {
        walk: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        fly: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        swim: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        burrow: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        climb: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } )
      } )
    };
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    return super.migrateData( source );
    // specific migration functions
  }
}