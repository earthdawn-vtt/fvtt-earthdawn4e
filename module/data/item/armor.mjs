import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";
import AvailabilityMigration from "./migration/old-system-V082/availability.mjs";
import PriceMigration from "./migration/old-system-V082/price.mjs";
import WeightMigration from "./migration/old-system-V082/weight.mjs";
import UsableItemMigration from "./migration/old-system-V082/usable-items.mjs";

/**
 * Data model template with information on "class"-like items: paths, disciplines, and questors.
 * @property {number} physicalArmor                     Physical Armor
 * @property {number} mysticalArmor                     Mystical Armor
 * @property {number} forgeBonusPhysical                Forge Bonus for Physical Armor
 * @property {number} forgeBonusMystical                Forge Bonus for Mystical Armor
 * @property {number} initiativePenalty                 Initiative Penalty
 * @property {object} piecemeal                         piecemeal armor Object
 * @property {boolean} piecemeal.isPiecemeal            selector if armor is piecemeal or not
 * @property {number} piecemeal.size                    piecemeal Armor size value can be 1, 2 or 3
 */
export default class ArmorData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Armor",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      physical: new fields.SchemaField( {
        armor: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ), 
        forgeBonus: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      mystical: new fields.SchemaField( {
        armor: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        forgeBonus: new fields.NumberField( {
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
      isLiving: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      piecemeal: new fields.SchemaField( {
        isPiecemeal: new fields.BooleanField( {
          required: true,
          initial:  false,
        } ),
        size: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          max:      3,
          initial:  0,
          integer:  true,
        } ),
      }, {
        required: true,
        nullable: false,
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Getters                       */
  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Migrations                        */
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

    // migrate armor values
    source.physical ??= {};
    source.physical.armor ??= Number( source.Aphysicalarmor ) ? Number( source.Aphysicalarmor ) : 0;
    source.physical.forgeBonus ??= Number( source.timesForgedPhysical ) ? Number( source.timesForgedPhysical ) : 0;
    source.mystical ??= {};
    source.mystical.armor ??= Number( source.Amysticarmor ) ? Number( source.Amysticarmor ) : 0;
    source.mystical.forgeBonus ??= Number( source.timesForgedMystic ) ? Number( source.timesForgedMystic ) : 0;
    source.initiativePenalty ??= Number( source.armorPenalty ) ? Number( source.armorPenalty ) : 0;
    // source.isLiving --> Document
  }
}