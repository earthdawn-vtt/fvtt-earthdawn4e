
import ED4E from "../../../../../config/_module.mjs";
import AbilityMigration from "./abilities.mjs";
// import DefenseMigration from "./defenses.mjs";
import EdIdMigration from "./edid.mjs";
import ImageMigration from "./image.mjs";
import RollTypeMigration from "./roll-type-Migration.mjs";

export default class SkillMigration {

  static async migrateEarthdawnData( source ) {    RollTypeMigration.migrateEarthdawnData( source );
    
    EdIdMigration.migrateEarthdawnData( source );
    
    AbilityMigration.migrateEarthdawnData( source );
    
    ImageMigration.migrateEarthdawnData( source );
    
    // DefenseMigration.migrateEarthdawnData( source );

    const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );

    if ( !source.skillType ) {
      if ( ED4E.systemV0_8_2.artisan.some( artisanSkill =>
        slugifiedName.includes( artisanSkill.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.skillType = "artisan"; 
      } else if ( ED4E.systemV0_8_2.knowledge.some( knowledgeSkill =>
        slugifiedName.includes( knowledgeSkill.slugify( { lowercase: true, strict: true } ) ) ) ) {
        source.system.skillType = "knowledge"; 
      } else {
        source.system.skillType = "general";
      }
    }
  
    return source;
    
  }
}