import { config } from "../../../../data/item/_module.mjs";


export default class DisciplineMigration {

  static async migrateData( source ) {

    if ( source.system?.discipline ) {
      source.type = source.system.discipline;
    }

    config[ source.type ].migrateData( source.system );
  
    return source;
  }
}