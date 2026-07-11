import AbilityTemplate from "./templates/ability.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

/**
 * @import { KnackAbilitySystemData } from "./_types.mjs";
 */

/**
 * Data model for knack ability items.
 * @augments {AbilityTemplate<KnackAbilitySystemData>}
 * @mixes KnackTemplate
 * @mixes ItemDescriptionTemplate
 * @see {@link KnackAbilitySystemData} The system data model for knack ability items.
 */
export default class KnackAbilityData extends AbilityTemplate.mixin(
  KnackTemplate,
  ItemDescriptionTemplate
)  {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      standardEffect: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.KnackAbility",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.knackAbility,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Getters

  /**
   * The final rank of the parent ability.
   * @type {number}
   */
  get parentRank() {
    const parentTalent = this.containingActor?.itemTypes.talent.find( ( talent ) => talent.system.edid === this.sourceItem );
    return parentTalent?.system.level;
  }

  /**
   * The final rank of this ability (e.g. attribute + parent talent rank).
   * @type {number}
   */
  get rankFinal() {
    const attributeStep = ( this.containingActor?.system.attributes[this.attribute]?.step ?? 0 );
    return attributeStep ? this.parentRank + attributeStep : 0;
  }

  // endregion

  // region Life Cycle Events

  /** @inheritdoc */
  async _onCreate( data, options, user ) {
    super._onCreate( data, options, user );

    // assign the source talent
  }

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