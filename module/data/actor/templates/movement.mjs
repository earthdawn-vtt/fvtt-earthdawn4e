export default class MovementFields {
  /**
   * Fields that describe movement shared between sentient actors and namegiver items.
   * @type {object}
   * @property {object} movement        The object containing the speed data for different movement types.
   * @property {number} movement.walk   Walking speed.
   * @property {number} movement.fly    Flying speed.
   * @property {number} movement.swim   Swimming speed.
   * @property {number} movement.burrow Burrowing speed.
   * @property {number} movement.climb  Climbing speed.
   */
  static get movement() {
    const fields = foundry.data.fields;
    return {
      movement: new fields.SchemaField( {
        walk: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
          label:    "ED.Item.Namegiver.walk"
        } ),
        fly: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
          label:    "ED.Item.Namegiver.fly"
        } ),
        swim: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
          label:    "ED.Item.Namegiver.swim"
        } ),
        burrow: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
          label:    "ED.Item.Namegiver.burrow"
        } ),
        climb: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
          label:    "ED.Item.Namegiver.climb"
        } )
      },
      {
        label: "ED.Data.Other.Labels.movement",
        hint:  "ED.Data.Other.Hints.movement"
      }
      )
    };
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