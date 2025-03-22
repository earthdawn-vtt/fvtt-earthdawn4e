/* eslint-disable complexity */
import {
  oldThreadWeavingTalentNames,
  oldSpellcastingTalentNames,
  oldDamageAdderNames,
  unarmedCombatNames,
  meleeWeaponNames,
  missileWeaponNames,
  throwingWeaponNames,
  physicalReactionNames,
  mysticReactionNames,
  socialReactionNames,
  itemStatusMeleeWeapons,
  itemStatusMissileWeapons,
  itemStatusThrowingWeapons,
  oldActions,
  newActions,
  oldTargetDefense,
} from "./migration-const.mjs";


export default class ActionMigration {
    
  static async migrateData( source ) {

    // Migrate action (ok)
    if ( source.system.action === undefined ) {
      if ( oldActions.includes( source.system.action ) ) {
        source.system.action = newActions[oldActions.indexOf( source.system.action )];
      }
    }

    // set roll Type based on ability name
    if ( source.system.rollType === undefined || source.system.rollType === "" ) {
      if ( oldDamageAdderNames.includes( source.name ) ) {
        source.system.rollType = "damage";
      } else if ( physicalReactionNames.includes( source.name ) ) {
        source.system.rollType = "reaction";
      } else if ( mysticReactionNames.includes( source.name ) ) {
        source.system.rollType = "reaction";
      } else if ( socialReactionNames.includes( source.name ) ) {
        source.system.rollType = "reaction";
      } else if ( meleeWeaponNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponItemStatus === undefined && source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          if ( !source.system.rollTypeDetails ) {
            source.system.rollTypeDetails = {};
          }
          if ( !source.system.rollTypeDetails.attack ) {
            source.system.rollTypeDetails.attack = {};
          }
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set( itemStatusMeleeWeapons );
          source.system.rollTypeDetails.attack.weaponType = "melee";
        }
      } else if ( missileWeaponNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponItemStatus === undefined && source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          if ( !source.system.rollTypeDetails ) {
            source.system.rollTypeDetails = {};
          }
          if ( !source.system.rollTypeDetails.attack ) {
            source.system.rollTypeDetails.attack = {};
          }
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set( itemStatusMissileWeapons );
          source.system.rollTypeDetails.attack.weaponType = "missile";
        }
      } else if ( throwingWeaponNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponItemStatus === undefined && source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          if ( !source.system.rollTypeDetails ) {
            source.system.rollTypeDetails = {};
          }
          if ( !source.system.rollTypeDetails.attack ) {
            source.system.rollTypeDetails.attack = {};
          }
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set( itemStatusThrowingWeapons );
          source.system.rollTypeDetails.attack.weaponType = "thrown";
        }
      } else if ( unarmedCombatNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          source.system.rollTypeDetails.attack.weaponType = "unarmed";
        }
      } else if ( oldThreadWeavingTalentNames.includes( source.name ) ) {
        source.system.rollType = "threadWeaving";
      } else if ( oldSpellcastingTalentNames.includes( source.name ) ) {
        source.system.rollType = "spellcasting";
      } 
    }

    // set physical difficulty based on ability name
    if ( unarmedCombatNames.includes( source.name ) 
      || meleeWeaponNames.includes( source.name ) 
      || missileWeaponNames.includes( source.name ) 
      || throwingWeaponNames.includes( source.name ) ) {
      if ( oldTargetDefense.includes( source.system.defenseTarget ) && source.system.difficulty?.target === undefined ) {
        source.system.difficulty = {target: "physical" };
      }
    }
    return source; // Return the modified data
  }
}