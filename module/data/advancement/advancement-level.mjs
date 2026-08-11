import * as LEGEND from "../../config/legend.mjs";
import AbilityTemplate from "../item/templates/ability.mjs";
import IdentifierField from "../fields/identifier-field.mjs";
import SparseDataModel from "../abstract/sparse-data-model.mjs";
import MappingField from "../fields/mapping-field.mjs";
import { mapObject } from "../../utils/object.mjs";

/**
 * @import { AdvancementLevelSystemData } from "./_types.mjs";
 */

/**
 * A level in a class-advancement.
 * @augments {SparseDataModel<AdvancementLevelSystemData>}
 * @see {@link AdvancementLevelSystemData} The system data model for advancement level data.
 */
export default class AdvancementLevelData extends SparseDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      identifier: new IdentifierField( {
        required: true,
        nullable: false,
      } ),
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        positive: true,
        initial:  1,
      } ),
      tier: new fields.StringField( {
        required: true,
        nullable: false,
        blank:    false,
        initial:  "novice",
        choices:  LEGEND.tier,
      } ),
      abilities: new MappingField(
        new fields.SetField(
          new fields.DocumentUUIDField(
            AbilityTemplate ),
          {
            required: true,
            empty:    true,
            initial:  [],
          }
        ),
        {
          initialKeys:     mapObject( LEGEND.abilityPools, ( key, _ ) => [ key, [] ] ),
          required:        true,
          nullable:        false,
        }
      ),
      effects: new fields.SetField(
        new fields.DocumentUUIDField(
          ActiveEffect ),
        {
          required: true,
          empty:    true,
          initial:  [],
        }
      ),
      resourceStep: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        min:      1,
        positive: true,
        initial:  this.initResourceStep,
      } ),
    };
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AdvancementLevel",
  ];

  // endregion

  // region Static Methods

  /**
   * Determine the initial resource (karma/devotion) step for a level.
   * @param {object} source  The source data for the level.
   * @returns {number}       The initial resource step.
   */
  static initResourceStep( source ) {
    return source.level >= 13 ? 5 : 4;
  }

  // endregion

}