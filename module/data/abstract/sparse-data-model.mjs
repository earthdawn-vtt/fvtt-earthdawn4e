/**
 * Data Model variant that does not export fields with an `undefined` value during `toObject( true )`.
 */
export default class SparseDataModel extends foundry.abstract.DataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    "ED.Data.Other"
  ];

  /** @inheritdoc */
  static defineSchema() {
    return {};
  }

  /** @inheritDoc */
  toObject( source = true ) {
    if ( !source ) return super.toObject( source );
    const clone = foundry.utils.flattenObject( this._source );
    // remove any undefined keys from the source data
    Object.keys( clone ).filter( k => clone[k] === undefined ).forEach( k => delete clone[k] );
    return foundry.utils.expandObject( clone );
  }

  /**
   * Merge two schema definitions together as well as possible.
   * @param {DataModel} a  First schema that forms the basis for the merge. *Will be mutated.*
   * @param {DataModel} b  Second schema that will be merged in, overwriting any non-mergeable properties.
   * @returns {DataModel}  Fully merged schema.
   */
  static mergeSchema( a, b ) {
    Object.assign( a, b );
    return a;
  }

  // region Properties

  /**
   * Get the actor that contains this data model or undefined if it is not embedded.
   * @type {*|undefined}
   */
  get containingActor() {
    if ( !this.parent ) return undefined;
    return this.parent.actor ?? this.parent.containingActor;
  }

  /**
   * Check if this data model is a descendent of an actor.
   * @type {boolean}
   */
  get isActorEmbedded() {
    if ( !this.parent ) return false;
    if ( this.parent.actor ) return true;
    return this.parent.isActorEmbedded ?? false;
  }

  // endregion

}