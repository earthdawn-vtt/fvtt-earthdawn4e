import SparseDataModel from "../abstract/sparse-data-model.mjs";
import ED4E from "../../config/_module.mjs";
import ThreadItemLevelData from "./thread-item-level.mjs";

export default class TruePatternData extends SparseDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      mysticalDefense:    new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        step:     1,
        initial:  2,
        integer:  true,
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
      threadItemLevels:   new fields.TypedObjectField(
        new fields.EmbeddedDataField(
          ThreadItemLevelData,
          {
            required: true,
            nullable: false,
          }
        ),
        {
          required: true,
        },
      ),
      attachedThreads:    new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
        } ),
        {
          required: true,
          initial:  [],
        },
      ),
      knownToPlayer:      new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.TruePattern",
  ];

  // endregion

  // region Static Methods

  static asEmbeddedDataField() {
    return new foundry.data.fields.EmbeddedDataField(
      this,
      {
        required: false,
        nullable: true,
        initial:  null,
      }
    );
  }

  // endregion

  // region Getters

  /**
   * The number of ranks/levels this thread item has. Undefined if not a thread item.
   * @type {number|undefined}
   */
  get numberOfLevels() {
    const levels = this.threadItemLevels;
    if ( levels ) return Object.keys( levels ).length;
    return undefined;
  }

  /**
   * The next level number for a new ThreadItemLevel. Starts at 1 if no levels exist.
   * @type {number}
   */
  get newLevelNumber() {
    return ( this.numberOfLevels ?? 0 ) + 1;
  }

  // endregion

  // region Methods

  /**
   * Adds a new ThreadItemLevel to the threadItemLevels array with the next sequential level number.
   * @param {object} levelData The data for the new level. See {@link ThreadItemLevelData} for structure.
   * @param {number} [levelData.level] The level number. This will be overridden to ensure sequential numbering.
   * @returns {Promise<Document|undefined>} The updated parent document, or undefined if no parent.
   */
  async addThreadItemLevel( levelData = {} ) {
    const level = levelData.level ?? this.newLevelNumber;
    const parentDocument = this.parentDocument;

    const updatePath = `${ this.schema.fields.threadItemLevels.fieldPath }.${ level }`;
    const newData = new ThreadItemLevelData( { ...levelData, level, } );

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: newData } );
    return parentDocument.update( { [ updatePath ]: newData, } );
  }

  /**
   * Removes the last ThreadItemLevel. Does nothing if there are no levels.
   * @returns {Promise<Document|object|undefined>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent, or undefined if no levels existed.
   */
  async removeLastThreadItemLevel() {
    if ( this.numberOfLevels === undefined || this.numberOfLevels === 0 ) return;
    const parentDocument = this.parentDocument;

    const updatePath = `${ this.schema.fields.threadItemLevels.fieldPath }.-=${ this.numberOfLevels }`;

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: null } );
    return parentDocument.update( { [ updatePath ]: null, } );
  };

  // endregion

}