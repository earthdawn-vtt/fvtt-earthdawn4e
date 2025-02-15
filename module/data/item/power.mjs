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
        label:    this.labelKey( "Power.armorType" ),
        hint:     this.hintKey( "Power.armorType" )
      } ),
      damage:        new fields.SchemaField( {
        type: new fields.StringField( {
          initial:  "standard",
          choices:  ED4E.damageType,
          label:    this.labelKey( "Power.damageType" ),
          hint:     this.hintKey( "Power.damageType" )
        } ),
      } ),
      element: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          choices:  ED4E.elements,
          label:    this.labelKey( "Power.powerElementType" ),
          hint:     this.hintKey( "Power.powerElementType" ),
        } ),
        subtype: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          choices:  Object.values(
            ED4E.elementSubtypes
          ).map(
            subtypes => Object.keys( subtypes )
          ).flat(),
          label:    this.labelKey( "Power.powerElementSubtype" ),
          hint:     this.hintKey( "Power.powerElementSubtype" ),
        } )
      },
      {
        required: true,
        nullable: true,
        label:    this.labelKey( "Power.powerElement" ),
        hint:     this.hintKey( "Power.powerElement" ),
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