import SystemDataModel from "./system-data-model.mjs";

/**
 * Variant of the SystemDataModel with support for custom active effects.
 */
export default class ActiveEffectDataModel extends SystemDataModel {

  // region Static Properties

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

  // endregion

  // region Data Preparation

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

  // endregion

  // region Validation

  /**
   * Validate that an {@link EffectChangeData#type} string is well-formed.
   * @param {string} type The string to be validated
   * @returns {true} If the type string is valid
   * @throws {Error} An error if the type string is malformed
   * @see {@link ActiveEffectTypeDataModel}
   */
  static _validateType( type ) {
    if ( type.length < 3 ) throw new Error( "must be at least three characters long" );
    if ( !/^custom\.-?\d+$/.test( type ) && !type.split( "." ).every( s => /^[a-z0-9]+$/i.test( s ) ) ) {
      throw new Error(
        "A change type must either be a sequence of dot-delimited, alpha-numeric substrings or of the form"
        + " \"custom.{number}\""
      );
    }
    return true;
  }

  // endregion

}