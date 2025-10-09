import ED4E from "../../config/_module.mjs";
import ActorEd from "../../documents/actor.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import SystemDataModel from "../abstract/system-data-model.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";


/**
 * Data model template with information on Curse and Horror Mark items.
 * @property {number} step                  curse step
 * @property {string} curseType             type of the curse
 * @property {boolean} curseActive          is the curse active
 * @property {boolean} curseDetected        is the curse known
 */
export default class CurseHorrorMarkData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
)  {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.CurseHorrorMark",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      step: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ), 
      type: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        trim:     true,
        initial:  "minor",
        choices:  ED4E.curseType,
      } ),
      active: new fields.BooleanField( {
        required: true,
      } ),
      detected: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      source: new fields.ForeignDocumentField( SystemDataModel, {
        idOnly: true,
      } ),
      target: new fields.ForeignDocumentField( ActorEd, {
        idOnly: true,
      } ),
    } );
  }

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion
}