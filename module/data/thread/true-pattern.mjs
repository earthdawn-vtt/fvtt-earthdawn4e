import SparseDataModel from "../abstract/sparse-data-model.mjs";
import ED4E from "../../config/_module.mjs";
import { arrayInsert } from "../../utils.mjs";
import ThreadItemLevelData from "./thread-item-level.mjs";

export default class TruePatternData extends SparseDataModel {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.TruePattern",
  ];

  // endregion

  // region Static Methods

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      characteristics:    new fields.SchemaField( {
        defenses: new fields.SchemaField( {
          mystical: new fields.SchemaField( {
            baseValue: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } ),
            value: new fields.NumberField( {
              required: true,
              nullable: false,
              min:      0,
              step:     1,
              initial:  0,
              integer:  true,
            } ),
          } ),
        } ),
      } ),
      maxThreads:         new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
      } ),
      tier:               new fields.StringField( {
        required: true,
        nullable: false,
        initial:  "novice",
        choices:  ED4E.tier,
      } ),
      enchantmentPattern: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        initial:  null,
      } ),
      threadItemLevels:            new fields.ArrayField(
        new fields.EmbeddedDataField(
          ThreadItemLevelData,
          {
            required: true,
            nullable: false,
          }
        ),
        {
          required: true,
          initial:  [],
        },
      ),

      attachedThreads:    new fields.ArrayField(
        new fields.DocumentUUIDField( {
          type:     "Item",
          nullable: true,
        } ),
        {
          required: true,
          initial:  [ null, ],
        },
      ),
    } );
  }

  static asEmbeddedDataField() {
    return new foundry.data.fields.EmbeddedDataField(
      this,
      {
        required: false,
        nullable: false,
      }
    );
  }

  // endregion

  // region Methods

  addLevel( levelData = {}, index = -1 ) {}

  addEffect( description = "", activeEffects = [], index = -1 ) {
    const effects = [ ...this.effects ];
    const newEffect = { description, activeEffects };
    this.effects = arrayInsert( effects, newEffect, index );
  }

  /**
   * Adds a new key knowledge to the true pattern at the given index/level/rank.
   * @param {string} question The question for the key knowledge.
   * @param {string} answer The answer for the key knowledge.
   * @param {number} index The index at which to add the key knowledge. If -1 or omitted, adds to the end.
   */
  addKeyKnowledge( question = "", answer = "", index = -1 ) {
    const keyKnowledges = [ ...this.keyKnowledges ];
    const newKnowledge = { question, answer };
    this.keyKnowledges = arrayInsert( keyKnowledges, newKnowledge, index );
  }

  addDeed( description = "", index = -1 ) {
    const deeds = [ ...this.deeds ];
    this.deeds = arrayInsert( deeds, description, index );
  }

  // endregion

}