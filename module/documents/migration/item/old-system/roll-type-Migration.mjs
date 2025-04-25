import ED4E from "../../../../config/_module.mjs";

export default class RollTypeMigration {

  // eslint-disable-next-line complexity
  static async migrateData( source ) {
    
    // set roll Type based on ability name
    if ( source.system.rollType === undefined || source.system.rollType === "" ) {

      if ( !source.system.rollTypeDetails ) {
        source.system.rollTypeDetails = {};
      }
      if ( !source.system.rollTypeDetails.reaction ) {
        source.system.rollTypeDetails.reaction = {};
      }

      // Damage adder talents  
      if ( ED4E.oldDamageAdderNames.includes( source.name ) ) {
        source.system.rollType = "damage";
      } 
      
      // Reaction talents
      else if ( ED4E.physicalReactionNames.includes( source.name ) ) {
        source.system.rollType = "reaction";
        
        if ( !source.system.rollTypeDetails?.reaction?.defenseType ) {
          source.system.rollTypeDetails.reaction.defenseType = "physical";
          console.log( "Reaction Type ", source.system.rollTypeDetails.reaction.defenseType );
        }
      } else if ( ED4E.mysticReactionNames.includes( source.name ) ) {
        source.system.rollType = "reaction";
        if ( !source.system.rollTypeDetails?.reaction?.defenseType ) {
          source.system.rollTypeDetails.reaction.defenseType = "mystical";
          console.log( "Reaction Type ", source.system.rollTypeDetails.reaction.defenseType );
        }
      } else if ( ED4E.socialReactionNames.includes( source.name ) ) {
        source.system.rollType = "reaction";
        if ( !source.system.rollTypeDetails?.reaction?.defenseType ) {
          source.system.rollTypeDetails.reaction.defenseType = "social";
          console.log( "Reaction Type ", source.system.rollTypeDetails.reaction.defenseType );
        }
      } 
      
      // Combat talents
      else if ( ED4E.meleeWeaponNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponItemStatus === undefined && source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          if ( !source.system.rollTypeDetails ) {
            source.system.rollTypeDetails = {};
          }
          if ( !source.system.rollTypeDetails.attack ) {
            source.system.rollTypeDetails.attack = {};
          }
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set( ED4E.itemStatusMeleeWeapons );
          source.system.rollTypeDetails.attack.weaponType = "melee";
        }
      } else if ( ED4E.missileWeaponNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponItemStatus === undefined && source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          if ( !source.system.rollTypeDetails ) {
            source.system.rollTypeDetails = {};
          }
          if ( !source.system.rollTypeDetails.attack ) {
            source.system.rollTypeDetails.attack = {};
          }
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set( ED4E.itemStatusMissileWeapons );
          source.system.rollTypeDetails.attack.weaponType = "missile";
        }
      } else if ( ED4E.throwingWeaponNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponItemStatus === undefined && source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          if ( !source.system.rollTypeDetails ) {
            source.system.rollTypeDetails = {};
          }
          if ( !source.system.rollTypeDetails.attack ) {
            source.system.rollTypeDetails.attack = {};
          }
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set( ED4E.itemStatusThrowingWeapons );
          source.system.rollTypeDetails.attack.weaponType = "thrown";
        }
      } else if ( ED4E.unarmedCombatNames.includes( source.name ) ) {
        source.system.rollType = "attack";
        if ( source.system.rollTypeDetails?.attack?.weaponType === undefined ) {
          source.system.rollTypeDetails.attack.weaponType = "unarmed";
        }
      } 
      
      // Thread weaving talents
      else if ( ED4E.oldThreadWeavingTalentNames.includes( source.name ) ) {
        source.system.rollType = "threadWeaving";
        const matchingKey = Object.keys( ED4E.oldThreadWeavingTalentNameForCasters ).find(
          key => ED4E.oldThreadWeavingTalentNameForCasters[key] === source.name );
        if ( matchingKey && ED4E.spellcastingTypes[matchingKey] ) {
          source.system.rollTypeDetails.threadWeaving = {
            castingType:     matchingKey,
          };
        }
      }
    
      // Spellcasting talents
      else if ( ED4E.oldSpellcastingTalentNames.includes( source.name ) ) {
        source.system.rollType = "spellcasting";
      } 

      // set all other to ability roll
      else {
        source.system.rollType = "ability";
      }
    }
    
    return source; // Return the modified data
  }
}