import ED4E from "../../../../config/_module.mjs";
import ImageMigration from "./image.mjs";

export default class WeaponMigration {

  static async migrateData( source ) {
  
    if ( source?._stats?.systemVersion <= "0.8.2.2" ) {
      // migrate image data
      ImageMigration.migrateData( source );

      // set weapon subtype based on slugified name
      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

      if ( source.system.weaponType === "missile" ) {
        source.system.ammunition ??= {};
        if ( ED4E.systemV0_8_2.bowNames.some( bowName =>
          slugifiedName.includes( bowName.slugify( { lowercase: true, strict: true } ) ) ) ) {
          source.system.weaponSubType = Object.keys( ED4E.weaponSubType )[1]; // bow
          source.system.ammunition.type = Object.keys( ED4E.ammunitionType )[0]; // default ammunition type for bows
        } else if ( ED4E.systemV0_8_2.crossbowNames.some( crossbowName =>
          slugifiedName.includes( crossbowName.slugify( { lowercase: true, strict: true } ) ) ) ) {
          source.system.weaponSubType = Object.keys( ED4E.weaponSubType )[2]; // crossbow
          source.system.ammunition.type = Object.keys( ED4E.ammunitionType )[1]; // default ammunition type for crossbows
        } else if ( ED4E.systemV0_8_2.slingNames.some( slingName =>
          slugifiedName.includes( slingName.slugify( { lowercase: true, strict: true } ) ) ) ) {
          source.system.weaponSubType = Object.keys( ED4E.weaponSubType )[3]; // sling
          source.system.ammunition.type = Object.keys( ED4E.ammunitionType )[3]; // default ammunition type for slings
        } else if ( ED4E.systemV0_8_2.blowgunNames.some( blowgunName =>
          slugifiedName.includes( blowgunName.slugify( { lowercase: true, strict: true } ) ) ) ) {
          source.system.weaponSubType = Object.keys( ED4E.weaponSubType )[0]; // blowgun
          source.system.ammunition.type = Object.keys( ED4E.ammunitionType )[2]; // default ammunition type for blowguns
        }
      }
    }
        
    return source;
  }
}

