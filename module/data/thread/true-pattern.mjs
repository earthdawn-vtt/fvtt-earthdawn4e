import SparseDataModel from "../abstract/sparse-data-model.mjs";
import ED4E from "../../config/_module.mjs";
import ThreadItemLevelData from "./thread-item-level.mjs";

export default class TruePatternData extends SparseDataModel {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.TruePattern",
  ];

  // endregion

  // region Static Methods

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      characteristics:    new fields.SchemaField( {
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
        } ),
      } ),
      maxThreads:         new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
      } ),
      tier:               new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "novice",
        choices:  ED4E.tier,
      } ),
      enchantmentPattern: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        initial:  null,
      } ),
      threadItemLevels:            new fields.ArrayField(
        new fields.EmbeddedDataField(
          ThreadItemLevelData,
          {
            required: true,
            nullable: false,
          }
        ),
        {
          required: true,
          initial:  [],
        },
      ),

      attachedThreads:    new fields.ArrayField(
        new fields.DocumentUUIDField( {
          type:     "Item",
          nullable: true,
        } ),
        {
          required: true,
          initial:  [ null, ],
        },
      ),
    } );
  }

  static asEmbeddedDataField() {
    return new foundry.data.fields.EmbeddedDataField(
      this,
      {
        required: false,
        nullable: false,
      }
    );
  }

  // endregion

  // region Methods

  async addThreadItemLevel( levelData = {} ) {
    return this._updateLastThreadItemLevel( "add", levelData );
  }

  async removeLastThreadItemLevel() {
    return this._updateLastThreadItemLevel( "remove" );
  };

  async _updateLastThreadItemLevel( operation = "add", levelData = {} ) {
    const parentDocument = this.parentDocument;
    if ( ![ "add", "remove" ].includes( operation ) ) {
      throw new Error( `Invalid operation: ${operation}. Must be "add" or "remove".` );
    }

    const updatePath = this.schema.fields.threadItemLevels.fieldPath;
    const newData = operation === "add"
      ? [ ...this.threadItemLevels, new ThreadItemLevelData( levelData ) ]
      : this.threadItemLevels.slice( 0, -1 );

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: newData } );
    return parentDocument.update( { [ updatePath ]: newData, } );
  }

  // endregion

}