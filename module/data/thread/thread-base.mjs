import ED4E from "../../config.mjs";
import { SparseDataModel } from "../abstract.mjs";
import ThreadLevelData from "./thread-level.mjs";

export default class ThreadBaseData extends SparseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      isIdentified: new fields.BooleanField( {
        required: true,
        initial:  false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.isIdentified" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.isIdentified" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.isIdentified",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.isIdentified"
      } ),
      isAnalysed: new fields.BooleanField( {
        required: true,
        initial:  false,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.isAnalysed" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.isAnalysed" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.isAnalysed",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.isAnalysed"
      } ),
      // to be aligned with the path of actor mystical defense
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
              // label:    this.labelKey( "PhysicalItems.ThreadItem.mysticalDefense" ),
              // hint:     this.hintKey( "PhysicalItems.ThreadItem.mysticalDefense" )
              label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.mysticalDefense",
              hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.mysticalDefense"
            } ),
          } ),
        } ),
      } ),
      maxThreads:         new fields.NumberField( { 
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.maxThreads" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.maxThreads" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.maxThreads",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.maxThreads"
      } ),
      tier:               new fields.StringField( { 
        required: true,
        nullable: false,
        initial:  "novice",
        choices:  ED4E.tier,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.tier" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.tier" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.tier",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.tier"
      } ),
      enchantmentPattern: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        initial:  null,
        // label:    this.labelKey( "PhysicalItems.ThreadItem.enchantmentPattern" ),
        // hint:     this.hintKey( "PhysicalItems.ThreadItem.enchantmentPattern" )
        label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.enchantmentPattern",
        hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.enchantmentPattern"
      } ),
      levels:     new fields.ArrayField(
        new fields.EmbeddedDataField(
          ThreadLevelData,
          {
            required: false,
            nullable: true,
            // label:    this.labelKey( "PhysicalItems.ThreadItem.threadlevel" ),
            // hint:     this.hintKey( "PhysicalItems.ThreadItem.threadlevel" )
            label:    "ED.Data.Item.Labels.PhysicalItems.ThreadItem.threadlevel",
            hint:     "ED.Data.Item.Hints.PhysicalItems.ThreadItem.threadlevel"
          }
        ),
        {
          required: true,
          nullable: true,
          initial:  [],
        } ),
        
    };
  }

  /**
   * Add a new level to this advancement.
   * @param {object} [data]    If provided, will initialize the new level with the given data.
   */
  addLevel( data = {} ) {
    this.parent.parent.update( {
      "system.threadData.levels": this.levels.concat(
        new ThreadLevelData(
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
      "system.threadData.levels": this.levels.slice( 0, -( amount ?? 1 ) )
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
