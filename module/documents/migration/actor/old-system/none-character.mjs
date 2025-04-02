export default class NoneCharacterMigration {

  static async migrateData( source ) {

    // define new actor type by system.actorType
    if ( source.system.actorType ) { 
      if ( source.system.actorType === "creature" ) source.type = "creature";
      else if ( source.system.actorType === "npc" ) source.type = "npc";
      else if ( source.system.actorType === "spirit" ) source.type = "spirit";
      else if ( source.system.actorType === "horror" ) source.type = "horror";
      else if ( source.system.actorType === "dragon" ) source.type = "dragon";
      else if ( source.system.actorType === "trap" ) source.type = "trap";
    } 
  
    return source;
  }
}