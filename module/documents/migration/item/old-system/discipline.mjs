export default class DisciplineMigration {

  static async migrateData( source ) {

    if ( source.discipline === "discipline" ) {
      source.type = "discipline";
    } else if ( source.discipline === "path" ) {
      source.type = "path";
    } else if ( source.discipline === "questor" ) {
      source.type = "questor";
    }
  
    return source; // Return the modified data
  }
}