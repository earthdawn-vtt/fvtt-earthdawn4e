import ActorEd from "./actor.mjs";

export default class EarthdawnActiveEffect extends foundry.documents.ActiveEffect {

  /** @inheritDoc */
  static async _fromStatusEffect( statusId, effectData, options ) {
    foundry.utils.mergeObject( effectData, {
      type:             "condition",
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

  // endregion

  // region Life Cycle Events

  /** @inheritdoc */
  async _preCreate( data, options, user ) {
    if ( super._preCreate( data, options, user ) === false ) return false;

    if ( this.parent instanceof ActorEd ) {
      if ( this.parent.effects.some( effect => this.hasSameSourceAs( effect ) ) ) {
        ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cantHaveEffectFromSameSource" ) );
        return false;
      }
    }
  }

  /** @inheritdoc */
  _onUpdate( changed, options, userId ) {
    super._onUpdate( changed, options, userId );
    if ( options.statusLevelDifference ) {
      // When a status condition has its level changed, display scrolling status text.
      this._displayScrollingStatus( options.statusLevelDifference > 0 );
    }
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  _displayScrollingStatus( enabled ) {
    if ( !( this.statuses.size || this.changes.length ) ) return;

    const actor = this.target;
    const tokens = actor.getActiveTokens( true );
    const text = ( this.parent.effects.has( this.id ) && Number.isInteger( this.system.level ) ) ?
      this.name :
      `${enabled ? "+" : "-"} ${this.name}`;

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

}