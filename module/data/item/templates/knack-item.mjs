import SystemDataModel from "../../abstract.mjs";
import TargetTemplate from "./targeting.mjs";
import LearnableTemplate from "./learnable.mjs";
import { ConstraintData } from "../../common/restrict-require.mjs";
import EdIdField from "../../fields/edid-field.mjs";

/**
 * Data model template for Knacks
 * @property {string} knackSource     UUID of Source the knack derives from
 */
export default class KnackTemplate extends SystemDataModel.mixin( 
  LearnableTemplate,
  TargetTemplate,
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Knack",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      sourceTalent: new EdIdField( {
        label:           this.labelKey( "Knack.sourceTalent" ),
        hint:            this.hintKey( "Knack.sourceTalent" ),
      } ),
      minLevel:         new fields.NumberField( {
        required: true,
        positive: true,
        integer:  true,
        initial:  1,
        label:    this.labelKey( "Knack.minLevel" ),
        hint:     this.hintKey( "Knack.minLevel" ),
      } ),
      lpCost:           new fields.NumberField( {
        required: false,
        positive: true,
        integer:  true,
        label:    this.labelKey( "Knack.lpCost" ),
        hint:     this.hintKey( "Knack.lpCost" ),
      } ),
      restrictions:     new fields.ArrayField(
        new fields.TypedSchemaField( ConstraintData.TYPES ),
        {
          label: this.labelKey( "Knack.restrictions" ),
          hint:  this.hintKey( "Knack.restrictions" ),
        }
      ),
      requirements:     new fields.ArrayField(
        new fields.TypedSchemaField( ConstraintData.TYPES ),
        {
          label: this.labelKey( "Knack.requirements" ),
          hint:  this.hintKey( "Knack.requirements" ),
        }
      ),
    } );
  }

  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cannotLearn" ) );
      return;
    }

    const itemData = foundry.utils.mergeObject(
      item.toObject(),
      foundry.utils.expandObject( createData ),
    );
    return ( await actor.createEmbeddedDocuments( "Item", [ itemData ] ) )?.[0];
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}