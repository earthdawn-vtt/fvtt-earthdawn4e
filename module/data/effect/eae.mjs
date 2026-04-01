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

}