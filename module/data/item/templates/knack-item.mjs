import SystemDataModel from "../../abstract.mjs";
import TargetTemplate from "./targeting.mjs";
import LearnableTemplate from "./learnable.mjs";

/**
 * Data model template for Knacks
 * @property {string} knackSource     UUID of Source the knack derives from
 */
export default class KnackTemplate extends SystemDataModel.mixin( 
  LearnableTemplate,
  TargetTemplate,
) {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      // shall be fixed with issue #1109
      // sourceTalentUuid: new fields.DocumentUUIDField( {
      //   required: false,
      //   nullable: true,
      //   trim:     true,
      //   blank:    false,
      //   validate: ( value, options ) => {
      //     if ( fromUuidSync( value, {strict: false} )?.type !== "talent" ) return false;
      //     return undefined; // undefined means do further validation
      //   },
      //   validationError: "must be of type 'talent'",
      sourceTalentUuid: new fields.StringField( {
        label:           this.labelKey( "Knack.sourceTalentUuid" ),
        hint:            this.hintKey( "Knack.sourceTalentUuid" ),
      } ),
      minLevel:      new fields.NumberField( {
        required: false,
        nullable: true,
        positive: true,
        integer:  true,
        min:      1,
        initial:  1,
        label:    this.labelKey( "Knack.minLevel" ),
        hint:     this.hintKey( "Knack.minLevel" ),
      } ),
      lpCost:      new fields.NumberField( {
        required: false,
        initial:  0,
        label:    this.labelKey( "Knack.lpCost" ),
        hint:     this.hintKey( "Knack.lpCost" ),
      } ),
      restrictions: new fields.NumberField(),
      requirements: new fields.NumberField(),
      // TODO @Chris how do we do this
      // restrictions: [], // there will be several options possible see issue #212
      // requirements: [], // there will be several options possible see issue #212 
    } );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get increasable() {
    return false;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static _cleanData( source, options ) {
    if ( source?.sourceTalentUuid ) {
      source.sourceTalentUuid = fromUuidSync( source.sourceTalentUuid ) ? source.sourceTalentUuid : null;
      if ( options ) options.source = source;
    }
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