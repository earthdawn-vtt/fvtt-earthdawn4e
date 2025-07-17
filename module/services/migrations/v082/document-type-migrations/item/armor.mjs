import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class ArmorMigration extends BaseMigration {
  static async migrateEarthdawnData( source ) {
    ImageMigration.migrateEarthdawnData( source );

    // migrate armor values
    source.system.physical ??= {};
    source.system.physical.armor ??= Number( source.system.Aphysicalarmor ) ? Number( source.system.Aphysicalarmor ) : 0;
    source.system.physical.forgeBonus ??= Number( source.system.timesForgedPhysical ) ? Number( source.system.timesForgedPhysical ) : 0;
    source.system.mystical ??= {};
    source.system.mystical.armor ??= Number( source.system.Amysticarmor ) ? Number( source.system.Amysticarmor ) : 0;
    source.system.mystical.forgeBonus ??= Number( source.system.timesForgedMystic ) ? Number( source.system.timesForgedMystic ) : 0;
    source.system.initiativePenalty ??= Number( source.system.armorPenalty ) ? Number( source.system.armorPenalty ) : 0;
    source.system.isLiving = source.system.isLiving ?? false; // Document field, not system 
    return source;
  }
}