/* eslint-disable complexity */

import ED4E from "../../../../../config/_module.mjs";
import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";

export default class WeaponMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    // migrate image data
    ImageMigration.migrateEarthdawnData( source );

    // migrate weapon data
    // migrate weapon type
    if ( source.system.weapontype ) {
      source.system.weaponType = source.system.weapontype?.slugify( { lowercase: true, strict: true } );
      if ( ED4E.systemV0_8_2.weaponTypesMelee.includes( source.system.weaponType ) ) {
        source.system.weaponType = Object.keys( ED4E.weaponType )[0];
      } else if ( ED4E.systemV0_8_2.weaponTypesMissile.includes( source.system.weaponType ) ) {
        source.system.weaponType = Object.keys( ED4E.weaponType )[1];
      } else if ( ED4E.systemV0_8_2.weaponTypesThrown.includes( source.system.weaponType ) ) {
        source.system.weaponType = Object.keys( ED4E.weaponType )[2];
      } else if ( ED4E.systemV0_8_2.weaponTypesUnarmed.includes( source.system.weaponType ) ) {
        source.system.weaponType = Object.keys( ED4E.weaponType )[3];
      }
    }

    // migrate damage step
    source.system.damage ??= {};
    if ( ED4E.systemV0_8_2.damageAttributes.includes( source.system.damageattribute ) ) {
      source.system.damage.attribute = Object.keys( ED4E.attributes )[ED4E.systemV0_8_2.damageAttributes.indexOf( source.system.damageattribute )];
    }
    source.system.damage.baseStep ??= Number( source.system.damagestep ) || 0;

    // migrate strength minimum
    source.system.strengthMinimum ??= Number( source.system.strenghtminimum ) || 1;

    // migrate forge bonus
    source.system.forgeBonus ??= Number( source.system.timesForged ) || 0;

    if ( source.system.longrange || source.system.shortrange ) {
      source.system.longrange = source.system.longrange?.slugify( { lowercase: true, strict: true } );  
      source.system.shortrange = source.system.shortrange?.slugify( { lowercase: true, strict: true } );

      source.system.range ??= {};
      source.system.range.shortMin ??= Number( source.system.shortrange.split( "-" )[0] ) || 0;
      source.system.range.shortMax ??= Number( source.system.shortrange.split( "-" )[1] ) || 0;
      source.system.range.longMin ??= Number( source.system.longrange.split( "-" )[0] ) || 0;
      source.system.range.longMax ??= Number( source.system.longrange.split( "-" )[1] ) || 1;
    }

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
    return source;
  }
}

