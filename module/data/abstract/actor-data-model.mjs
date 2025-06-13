import SystemDataModel from "./system-data-model.mjs";

/**
 * Variant of the SystemDataModel with some extra actor-specific handling.
 */
export default class ActorDataModel extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor",
  ];

  /**
   * @typedef {SystemDataModelMetadata} ActorDataModelMetadata
   * @property {boolean} supportsAdvancement  Can advancement be performed for this actor type?
   */

  /** @type {ActorDataModelMetadata} */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    supportsAdvancement: false
  }, {
    inplace: false
  } ) );

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @override */
  get embeddedDescriptionKeyPath() {
    return "description.value";
  }

  /* -------------------------------------------- */

  /**
   * Other actors that are available for currency transfers from this actor.
   * @type {ActorEd[]}
   */
  get transferDestinations() {
    const primaryParty = game.settings.get( "ed4e", "primaryParty" )?.actor;
    if ( !primaryParty?.system.members.ids.has( this.parent.id ) ) return [];
    const destinations = primaryParty.system.members.map( m => m.actor ).filter( a => a.isOwner && a !== this.parent );
    if ( primaryParty.isOwner ) destinations.unshift( primaryParty );
    return destinations;
  }


  // region Rolling

  /**
   * See {@link Actor#getRollData}
   * @returns {object} An object to evaluate rolls and {@link FormulaField}s against.
   */
  getRollData() {
    return {};
  }

  // endregion


  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

}