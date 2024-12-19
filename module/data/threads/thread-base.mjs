import ED4E from "../../config.mjs";
import { SparseDataModel } from "../abstract.mjs";
import PatternThreadLevelData from "./thread-level.mjs";

export default class PatternThreadData extends SparseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      levels: new fields.ArrayField(
        new fields.EmbeddedDataField(
          PatternThreadLevelData,
          {
            required: false,
            nullable: true,
            label:    "ED.patternLevel",
            hint:     "ED.patternLevel"
          }
        ),
        {
          required: true,
          nullable: true,
          initial:  [],
        } ),
      characteristics: new fields.SchemaField( {
        defenses: new fields.SchemaField( {
          mystical: new fields.SchemaField( {
            baseValue: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } ),
            value: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } ),
          } ),
        } )  
      } ),
      maxRank: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      patternType: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
      } ),
      enchantmentPatternUuid: new fields.DocumentUUIDField( {
        required: false,
        nullable: true,
        trim:     true,
        blank:    false,
        validate: ( value, options ) => {
          if ( fromUuidSync( value, {strict: false} )?.type !== "pattern" ) return false;
          return undefined; // undefined means do further validation
        },
        validationError: "must be of type 'pattern'",
        label:           this.labelKey( "thread.enchantmentpatternUuid" ),
        hint:            this.hintKey( "thread.enchantmentpatternUuid" ),
      } ),
      tier: new fields.StringField( {
        nullable: false,
        blank:    false,
        choices:  ED4E.tier,
        initial:  "novice",
        label:    this.labelKey( "Ability.tier" ),
        hint:     this.hintKey( "Ability.tier" )
      } ),
      analyzed: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
      } ),
      isKnown: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
      } ),
    };
  }

  /**
   * Add a new level to this advancement.
   * @param {object} [data]    If provided, will initialize the new level with the given data.
   */
  addLevel( data = {} ) {
    this.parent.parent.update( {
      "system.pattern.levels": this.levels.concat(
        new PatternThreadLevelData(
          {
            ...data,
            level: this.levels.length + 1
          }
        )
      )
    } );
  }

  /**
   * Remove the last {@link amount} levels added from this advancement.
   * @param {number} [amount]   The number of levels to remove.
   */
  deleteLevel( amount = 1 ) {
    this.parent.parent.update( {
      "system.pattern.levels": this.levels.slice( 0, -( amount ?? 1 ) )
    } );
  }
}