import SparseDataModel from "../abstract/sparse-data-model.mjs";
import ED4E, { LEGEND } from "../../config/_module.mjs";
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
          required: false,
          nullable: true,
          initial:  null,
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
   * Whether more threads can be attached to this true pattern.
   * @type {boolean}
   */
  get canHaveMoreThreads() {
    return this.numberOfAttachedThreads < this.maxThreads;
  }

  /**
   * Whether this thread item has any deeds defined in its levels.
   * @type {boolean}
   */
  get hasDeeds() {
    if ( !this.isThreadItem ) return false;
    return this.threadItemLevels.some(
      levelData => levelData.deed.trim().length > 0
    );
  }


  /**
   * Whether this data represents a thread item (has thread item levels).
   * @type {boolean}
   */
  get isThreadItem() {
    return this.parentDocument.documentName === "Item"
      && this.numberOfLevels > 0;
  }

  /**
   * The next level number for a new ThreadItemLevel. Starts at 1 if no levels exist.
   * @type {number}
   */
  get newLevelNumber() {
    return ( this.numberOfLevels ?? 0 ) + 1;
  }

  /**
   * The number of threads currently attached to this true pattern.
   * @type {number}
   */
  get numberOfAttachedThreads() {
    return this.attachedThreads?.size ?? 0;
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
   * The type of this true pattern, as defined in {@link MAGIC.truePatternTypes}.
   * @type {string}
   */
  get truePatternType() {
    if ( this.isThreadItem ) return "threadItem";
    if ( this.parentDocument.type === "group" ) return "groupPattern";
    return "patternItem";
  }

  // endregion

  // region LP Tracking

  /**
   * The amount of legend points required to increase the level of the thread
   * item, or `undefined` if the amount cannot be retrieved synchronously.
   * @type {number|undefined}
   */
  get requiredLpForIncrease() {
    const level = this.numberOfLevels + 1;
    const tierModifier = LEGEND.lpIndexModForTier[ 1 ][ this.tier ?? "novice" ];
    return LEGEND.legendPointsCost[ level + tierModifier ];
  }

  /**
   * Get the amount of legend points required to increase the entity to the given level.
   * @param {number} [level] The level to get the required legend points for. Defaults to the next level.
   * @returns {Promise<number|undefined>} The amount of legend points required to increase the entity to the given
   * level. Or `undefined` if the amount cannot be determined.
   */
  async getRequiredLpForLevel( level ) {
    const newLevel = level ?? this.numberOfLevels + 1;
    const tierModifier = LEGEND.lpIndexModForTier[ 1 ][ this.tier ?? "novice" ];
    return LEGEND.legendPointsCost[ newLevel + tierModifier ];
  }

  /**
   * Get the amount of legend points required to increase the entity to the given level.
   * @param {number} [level] The level to get the required legend points for. Defaults to the next level.
   * @returns {number|undefined} The amount of legend points required to increase the entity to the given
   * level. Or `undefined` if the amount cannot be determined.
   */
  getRequiredLpForLevelSync( level ) {
    const newLevel = level ?? this.numberOfLevels + 1;
    const tierModifier = LEGEND.lpIndexModForTier[ 1 ][ this.tier ?? "novice" ];
    return LEGEND.legendPointsCost[ newLevel + tierModifier ];
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
   * Adds a thread to the attachedThreads set.
   * @param {string} threadUuid The UUID of the thread to add.
   * @returns {Promise<Document|object>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent.
   */
  async addAttachedThread( threadUuid ) {
    const newThreads = [ ...( this.attachedThreads ?? [] ), threadUuid ];
    const parentDocument = this.parentDocument;

    const updatePath = this.schema.fields.attachedThreads.fieldPath;

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: newThreads } );
    return parentDocument.update( { [ updatePath ]: newThreads, } );
  }

  /**
   * Removes a thread from the attachedThreads set.
   * @param {string} threadUuid The UUID of the thread to remove.
   * @returns {Promise<Document|object>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent.
   */
  async removeAttachedThread( threadUuid ) {
    const newThreads = [ ...( this.attachedThreads ?? [] ) ].filter( t => t !== threadUuid );
    const parentDocument = this.parentDocument;

    const updatePath = this.schema.fields.attachedThreads.fieldPath;

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: newThreads } );
    return parentDocument.update( { [ updatePath ]: newThreads, } );
  }

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

  /**
   * Toggles whether the key knowledge for the given rank/level is known to the player.
   * @param {number} level The rank/level to toggle. Must be between 1 and numberOfLevels.
   * @returns {Promise<Document|object>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent.
   */
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