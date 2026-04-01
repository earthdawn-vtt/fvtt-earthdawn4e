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

  // endregion

  // region Checkers

  /**
   * Whether this Active Effect currently modifies an Item
   * @type {boolean}
   */
  get modifiesItem() {
    return this.isEmbedded && this.active && ( this.target?.documentName === "Item" );
  }

  // endregion

}