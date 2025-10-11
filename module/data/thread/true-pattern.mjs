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

  /**
   * The types of parent document this embedded document type is allowed to
   * be used in.
   */
  static ALLOWED_TYPES = {
    "Actor": [
      "character",
      "npc",
      "creature",
      "spirit",
      "horror",
      "dragon",
      "group",
      "vehicle",
    ],
    "Item":  [
      "armor",
      "equipment",
      "path",
      "shield",
      "weapon",
      "shipWeapon",
    ],
  };

  // endregion

  // region Static Methods

  /**
   * Create a field definition which defines this embedded document type.
   * @returns {EmbeddedDataField} A field definition which defines this
   * embedded document type.
   */
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

  /**
   * Checks whether this embedded document type is allowed in the given parent document.
   * @param {Document} document The parent document to check.
   * @returns {boolean} Whether this embedded document type is allowed in
   * the given parent document.
   */
  static isAllowedInDocument( document ) {
    const allowedTypes = this.ALLOWED_TYPES[ document.documentName ];
    if ( !allowedTypes ) return false;
    if ( allowedTypes.length === 0 ) return true;
    return allowedTypes.includes( document.type );
  }

  // endregion

  // region Getters

  /**
   * Whether this data represents a thread item (has thread item levels).
   * @type {boolean}
   */
  get isThreadItem() {
    return this.numberOfLevels >= 0;
  }

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

  /**
   * Toggles whether the given rank/level is known to the player.
   * @param {number} level The rank/level to toggle. Must be between 1 and numberOfLevels.
   * @returns {Promise<Document|object>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent.
   */
  async toggleRankKnownToPlayer( level ) {
    if ( !this.isThreadItem || this.numberOfLevels < level || level < 1 ) {
      throw new Error( `Cannot toggle known rank ${ level } for thread item with ${ this.numberOfLevels } levels.` );
    }

    const levelData = this.threadItemLevels[ level ];
    if ( !levelData ) throw new Error( `Level data for level ${ level } not found.` );

    const parentDocument = this.parentDocument;
    const updatePath = `${ this.schema.fields.threadItemLevels.fieldPath }.${ level }.knownToPlayer`;

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: !levelData.knownToPlayer } );
    return parentDocument.update( { [ updatePath ]: !levelData.knownToPlayer, } );
  }

  async toggleRankKnowledgeKnownToPlayer( level ) {
    if ( !this.isThreadItem || this.numberOfLevels < level || level < 1 ) {
      throw new Error( `Cannot toggle known rank ${ level } for thread item with ${ this.numberOfLevels } levels.` );
    }

    const levelData = this.threadItemLevels[ level ];
    if ( !levelData ) throw new Error( `Level data for level ${ level } not found.` );

    const parentDocument = this.parentDocument;
    const updatePath = `${ this.schema.fields.threadItemLevels.fieldPath }.${ level }.keyKnowledge.isKnown`;

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: !levelData.keyKnowledge.isKnown } );
    return parentDocument.update( { [ updatePath ]: !levelData.keyKnowledge.isKnown, } );
  }

  // endregion

}