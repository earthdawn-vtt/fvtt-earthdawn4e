import NoneNamegiverPowerData from "./templates/none-namegiver-power.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config.mjs";

/**
 * Data model template with information on Power items.
 */
export default class PowerData extends NoneNamegiverPowerData.mixin(
  ItemDescriptionTemplate,
)  {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      armorType: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ED4E.armor,
        label:    this.labelKey( "Weapons.armorType" ),
        hint:     this.hintKey( "Weapons.armorType" )
      } ),
      damage:        new fields.SchemaField( {
        type: new fields.StringField( {
          initial:  "standard",
          choices:  ED4E.damageType,
          label:    this.labelKey( "Weapons.damageType" ),
          hint:     this.hintKey( "Weapons.damageType" )
        } ),
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  /* -------------------------------------------- */
  /*  Getter                                      */
  /* -------------------------------------------- */
  /**
   *@type {boolean}
   */
  get isCreatureAttack() {
    return this.edid === game.settings.get( "ed4e", "edidCreatureAttack" );
  }
}