/* eslint-disable complexity */

import ED4E from "../../../config/_module.mjs";
import {
  oldThreadWeavingTalentNames,
  oldThreadWeavingTalentNameForCasters,
  oldSpellcastingTalentNames,
} from "./migration-const.mjs";

export default class MagicSettingMigration {
    
  static async migrateData( source ) {

    // Magic settings based on Talent names
    let magicSettings = {};
    // Check if the source.name matches oldThreadWeavingTalentNames
    if ( oldThreadWeavingTalentNames.includes( source.name ) ) {
      const matchingKey = Object.keys( oldThreadWeavingTalentNameForCasters ).find(
        key => oldThreadWeavingTalentNameForCasters[key] === source.name
      );
      if ( matchingKey && ED4E.spellcastingTypes[matchingKey] ) {
        if ( !source.system.magic ) source.system.magic = {}; // Ensure source.magic exists
        magicSettings = {
          magicType:     matchingKey,
          threadWeaving: true
        };  
      }
    }
    // If source.name matches oldSpellcastingTalentNames, add spellcasting to magicSettings
    if ( oldSpellcastingTalentNames.includes( source.name ) ) {
      magicSettings.spellcasting = true;
    }
    // Merge magicSettings into source.system.magic
    if ( !source.system.magic ) source.system.magic = {};
    Object.assign( source.system.magic, magicSettings );

    return source; // Return the modified data
  }
}