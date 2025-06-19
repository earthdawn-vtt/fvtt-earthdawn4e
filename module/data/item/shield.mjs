import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";
import AvailabilityMigration from "./migration/old-system-V082/availability.mjs";
import PriceMigration from "./migration/old-system-V082/price.mjs";
import WeightMigration from "./migration/old-system-V082/weight.mjs";
import UsableItemMigration from "./migration/old-system-V082/usable-items.mjs";

/**
 * Data model template with information on shield items.
 * @property {number} defenseBonusPhysical    physical defense bonus
 * @property {number} defenseBonusMystical    mystical defense bonus
 * @property {number} initiativePenalty     initiative penalty
 * @property {number} shatterThreshold      shatter threshold
 * @property {boolean} shattered           shattered condition
 */
export default class ShieldData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Shield",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      defenseBonus: new fields.SchemaField( {
        physical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        mystical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      initiativePenalty: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      shatterThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      shattered: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      isLiving: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      bowUsage: new fields.BooleanField( {
        required: true,
        initial:  false,
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
    
    // migrate shield specific data
    source.defenseBonus ??= {};
    source.defenseBonus.physical ??= source.physicaldefense;
    source.defenseBonus.mystical ??= source.mysticdefense;
    source.initiativePenalty ??= source.initiativepenalty;
    source.shatterThreshold ??= source.shatterthreshold;
  }
}