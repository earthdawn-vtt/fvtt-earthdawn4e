export default class MatrixMigration {
    
  static async migrateData( source ) {
    const oldMatrixItemNames = [ "Standard Matrix", "Erweiterte Matrix", "Summenmatrix", "Gepanzerte Matrix", "Gepanzerte matrix" ];
    if ( oldMatrixItemNames.includes( source.name ) ) {
      source.type = "matrix";
    }

    // Migrate description (has to be on the document, since the type just changed)
    if ( typeof source.system.description === "string" ) {
      source.system.description = { value: source.system.description };
    }
    return source; // Return the modified data
  }
}