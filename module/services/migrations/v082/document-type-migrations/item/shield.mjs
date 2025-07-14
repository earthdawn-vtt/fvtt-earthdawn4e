
import ED4E from "../../../../../config/_module.mjs";
import ImageMigration from "./image.mjs";

export default class ShieldMigration {

  static async migrateEarthdawnData( source ) {
  
    ImageMigration.migrateEarthdawnData( source );

    // set bow usage based on slugified name
    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

    if ( ED4E.systemV0_8_2.shieldBowUsageNames.some( shieldNames =>
      slugifiedName.includes( shieldNames.slugify( { lowercase: true, strict: true } ) ) ) ) {
      source.system.bowUsage = true;
    }

    // migrate shield specific data
    source.system.defenseBonus ??= {};
    source.system.defenseBonus.physical ??= source.system.physicaldefense;
    source.system.defenseBonus.mystical ??= source.system.mysticdefense;
    source.system.initiativePenalty ??= source.system.initiativepenalty;
    source.system.shatterThreshold ??= source.system.shatterthreshold;
    return source;
  }
}