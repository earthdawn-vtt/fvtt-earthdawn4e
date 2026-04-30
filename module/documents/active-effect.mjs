import * as EFFECTS from "../config/effects.mjs";
import * as SYSTEM from "../config/system.mjs";
import { SYSTEM_TYPES } from "../constants/constants.mjs";
import EarthdawnActiveEffectData from "../data/effect/eae.mjs";

export default class EarthdawnActiveEffect extends foundry.documents.ActiveEffect {

  // region Static Methods

  /** @inheritdoc */
  static async createDialog( data={}, createOptions={}, {
    folders, types, template, context, ...dialogOptions
  }={}, renderOptions={} ) {

    const filteredTypes = ( types ?? Object.values( SYSTEM_TYPES.ActiveEffect ) )
      .filter( t => !SYSTEM.UNAVAILABLE_SYSTEM_TYPES.ActiveEffect.includes( t ) );
    return super.createDialog( data, createOptions, { folders, types: filteredTypes, template, context, ...dialogOptions }, renderOptions );
  }

  /** @inheritDoc */
  static async _fromStatusEffect( statusId, effectData, options ) {
    foundry.utils.mergeObject( effectData, {
      type:             SYSTEM_TYPES.ActiveEffect.condition,
      "system.primary": statusId,
    } );

    const { reference, levels } = CONFIG.ED4E.STATUS_CONDITIONS[ statusId ];
    if ( reference ) effectData.description = `@Embed[${reference} caption=false cite=false inline]`;
    if ( levels > 0 ) effectData.system.level = 1;

    return new this( effectData, options );
  }

  // endregion

  // region Getters

  /**
   *  @inheritdoc
   *  @description The target this Active Effect is applied to.
   *  Null if not embedded. Undefined if the target is a document to which the effect needs to be transferred to.
   *  Effects on Actor documents are always applied to the Actor.
   *  @type {Document|null|undefined}
   */
  get target() {
    if ( !this.isEmbedded ) return null;

    if ( this.parent instanceof Actor ) return this.parent;

    // the parent must now be an Item
    if ( !this.systemTransfer ) return this.parent; // apply to parent item directly
    switch ( this.system.transferring.target ) {
      case "ability": return undefined;
      case "owner":   return this.parent.parent;
      case "target":  return undefined;
    }

    return null;
  }

  /**
   * Whether this Active Effect's target is an Actor
   * @type {boolean}
   */
  get targetsActor() {
    return this.target?.documentName === "Actor"
      || ( this.system.parentDocumentType === "Actor" )
      || (
        this.systemTransfer
        && [ "owner", "target" ].includes( this.system.transferring.target )
      );
  }

  /**
   * Whether this Active Effect's target is an Item
   * @type {boolean}
   */
  get targetsItem() {
    return this.target?.documentName === "Item"
      || ( this.system.parentDocumentType === "Item" && !this.transfer )
      || (
        this.systemTransfer
        && [ "ability", ].includes( this.system.transferring.target )
      );
  }

  /**
   * Retrieves the type of document being targeted for modification.
   * @returns {string|null} Returns the document type as a string ("Actor", "Item"),
   * or null if no valid target document type is found.
   */
  get targetDocumentType() {
    return this.target?.documentName
    || ( this.targetsActor ? "Actor" : this.targetsItem ? "Item" : null );
  }

  /**
   * The document origin ID of this effect, if it was created by a document.
   * @type {string|undefined}
   */
  get originId() {
    return foundry.utils.parseUuid( this.origin )?.id;
  }

  /**
   * The system type of the origin document, if available.
   * Will be null if the origin document is not found or in a compendium.
   * @type {string|null}
   */
  get originType() {
    return fromUuidSync( this.origin )?.type ?? null;
  }

  /**
   * Whether this Active Effect currently modifies an Item
   * @type {boolean}
   */
  get modifiesItem() {
    return this.isEmbedded && this.active && ( this.target?.documentName === "Item" );
  }

  /** @inheritDoc */
  get isTemporary() {
    return super.isTemporary || !!this.system.duration.uses;
  }

  /**
   * Whether this Active Effect does not have a temporary duration
   * @type {boolean}
   */
  get isPermanent() {
    return !this.isTemporary;
  }

  /**
   * The data to evaluate formulas in this active effect against.
   * Undefined if this effect does not have a {@link target} yet.
   * @type {Document.system|DataModel|object|undefined}
   */
  get replacementData() {
    return this.target?.getRollData();
  }

  /**
   * The transfer property of the system data model.
   * @type {boolean}
   */
  get systemTransfer() {
    return this.system.transferring.transfer;
  }

  // endregion

  // region Checkers

  /**
   * Compares the keys of the changes in the current object with those in another effect and determines if they are the same.
   * @param {EarthdawnActiveEffect} otherEffect - The effect object to compare against.
   * @returns {boolean} Returns true if both effects have the same change keys, otherwise false.
   */
  hasSameChangesKeys( otherEffect ) {
    if ( this.system.changes.length !== otherEffect.system.changes.length ) return false;

    const thisKeys = this.system.changes.map( c => c.key ).sort();
    const otherKeys = otherEffect.system.changes.map( c => c.key ).sort();
    return thisKeys.every( ( key, index ) => key === otherKeys[index] );
  }

  /**
   * Check whether this effect has the same source as another effect. This is true if either the source UUIDs
   * and the effect names are the same, or if both effects have the same name, source uuid, and source document type.
   * @param {object} otherEffect - The other effect to compare against.
   * @returns {boolean} True if both effects have the same source, false otherwise.
   */
  hasSameSourceAs( otherEffect ) {
    const thisDocumentOrigin = foundry.utils.fromUuidSync( this.origin );
    const otherDocumentOrigin = foundry.utils.fromUuidSync( otherEffect.origin );

    const sameEffectName = this.name === otherEffect.name;
    const sameSourceUuid = this.origin === otherEffect.origin;
    const sameSourceName = thisDocumentOrigin?.name === otherDocumentOrigin?.name;
    const sameSourceType = this.originType === otherEffect.originType;


    return ( sameEffectName && sameSourceUuid ) || ( sameEffectName && sameSourceName && sameSourceType );
  }

  /**
   * Whether the effect should be prevented from being created.
   * Checks:
   * - if the effect already exists on the target document, following Earthdawn rules of only one effect of same source
   * - if the effect is not a class effect
   * @param {object} data The initial data object provided to the document creation request
   * @returns {boolean} True if the effect should be prevented from being created, false otherwise.
   */
  _shouldPreventCreation( data ) {
    if ( !this.isEmbedded || !this.target ) return false;

    let sameSource = false;
    const target = /** @type {ItemEd|ActorEd} */ this.target;
    if ( target.effects?.size ) sameSource = target.effects.some( effect => this.hasSameSourceAs( effect ) );

    // class effects are handled in the class data classes
    const isClassEffect = [
      SYSTEM_TYPES.Item.discipline,
      SYSTEM_TYPES.Item.questor,
      SYSTEM_TYPES.Item.path,
    ].includes( this.originType );

    return sameSource && !isClassEffect;
  }

  // endregion

  // region Life Cycle Events

  /** @inheritdoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;

    if ( this._shouldPreventCreation( data ) ) {
      ui.notifications.warn( _loc( "ED.Notifications.Warn.cantHaveEffectFromSameSource" ) );
      return false;
    }

    const updates = {
      system: {},
    };

    updates.system.parentDocumentType = this.parent?.documentName;

    updates.duration = { value: this.system.evaluateDurationValueFormula(), };
    if ( !Number.isFinite( updates.duration.value ) )
      updates.duration.expiry = null;

    updates.transfer = this._getTransferValue( data );

    this.updateSource( updates );

  }

  /** @inheritDoc */
  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    const setProperty = foundry.utils.setProperty;

    setProperty( changes, "duration.value", this._getDurationValue ( changes ), );
    if ( !Number.isFinite( changes.duration.value ) )
      setProperty( changes, "duration.expiry", null, );

    setProperty( changes, "transfer", this._getTransferValue( changes ), );
  }

  /**
   * Determine the value for the `transfer` property of the {@link BaseActiveEffect}
   * @param {object} data The data object provided to the document creation or update request
   * @returns {boolean} True if the effect should be transferred, false otherwise.
   */
  _getTransferValue( data ) {
    const getProperty = foundry.utils.getProperty;
    const systemTransfer = getProperty( data, "system.transferring.transfer" ) ?? this.systemTransfer;
    const transferTarget = getProperty( data, "system.transferring.target" ) ?? this.system.transferring.target;
    return systemTransfer && ( transferTarget === "owner" );
  }

  /**
   * Prepare the duration value based on changes or system data
   * @param {object} data The data object provided to the document creation or update request
   * @returns {number|null} The duration value to be used in the update operation
   */
  _getDurationValue( data ) {
    const formula = data.system?.duration?.valueFormula ?? this.system.duration?.valueFormula;
    return this.system.constructor.evaluateDurationValueFormula( formula, this.replacementData, );
  }

  /** @inheritdoc */
  _onUpdate( changed, options, userId ) {
    super._onUpdate( changed, options, userId );

    if ( options.statusLevelDifference ) {
      this._displayScrollingStatus( options.statusLevelDifference > 0 );
    }

  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  _displayScrollingStatus( enabled ) {
    if ( !( this.statuses.size || this.system.changes.length || this.modifiesActor ) ) return;

    const actor = this.actor;
    const tokens = actor.getActiveTokens( true );
    const text = ( actor.effects.has( this.id ) && Number.isInteger( this.system.level ) )
      ? this.name
      : `${enabled ? "+" : "-"} ${this.name}`;

    for ( let token of tokens ) {
      if ( !token.visible || token.document.isSecret ) continue;
      canvas.interface.createScrollingText(
        token.center,
        text,
        {
          anchor:          CONST.TEXT_ANCHOR_POINTS.CENTER,
          direction:       enabled ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM,
          distance:        ( 2 * token.h ),
          fontSize:        28,
          stroke:          0x000000,
          strokeThickness: 4,
          jitter:          0.25,
        },
      );
    }
  }

  /**
   * Retrieves the change key options based on the document type this effect is applied to.
   * @returns {EaeChangeConfig[]} An array of change key options if available; otherwise, an empty array.
   */
  getChangeKeyOptions() {
    return EFFECTS.eaeChangeKeys[ this.targetDocumentType ] ?? [];
  }

  // endregion

  // region Validation

  /** @inheritDoc */
  static validateJoint( data ) {
    const transfer = foundry.utils.getProperty( data, "system.transferring.transfer" );
    const transferTarget = data.system.transferring.target;
    if ( transfer && !Object.keys( EFFECTS.eaeTransferTargets ).includes( transferTarget ) )
      throw new Error( `If transfer is true, the transferring target must be one of ${Object.keys( EFFECTS.eaeTransferTargets ).join( ", " )}.` );
  }

  // endregion

  // region Methods


  /**
   * Add a new change to this Active Effect.
   * @param {EarthdawnActiveEffectChangeData} change - The change data to add.
   * @returns {Promise<EarthdawnActiveEffect>} The updated Active Effect.
   * @throws {Error} If the change key or change value is missing.
   */
  async addSystemChange( change = { type: "add", phase: "initial", priority: null, } ) {
    if ( !change.key || change.value === undefined || change.value === null ) {
      throw new Error( "Both changeKey and changeValue are required to add a system change." );
    }

    const updatedChanges = [ ...this.system.changes, change ];
    return this.update( {
      system: {
        changes: updatedChanges,
      },
    } );
  }

  /**
   * Update an existing change in this Active Effect or add a new one if it doesn't exist.
   * @param {EarthdawnActiveEffectChangeData} change - The change data to update or add.
   * @returns {Promise<EarthdawnActiveEffect>} The updated Active Effect.
   * @throws {Error} If the change key or change value is missing.
   */
  async updateSystemChange( change = { type: "add", phase: "initial", priority: null, } ) {
    if ( !change.key || change.value === undefined || change.value === null ) {
      throw new Error( "changeKey and changeValue are required to update a system change." );
    }

    const existingChange = this.system.changes.find( c => c.key === change.key );
    if ( !existingChange ) return this.addSystemChange( change );

    const updatedChanges = this.system.changes.map(
      existingChange => ( existingChange.key === change.key ? change : existingChange )
    );
    return this.update( {
      system: {
        changes: updatedChanges,
      },
    } );
  }

  /**
   * Toggle the active state of this Active Effect. This sets the `disabled` property accordingly.
   * @param {object} options - Additional options which modify the update request.
   * @param {boolean} [options.active] Force the effect to be active (not disabled) if true, or inactive (disabled) if false.
   * @returns {Promise<undefined | EarthdawnActiveEffect>} The updated Active Effect, or undefined if no update was necessary.
   */
  async toggleActive( options = {} ) {
    const isDisabled = this.disabled;
    const shouldBeActive = typeof options.active === "boolean"
      ? options.active
      : isDisabled;

    if ( isDisabled === !shouldBeActive ) return;

    return this.update( {
      disabled: !shouldBeActive,
    } );
  }

  // endregion

  // region Migration

  /** @inheritDoc */
  static migrateData( source ) {
    /**
     *  Migrate source origin
     *  @deprecated since Foundry v14
     */
    if ( source.system?.hasOwnProperty( "source" ) )
      this._migrateOrigin( source );

    /**
     *  Migrate transfer
     *  @deprecated since Foundry v14
     */
    if ( source.system?.hasOwnProperty( "transferToTarget" ) )
      this._migrateTransfer( source );

    /**
     * Migrate parent document type
     * Do after `transferToTarget` to use the new transferring data.
     */
    if ( !source.system?.hasOwnProperty( "parentDocumentType" ) )
      this._migrateParentDocumentType( source );

    /**
     *  Migrate changes
     *  @deprecated since Foundry v14
     */
    if ( source.system?.changes?.[0] )
      this._migrateChanges( source );

    /**
     *  Migrate duration
     *  @deprecated since Foundry v14
     */
    if ( source.system?.duration?.hasOwnProperty( "type" ) )
      this._migrateDuration( source );

    /**
     *  Migrate execution
     *  @deprecated since Foundry v14
     */
    if ( source.system?.hasOwnProperty( "executable" ) )
      this._migrateExecution( source );

    return super.migrateData( source );
  }

  static _migrateParentDocumentType( source ) {
    const parentDocumentType = this._getParentDocumentType( source );
    if ( source.system )
      source.system.parentDocumentType = parentDocumentType;
    else
      source.system = { parentDocumentType };

  }

  static _getParentDocumentType( source ) {
    if ( source.transfer ) return {
      "ability": "Item",
      "owner":   "Actor",
      "target":  "Actor",
    }[ foundry.utils.getProperty( source, "system.transferring.target" ) ]
      ?? "Actor";

    const changes = source.system?.changes;
    if ( Array.isArray( changes ) && changes.length > 0 ) {
      const isActor = changes.some( change => Object.keys( EFFECTS.eaeActorChangeConfigByKey ).includes( change.key ) );
      return isActor ? "Actor" : "Item";
    }

    return "Actor";
  }

  static _migrateOrigin( source ) {
    source.origin = source.system.source.documentOriginUuid ?? null;
  }

  static _migrateTransfer( source ) {
    const newTarget = source.system.transferToTarget === true
      ? "target"
      : source.system.abilityEdid
        ? "ability"
        : "owner";
    const newAbilityEdid = source.system.abilityEdid ?? SYSTEM.reservedEdid.DEFAULT;

    source.transfer = [ "target", "ability" ].includes( newTarget ) || source.transfer;
    source.system.transferring = {
      target:      newTarget,
      abilityEdid: newAbilityEdid,
    };
  }

  static _migrateChanges( source ) {
    const changes = source.system?.changes;
    if ( !Array.isArray( changes ) ) return;
    source.system.changes = changes.map( change => {
      return {
        ...change,
        phase: EFFECTS.eaeActorChangeConfigByKey[ change.key ]?.phase ?? change.phase ?? "initial",
      };
    } );
  }

  static _migrateDuration( source ) {
    let newValueFormula = null;
    let uses = null;
    let durationUnits = null;

    switch ( source.system.duration.type ) {
      case "combat": {
        if ( source.system.duration.turns !== "" ) {
          newValueFormula = source.system.duration.turns;
          durationUnits = "turns";
        }
        else { // must be rounds if type is combat and turns is empty
          newValueFormula = source.system.duration.rounds ?? "1";
          durationUnits = "rounds";
        }
        break;
      }
      case "permanent": {
        newValueFormula = null;
        break;
      }
      case "realTime": {
        newValueFormula = source.system.duration.seconds;
        durationUnits = "seconds";
        break;
      }
      case "uses": {
        uses = source.system.duration.uses;
        break;
      }
    }

    source.system.duration = {
      valueFormula: newValueFormula,
      uses,
    };
    source.duration = {
      value: EarthdawnActiveEffectData.evaluateDurationValueFormula( newValueFormula, {}, {} ),
      units: durationUnits,
    };
  }

  static _migrateExecution( source ) {
    source.system.execution = {
      executable: source.system.executable,
      executeOn:  source.system.executeOn,
      script:     source.system.executionScript,
    };
  }

  // endregion

}