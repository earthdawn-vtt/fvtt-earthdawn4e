import SystemDataModel from "./system-data-model.mjs";

/**
 * Variant of the SystemDataModel with support for custom active effects.
 */
export default class ActiveEffectDataModel extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.ActiveEffect"
  ];

  /**
   * @typedef {SystemDataModelMetadata} ActiveEffectDataModelMetadata
   * @property {boolean} foo    This is just a test property
   */

  /** @type {ActiveEffectDataModelMetadata} */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    foo: false
  }, {
    inplace: false
  } ) );

  /* -------------------------------------------- */
  /*  Data Preparation                            */

  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if ( this.parent.isEmbedded ) {
      const sourceId = this.parent.flags.ed4e?.sourceId
        ?? this.parent._stats.compendiumSource
        ?? this.parent.flags.core?.sourceId;
      if ( sourceId ) this.parent.actor?.sourcedEffects?.set( sourceId, this.parent );
    }
  }

}