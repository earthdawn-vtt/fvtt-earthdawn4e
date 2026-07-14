import ManeuverData from "./maneuver.mjs";
import KnackTemplate from "./templates/knack-item.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { KnackManeuverSystemData } from "./_types.mjs";
 */

/**
 * Data model for knack maneuver items.
 * @augments {ManeuverData<KnackManeuverSystemData>}
 * @mixes KnackTemplate
 * @see {@link KnackManeuverSystemData} The system data model for knack maneuver items.
 */
export default class KnackManeuverData extends ManeuverData.mixin(
  KnackTemplate,
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {

    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.KnackManeuver",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.knackManeuver,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion

}