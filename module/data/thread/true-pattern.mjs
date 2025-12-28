import SparseDataModel from "../abstract/sparse-data-model.mjs";
import ED4E, { LEGEND } from "../../config/_module.mjs";
import ThreadItemLevelData from "./thread-item-level.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

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
      SYSTEM_TYPES.Actor.pc,
      SYSTEM_TYPES.Actor.npc,
      SYSTEM_TYPES.Actor.creature,
      SYSTEM_TYPES.Actor.spirit,
      SYSTEM_TYPES.Actor.horror,
      SYSTEM_TYPES.Actor.dragon,
      SYSTEM_TYPES.Actor.group,
      SYSTEM_TYPES.Actor.vehicle,
    ],
    "Item":  [
      SYSTEM_TYPES.Item.armor,
      SYSTEM_TYPES.Item.equipment,
      SYSTEM_TYPES.Item.path,
      SYSTEM_TYPES.Item.shield,
      SYSTEM_TYPES.Item.weapon,
      SYSTEM_TYPES.Item.shipWeapon,
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
    return Object.values( this.threadItemLevels ).some(
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
   * The number of ranks/levels known to the player for this thread item.
   * Undefined if not a thread item.
   * @type {undefined|number}
   */
  get numberOfKnownLevels() {
    if ( !this.isThreadItem ) return undefined;
    let knownLevels = 0;
    for ( let level = 1; level <= this.numberOfLevels; level++ ) {
      const levelData = this.threadItemLevels[ level ];
      if ( levelData.knownToPlayer ) knownLevels++;
    }
    return knownLevels;
  }

  /**
   * The number of ranks/levels unknown to the player for this thread item.
   * Undefined if not a thread item.
   * @type {undefined|number}
   */
  get numberOfUnknownLevels() {
    if ( !this.isThreadItem ) return undefined;
    return this.numberOfLevels - this.numberOfKnownLevels;
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
    if ( this.parentDocument.type === SYSTEM_TYPES.Actor.group ) return "groupPattern";
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
   * Reveals the next unknown rank/level to the player.
   * @param {number} [numberOfRanks] The number of ranks to reveal.
   * @returns {Promise<Document|object|undefined>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent, or undefined if all ranks are already known.
   */
  async revealNextRanks( numberOfRanks = 1 ) {
    if ( !this.isThreadItem ) {
      throw new Error( "Cannot reveal next rank for non-thread item." );
    }

    if ( numberOfRanks < 1 ) {
      throw new Error( "Number of ranks to reveal must be at least 1." );
    }

    let result;
    if ( numberOfRanks === 1 ) {
      result = await this._revealSingleNextRank();
    } else {
      // handle separately to avoid multiple document updates
      const updateData = {};
      const firstUnknownLevel = this.numberOfKnownLevels + 1;
      for ( let level = firstUnknownLevel; level < firstUnknownLevel + numberOfRanks; level++ ) {
        const levelData = this.threadItemLevels[ level ];
        if ( !levelData || levelData.knownToPlayer ) break;
        const updatePath = `${ this.schema.fields.threadItemLevels.fieldPath }.${ level }.knownToPlayer`;
        updateData[ updatePath ] = true;
      }

      if ( Object.keys( updateData ).length === 0 ) {
        // all ranks are already known
        return;
      }
      result = await this.parentDocument.update( updateData );
    }

    return result;
  }

  /**
   * Reveals a single unknown rank/level to the player.
   * @returns {Promise<Document|object|undefined>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent, or undefined if all ranks are already known.
   */
  async _revealSingleNextRank() {
    for ( let level = 1; level <= this.numberOfLevels; level++ ) {
      const levelData = this.threadItemLevels[ level ];
      if ( !levelData.knownToPlayer ) {
        return this.toggleRankKnownToPlayer( level, { known: true } );
      }
    }
  }

  /**
   * Toggles whether the given rank/level is known to the player.
   * @param {number} level The rank/level to toggle. Must be between 1 and numberOfLevels.
   * @param {object} options Additional options.
   * @param {boolean} [options.known] Force the rank to be known or unknown to the player.
   * @returns {Promise<Document|object>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent.
   */
  async toggleRankKnownToPlayer( level, options = {} ) {
    if ( !this.isThreadItem || this.numberOfLevels < level || level < 1 ) {
      throw new Error( `Cannot toggle known rank ${ level } for thread item with ${ this.numberOfLevels } levels.` );
    }

    const levelData = this.threadItemLevels[ level ];
    if ( !levelData ) throw new Error( `Level data for level ${ level } not found.` );

    const parentDocument = this.parentDocument;
    const updatePath = `${ this.schema.fields.threadItemLevels.fieldPath }.${ level }.knownToPlayer`;

    const newValue = options.known ?? !levelData.knownToPlayer;

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: newValue } );
    return parentDocument.update( { [ updatePath ]: newValue, } );
  }

  /**
   * Toggles whether the key knowledge for the given rank/level is known to the player.
   * @param {number} level The rank/level to toggle. Must be between 1 and numberOfLevels.
   * @param {object} options Additional options.
   * @param {boolean} [options.known] Force the rank to be known or unknown to the player.
   * @returns {Promise<Document|object>} The updated parent document, or an object containing
   * differential keys and values that were changed if no parent.
   */
  async toggleRankKnowledgeKnownToPlayer( level, options = {} ) {
    if ( !this.isThreadItem || this.numberOfLevels < level || level < 1 ) {
      throw new Error( `Cannot toggle known rank ${ level } for thread item with ${ this.numberOfLevels } levels.` );
    }

    const levelData = this.threadItemLevels[ level ];
    if ( !levelData ) throw new Error( `Level data for level ${ level } not found.` );

    const parentDocument = this.parentDocument;
    const updatePath = `${ this.schema.fields.threadItemLevels.fieldPath }.${ level }.keyKnowledge.isKnown`;

    const newValue = options.known ?? !levelData.keyKnowledge.isKnown;

    if ( !parentDocument ) return this.updateSource( { [ updatePath ]: newValue } );
    return parentDocument.update( { [ updatePath ]: newValue, } );
  }

  // endregion

}