import ActiveEffectDataModel from "../abstract/active-effect-data-model.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

export default class EarthdawnActiveEffectData extends ActiveEffectDataModel {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.ActiveEffect.Eae",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.ActiveEffect.eae,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Executable

  /**
   * Execute the effect's execution script.
   * @param {{}} options - Additional options for executing the script. Currently not used.
   * @returns {Promise} A promise that resolves once the script has been executed.
   */
  async execute( options = {} ) {
    try {
      const fn = new foundry.utils.AsyncFunction(
        "effect",
        "parent",
        "options",
        `{${ this.executionScript }\n}`,
      );
      await fn.call( globalThis, this.parentDocument, this.parentDocument.parent, options );
    } catch ( error ) {
      console.error( error );
    }
  }

  // endregion

}