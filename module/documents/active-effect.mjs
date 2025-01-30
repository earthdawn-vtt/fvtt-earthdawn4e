export default class EarthdawnActiveEffect extends ActiveEffect {

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get target() {
    if ( this.parent instanceof Actor ) return this.parent;
    if ( CONFIG.ActiveEffect.legacyTransferral ) return this.transfer ? null : this.parent;
    if ( this.transfer ) return this.parent.parent ?? null;
    if ( this.appliedToAbility ) return fromUuidSync( this.abilityUuid ) ?? null;

    // if the two previous checks fail, we only have to check if this belongs to an item to be sure
    // that this is applied to the parent item
    if ( this.isItemEffect ) return this.parent.parent ?? null;

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

}