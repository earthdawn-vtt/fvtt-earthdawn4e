import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import TargetingMigration from "./migration/targeting-migration.mjs";

/**
 * Data model template with information on equipment items.
 * @property {boolean} consumable check if item will be consumed on usage
 * @property {string} ammunition which type of ammo it is.
 */
export default class EquipmentData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      consumable: new fields.BooleanField( {
        required: true,
        label:    this.labelKey( "Equipment.consumable" ),
        hint:     this.hintKey( "Equipment.consumable" )
      } ),
      // different ammo types are availabel see issue #
      ammunition: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ED4E.ammunitionType,
          label:    this.labelKey( "Equipment.ammunition" ),
          hint:     this.hintKey( "Equipment.ammunition" )
        } ),
      } ),
      bundleSize: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Equipment.bundleSize" ),
        hint:     this.hintKey( "Equipment.bundleSize" )
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    const oldAvialabilities = [ "availabilityEveryday", "availabilityAverage", "availabilityUnusual", "availabilityRare", "availabilityVeryRare", "Everyday", "Average", "Unusual", "Rare", "VeryRare" ];
    const newAvialabilities = [ "everyday", "average", "unusual", "rare", "veryRare", "everyday", "average", "unusual", "rare", "veryRare" ];
    if ( oldAvialabilities.includes( source.availability ) ) {
      source.availability = newAvialabilities[oldAvialabilities.indexOf( source.availability )];
    }
    
    // migrated old Cost value to price
    if ( source.price?.value === undefined ) {
      if ( source.cost.startsWith( "0" ) ) {
        const sanitizedCost = source.cost.replace( /^0+/, "" ).replace( /[.,]/g, "" );
        source.price = {
          ...source.price,
          value:        Number( sanitizedCost ) || 0,
          denomination: "copper",
        };
      } else {
        source.price = {
          ...source.price,
          value:         Number( source.cost.replace( ",", "." ) ) ? Number( source.cost.replace( ",", "." ) ) : 0,
          denomination: "silver",
        };
      }
    }

    // migrated old Weight value to weight
    if ( source.weight?.value === undefined ) {
      source.weight = {
        ...source.weight,
        value:         Number( source.weight.replace( ",", "." ) ) ? Number( source.weight.replace( ",", "." ) ) : 0,
      };
    }

    if ( source.usableItem?.isUsableItem === undefined ) {
      source.usableItem = {
        ...source.usableItem,
        isUsableItem:  source.rollableItem,
        arbitraryStep: source.arbitraryStep,
      };
    }

    // migrate old RecoveryProperty to new recoveryProptertyValue
    if ( source.recoveryProptertyValue === undefined && source.healing > 0 ) {
      source.usableItem = {
        ...source.usableItem,
        recoveryProptertyValue: source.healing
      };
      TargetingMigration.migrateData( source );
    }

    


  }
}