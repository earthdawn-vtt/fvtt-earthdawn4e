import SparseDataModel from "../abstract/sparse-data-model.mjs";

/**
 * @import { ThreadItemLevelSystemData } from "./_types.mjs";
 */

/**
 * A single rank/level of a thread item, embedded inside a {@link TruePatternData}. Each level
 * carries its own key knowledge, deed, effect, and granted abilities/active effects.
 * @augments {SparseDataModel<ThreadItemLevelSystemData>}
 * @see {@link ThreadItemLevelSystemData} The system data model for a thread item level.
 */
export default class ThreadItemLevelData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.ThreadItemLevel",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        positive: true,
        initial:  1,
      } ),
      knownToPlayer: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      keyKnowledge: new fields.SchemaField( {
        question: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
        } ),
        answer: new fields.StringField( {
          required: true,
          nullable: false,
          initial:  "",
        } ),
        isKnown: new fields.BooleanField( {
          required: true,
          nullable: false,
          initial:  false,
        } )
      } ),
      deed: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
      } ),
      effect: new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "",
      } ),
      activeEffects: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "ActiveEffect",
        } ),
        {
          required: true,
          initial:  [],
        },
      ),
      abilities: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
        } ),
        {
          required: true,
          initial:  [],
        },
      ),
    };
  }

  // region Getters

  /**
   * Whether this level is visible to the current user. True if the user is a GM or the level is {@link knownToPlayer}.
   * @type {boolean}
   */
  get isVisible() {
    return game.user.isGM || this.knownToPlayer;
  }

  // endregion

}