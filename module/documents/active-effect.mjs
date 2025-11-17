import ClassTemplate from "../data/item/templates/class.mjs";
import EarthdawnConditionEffectData from "../data/effects/eae-condition.mjs";
import DisciplineData from "../data/item/discipline.mjs";
import QuestorData from "../data/item/questor.mjs";
import PathData from "../data/item/path.mjs";

export default class EarthdawnActiveEffect extends foundry.documents.ActiveEffect {

  /** @inheritDoc */
  static async _fromStatusEffect( statusId, effectData, options ) {
    foundry.utils.mergeObject( effectData, {
      type:             EarthdawnConditionEffectData.metadata.type,
      "system.primary": statusId,
    } );

    const { reference, levels } = CONFIG.ED4E.STATUS_CONDITIONS[ statusId ];
    if ( reference ) effectData.description = `@Embed[${reference} caption=false cite=false inline]`;
    if ( levels > 0 ) effectData.system.level = 1;

    return new this( effectData, options );
  }

  // region Properties

  /** @inheritDoc */
  get target() {
    if ( this.parent instanceof Actor ) return this.parent;
    if ( CONFIG.ActiveEffect.legacyTransferral ) return this.transfer ? null : this.parent;
    if ( this.transfer ) return this.parent.parent ?? null;
    if ( this.appliedToAbility ) return fromUuidSync( this.abilityUuid ) ?? null;

    // if the two previous checks fail, we only have to check if this belongs to an item to be sure
    // that this is applied to the parent item
    if ( this.isItemEffect ) return this.parent ?? null;

    // if this is transferred to the target, this effect will be cloned to the target actor and applied there
    // as above, so we don't need to supply any data here, because we can't now it yet
    return null;
  }

  /**
   * Does this ActiveEffect belong to an Actor?
   * @type {boolean}
   */
  get isActorEffect() {
    return this.parent?.documentName === "Actor";
  }

  /**
   * Does this ActiveEffect belong to an Item?
   * @type {boolean}
   */
  get isItemEffect() {
    return this.parent?.documentName === "Item";
  }

  // endregion

  // region Checkers

  hasSameChangesKeys( otherEffect ) {
    if ( this.changes.length !== otherEffect.changes.length ) return false;

    const thisKeys = this.changes.map( c => c.key ).sort();
    const otherKeys = otherEffect.changes.map( c => c.key ).sort();
    return thisKeys.every( ( key, index ) => key === otherKeys[index] );
  }

  /**
   * Check whether this effect has the same source as another effect. This is true if either the source UUIDs
   * and the effect names are the same, or if both effects have the same name, source uuid and source document type.
   * @param {object} otherEffect - The other effect to compare against.
   * @returns {Promise<boolean>} True if both effects have the same source, false otherwise.
   */
  async hasSameSourceAs( otherEffect ) {
    const thisSource = this.system?.source;
    const otherSource = otherEffect.system?.source;

    const thisDocumentOrigin = await fromUuid( thisSource?.documentOriginUuid );
    const otherDocumentOrigin = await fromUuid( otherSource?.documentOriginUuid );

    const sameEffectName = this.name === otherEffect.name;
    const sameSourceUuid = thisSource?.documentOriginUuid === otherSource?.documentOriginUuid;
    const sameSourceName = thisDocumentOrigin?.name === otherDocumentOrigin?.name;
    const sameSourceType = thisSource?.documentOriginType === otherSource?.documentOriginType;


    return ( sameEffectName && sameSourceUuid ) || ( sameEffectName && sameSourceName && sameSourceType );
  }

  async _shouldPreventCreation( data ) {
    let sameSource = false;
    for ( const effect of this.parent.effects ) {
      if ( await this.hasSameSourceAs( effect ) ) {
        sameSource = true;
        break;
      }
    }

    // class effects are handled in the class data classes
    const isClassEffect = [
      DisciplineData.metadata.type,
      QuestorData.metadata.type,
      PathData.metadata.type,
    ].includes(
      data.system?.source?.documentOriginType
    );

    return sameSource && !isClassEffect;
  }

  // endregion

  // region Life Cycle Events

  /** @inheritdoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;

    if ( await this._shouldPreventCreation( data ) ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cantHaveEffectFromSameSource" ) );
      return false;
    }

    await this._configureCreateData( data, options, user );
  }

  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    await this._configureUpdateData( changes, options, user );
  }

  /** @inheritdoc */
  _onUpdate( changed, options, userId ) {
    super._onUpdate( changed, options, userId );
    if ( options.statusLevelDifference ) {
      // When a status condition has its level changed, display scrolling status text.
      this._displayScrollingStatus( options.statusLevelDifference > 0 );
    }
  }

  /**
   * Configure data when creating an Active Effect.
   * @param {object} data The initial data object provided to the document creation request.
   * @param {object} options Additional options which modify the creation request.
   * @param {BaseUser} user The user requesting the document creation.
   * @returns {Promise<void>}
   */
  async _configureCreateData( data, options, user ) {
    if ( this.parent.system instanceof ClassTemplate ) {
      // until Active Effects are their own document, the effects for advancement need to be stored on the class
      // itself. since it modifies actor stats, the "apply to actor" has to be true. in order for the effects not
      // to be applied twice, the effects need to be disabled on the class
      this.updateSource( {
        disabled: true,
      } );
    }
  }

  /**
   * Configure data when updating an Active Effect.
   * @param {object} changes The candidate changes to the document.
   * @param {object} options Additional options which modify the update request.
   * @param {BaseUser} user The user requesting the document update.
   * @returns {Promise<void>}
   */
  async _configureUpdateData( changes, options, user ) {
    if ( this.parent.system instanceof ClassTemplate ) {
      // see _configureCreateData
      changes.disabled = true;
    }
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  _displayScrollingStatus( enabled ) {
    if ( !( this.statuses.size || this.changes.length ) ) return;

    const actor = this.target;
    const tokens = actor.getActiveTokens( true );
    const text = ( this.parent.effects.has( this.id ) && Number.isInteger( this.system.level ) )
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

  async addSystemChange( changeKey, changeValue, changeMode = CONST.ACTIVE_EFFECT_MODES.ADD, priority = null ) {
    if ( !changeKey || changeValue === undefined || changeValue === null ) {
      throw new Error( "Both changeKey and changeValue are required to add a system change." );
    }

    const newChange = {
      key:      changeKey,
      value:    changeValue,
      mode:     changeMode,
      priority: priority,
    };

    const updatedChanges = [ ...this.system.changes, newChange ];
    return this.update( {
      system: {
        changes: updatedChanges,
      },
    } );
  }

  async updateSystemChange( changeKey, changeValue, changeMode = CONST.ACTIVE_EFFECT_MODES.ADD, priority = null ) {
    if ( !changeKey || changeValue === undefined || changeValue === null ) {
      throw new Error( "changeKey and changeValue are required to update a system change." );
    }

    const existingChange = this.system.changes.find( c => c.key === changeKey );
    if ( !existingChange ) return this.addSystemChange( changeKey, changeValue, changeMode, priority );

    const newChange = {
      key:      changeKey,
      value:    changeValue,
      mode:     changeMode,
      priority: priority,
    };

    const updatedChanges = this.system.changes.map( c => ( c.key === changeKey ? newChange : c ) );
    return this.update( {
      system: {
        changes: updatedChanges,
      },
    } );
  }

  // endregion

}