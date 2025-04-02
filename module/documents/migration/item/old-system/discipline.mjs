import DisciplineData from "../../../../data/item/discipline.mjs";
import PathData from "../../../../data/item/path.mjs";
import QuestorData from "../../../../data/item/questor.mjs";

export default class DisciplineMigration {

  static async migrateData( source ) {

    if ( source.system.discipline === "discipline" ) {
      source.type = "discipline";
      DisciplineData.migrateData( source.system );
    } else if ( source.system.discipline === "path" ) {
      source.type = "path";
      PathData.migrateData( source );
    } else if ( source.system.discipline === "questor" ) {
      source.type = "questor";
      QuestorData.migrateData( source.system );
    }
  
    return source; // Return the modified data
  }
}