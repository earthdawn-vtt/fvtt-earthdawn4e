import SparseDataModel from "../abstract/sparse-data-model.mjs";
import ED4E from "../../config/_module.mjs";

export default class TruePatternData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.TruePattern",
  ];

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
      keyKnowledges:      new fields.ArrayField(
        new fields.SchemaField( {
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
        },
        {
          required: true,
          nullable: true,
        } ),
        {
          required: true,
          initial:  [ null, ],
        },
      ),
      deeds:              new fields.ArrayField(
        new fields.StringField( {
          required: true,
          nullable: true,
          initial:  "",
        } ),
        {
          required: true,
          initial:  [ null, ],
        },
      ),
      effects:      new fields.ArrayField(
        new fields.SchemaField(
          {
            activeEffects: new fields.SetField(
              new fields.DocumentUUIDField( {
                type:     "ActiveEffect",
                nullable: true,
              } ),
              {
                required: true,
                initial:  [],
              },
            ),
            description:   new fields.StringField( {
              required: true,
              initial:  "",
            } ),
          },
          {
            required: true,
            nullable: true,
          },
        ),
        {
          required: true,
          initial:  [ null, ],
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

}