import ActiveEffectDataModel from "../abstract/active-effect-data-model.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import { LoggerEd } from "../../logging/logger.mjs";

const logger = LoggerEd.getInstance();

/**
 * @import { EarthdawnActiveEffectSystemData } from "./_types.mjs";
 */

/**
 * The base Earthdawn system-specific active effect data model. Concrete subclasses extend this
 * and declare their own schema fields.
 * @augments {ActiveEffectDataModel<EarthdawnActiveEffectSystemData>}
 * @see {@link EarthdawnActiveEffectSystemData} The system data model for Earthdawn active effect data.
 */
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
        `{${ this.execution.script }\n}`,
      );
      await fn.call( globalThis, this.parentDocument, this.parentDocument.parent, options );
    } catch ( error ) {
      logger.error( error );
    }
  }

  // endregion

}