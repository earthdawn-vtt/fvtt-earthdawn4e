import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";
import AvailabilityMigration from "./migration/old-system-V082/availability.mjs";
import PriceMigration from "./migration/old-system-V082/price.mjs";
import WeightMigration from "./migration/old-system-V082/weight.mjs";
import UsableItemMigration from "./migration/old-system-V082/usable-items.mjs";

/**
 * Data model template with information on equipment items.
 * @property {boolean} consumable check if item will be consumed on usage
 * @property {string} ammunition which type of ammo it is.
 */
export default class EquipmentData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Equipment",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      consumable: new fields.BooleanField( {
        required: true,
      } ),
      ammunition: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ED4E.ammunitionType,
        } ),
      } ),
      bundleSize: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    // Migrate description
    DescriptionMigration.migrateData( source );

    // Migrate availability
    AvailabilityMigration.migrateData( source );

    // migrate price
    PriceMigration.migrateData( source );

    // migrate price
    WeightMigration.migrateData( source );

    // migrate usable items
    UsableItemMigration.migrateData( source );
  }
}