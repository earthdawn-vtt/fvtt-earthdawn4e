import BaseMigration from "../../common/base-migration.mjs";

export default class RequirementsMigration extends BaseMigration {

  static migrateEarthdawnData( source ) {
    // Initialize requirements as an empty array if it doesn't exist
    if (!source.system.requirements || !Array.isArray(source.system.requirements)) {
      source.system.requirements = [];
    }
    
    // Check each item in the array to ensure it has a valid structure
    // Remove any undefined or invalid entries
    if (source.system.requirements.length > 0) {
      source.system.requirements = source.system.requirements.filter(req => {
        return req && typeof req === 'object' && req.type;
      });
    }
  }
}