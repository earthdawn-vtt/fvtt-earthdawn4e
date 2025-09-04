import ImageMigration from "./image.mjs";
import BaseMigration from "../../../common/base-migration.mjs";
import ED4E from "../../../../../config/_module.mjs";

export default class SpellMigration extends BaseMigration {

  static async migrateEarthdawnData( source ) {
    
    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );


    if ( !source.system?.spellcastingType && source.system?.discipline ) {

      const oldSpellcastingType = source.system.discipline.slugify( { lowercase: true, strict: true } );
      
      // Check against the spellcastingTypes array and assign the second value if found
      const matchedType = ED4E.MIGRATIONS.systemV0_8_2.spellcastingTypes.find( type => 
        type[0].slugify( { lowercase: true, strict: true } ) === oldSpellcastingType
      );
      
      source.system.spellcastingType = matchedType ? matchedType[1] : "elementarism";
    }

    // Migrate weaving and reattune difficulties
    if ( !source.system?.spellDifficulty ) {
      source.system.spellDifficulty ??= {};
      source.system.spellDifficulty.reattune = source.system.reattunedifficulty;
      source.system.spellDifficulty.weaving = source.system.weavingdifficulty;
    }

    // Migrate required threads
    if ( !source.system?.threads ) {
      source.system.threads ??= {};
      source.system.threads.required = source.system.threadsrequired;
    }

    if ( typeof source.system?.effect !== "object" ) {
      const oldSpellEffect = source.system.effect;
      source.system.effect = {};
      source.system.effect.details = {};
      source.system.effect.type = "special";
      source.system.effect.details.special = {};
      source.system.effect.details.special.description = oldSpellEffect + " " + game.i18n.localize( "ED.Migrations.setSpellEffect" );
    }

    if ( typeof source.system?.duration !== "object" ) {
      const oldDuration = source.system.duration;
      source.system.duration = {};
      source.system.duration.unit = "spec";
      source.system.duration.special = oldDuration + " " + game.i18n.localize( "ED.Migrations.setSpellDuration" );
    }

    if ( typeof source.system?.range !== "object" ) {
      const oldRange = source.system.range;
      source.system.range = {};
      source.system.range.unit = "spec";
      source.system.range.special = oldRange + " " + game.i18n.localize( "ED.Migrations.setSpellRange" );
    }

    // if ( typeof source.system?.area !== "object" ) {
    //   const oldArea = source.system.areaofeffect;
    //   source.system.area = {};
    //   source.system.area.areaType = "cone";
    //   // source.system.area.special = oldArea + " " + game.i18n.localize( "ED.Migrations.setSpellArea" );
    // }
    return source;
  }
}