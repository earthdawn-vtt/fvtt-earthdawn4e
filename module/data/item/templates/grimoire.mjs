import SystemDataModel from "../../abstract.mjs";
import { getSetting } from "../../../settings.mjs";

const { fields } = foundry.data;

export default class GrimoireTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Grimoire",
  ];

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      grimoire: new fields.SchemaField( {
        spells: new fields.SetField(
          new fields.DocumentUUIDField( {
            type:     "Item",
            embedded: false,
          } ), {
            required:        true,
            initial:         [],
          } ),
        owner: new fields.DocumentUUIDField( {
          type:     "Actor",
        } ),
      },{
        nullable: true,
        initial:  null,
      } ),
    } );
  }

  // region Properties

  get isGrimoire() {
    return this.edid === getSetting( "edidGrimoire" );
  }

  get isOwnGrimoire() {
    return this.grimoire?.owner === this.containingActor?.uuid;
  }

  // endregion

}