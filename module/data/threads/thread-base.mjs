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
              min:      2,
              step:     1,
              initial:  8,
              integer:  true,
            } ),
            value: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      2,
              step:     1,
              initial:  8,
              integer:  true,
              label:    "ED.Data.Item.Labels.Thread.mysticalDefense",
              hint:     "ED.Data.Item.Hints.Thread.mysticalDefense"
              // label:    this.labelKey( "Thread.mysticalDefense" ),
              // hint:     this.hintKey( "Thread.mysticalDefense" ),
            } ),
          } ),
        } )  
      } ),
      maxThreads: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        step:     1,
        integer:  true,
        label:    "ED.Data.Item.Labels.Thread.maxThreads",
        hint:     "ED.Data.Item.Hints.Thread.maxThreads"
        // label:    this.labelKey( "Thread.maxThreads" ),
        // hint:     this.hintKey( "Thread.maxThreads" ),
      } ),
      maxRank: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  4,
        step:     1,
        integer:  true,
        label:    "ED.Data.Item.Labels.Thread.maxRank",
        hint:     "ED.Data.Item.Hints.Thread.maxRank"
        // label:    this.labelKey( "Thread.maxRank" ),
        // hint:     this.hintKey( "Thread.maxRank" ),
      } ),
      patternType: new fields.StringField( {
        required: true,
        nullable: false,
        choices:  ED4E.patternType,
        initial:  "minor",
        label:    "ED.Data.Item.Labels.Thread.patternType",
        hint:     "ED.Data.Item.Hints.Thread.patternType"
        // label:    this.labelKey( "Thread.patternType" ),
        // hint:     this.hintKey( "Thread.patternType" ),
      } ),
      enchantmentPatternUuid: new fields.DocumentUUIDField( {
        required:        false,
        nullable:        true,
        trim:            true,
        blank:           false,
        // validation is to late for the initialization
        // validate: ( value, options ) => {
        //   if ( fromUuidSync( value, {strict: false} )?.type !== "pattern" ) return false;
        //   console.log( "itemtype of pattern", fromUuidSync( value, {strict: false} )?.type );
        //   return undefined; // undefined means do further validation
        // },
        validationError: "must be of type 'pattern'",
        label:           "ED.Data.Item.Labels.Thread.enchantmentPatternUuid",
        hint:            "ED.Data.Item.Hints.Thread.enchantmentPatternUuid"
        // label:           this.labelKey( "Thread.enchantmentpatternUuid" ),
        // hint:            this.hintKey( "Thread.enchantmentpatternUuid" ),
      } ),
      tier: new fields.StringField( {
        nullable: false,
        blank:    false,
        choices:  ED4E.tier,
        initial:  "novice",
        label:    "ED.Data.Item.Labels.Thread.tier",
        hint:     "ED.Data.Item.Hints.Thread.tier"
        // label:    this.labelKey( "Thread.tier" ),
        // hint:     this.hintKey( "Thread.tier" ),
      } ),
      isAnalyzed: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        label:    "ED.Data.Item.Labels.Thread.isAnalyzed",
        hint:     "ED.Data.Item.Hints.Thread.isAnalyzed"
        // label:    this.labelKey( "Thread.isAnalyzed" ),
        // hint:     this.hintKey( "Thread.isAnalyzed" ),
      } ),
      isKnown: new fields.BooleanField( {
        required: true,
        nullable: false,
        initial:  false,
        label:    "ED.Data.Item.Labels.Thread.isKnown",
        hint:     "ED.Data.Item.Hints.Thread.isKnown"
        // label:    this.labelKey( "Thread.isKnown" ),
        // hint:     this.hintKey( "Thread.isKnown" ),
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