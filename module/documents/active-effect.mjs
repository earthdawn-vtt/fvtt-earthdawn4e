import * as SYSTEM from "../config/system.mjs";
import { SYSTEM_TYPES } from "../constants/constants.mjs";

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
    if ( !this.transfer ) return this.parent; // apply to parent item directly
    switch ( this.system.transferring.target ) {
      case "ability": return undefined;
      case "owner":   return this.parent.parent;
      case "target":  return undefined;
    }

    return null;
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

  // endregion

  // region Checkers

  /**
   * Compares the keys of the changes in the current object with those in another effect and determines if they are the same.
   * @param {EarthdawnActiveEffect} otherEffect - The effect object to compare against.
   * @returns {boolean} Returns true if both effects have the same change keys, otherwise false.
   */
  hasSameChangesKeys( otherEffect ) {
    if ( this.changes.length !== otherEffect.changes.length ) return false;

    const thisKeys = this.changes.map( c => c.key ).sort();
    const otherKeys = otherEffect.changes.map( c => c.key ).sort();
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
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cantHaveEffectFromSameSource" ) );
      return false;
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


}