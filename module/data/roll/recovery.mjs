import EdRollOptions from "./common.mjs";
import ED4E from "../../config/_module.mjs";

export default class RecoveryRollOptions extends EdRollOptions {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.RecoveryRollOptions",
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      recoveryMode: new fields.StringField( {
        initial:  "recovery",
        choices:  ED4E.WORKFLOWS.recoveryMode,
      } ),
      rollType: new fields.StringField( {
        initial:  "recovery",
      } ),
    } );
  }



}