 
import ED4E from "../../../../config/_module.mjs";
import { determineConfigValue } from "../../../../utils.mjs";

export default class RollTypeMigration {

   
  static async migrateData( source ) {
    
    // set roll Type based on ability name
    if ( source.system?.rollType === undefined || source.system?.rollType === "" ) {

      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
      const combinedReactionNames = [
        ...ED4E.systemV0_8_2.physicalReactionNames,
        ...ED4E.systemV0_8_2.mysticReactionNames,
        ...ED4E.systemV0_8_2.socialReactionNames,
      ];
      const combinedPhysicalAttackNames = [
        ...ED4E.systemV0_8_2.unarmedCombatNames,
        ...ED4E.systemV0_8_2.meleeWeaponNames,
        ...ED4E.systemV0_8_2.missileWeaponNames,
        ...ED4E.systemV0_8_2.throwingWeaponNames,
        ...ED4E.systemV0_8_2.offHandCombatTalents,
      ];
      const combinedMeleeNames = [
        ...ED4E.systemV0_8_2.meleeWeaponNames,
        ...ED4E.systemV0_8_2.offHandCombatTalents,
      ];
     
      source.system ??= {};
      source.system.rollTypeDetails ??= {};
      source.system.rollTypeDetails.reaction ??= {};
      source.system.rollTypeDetails.attack ??= {};
      source.system.rollTypeDetails.threadWeaving ??= {};

      // mapping for the roll type
      const configMappings = [
        { names: ED4E.systemV0_8_2.damageAdderNames, targetValue: "damage" },
        { names: combinedReactionNames, targetValue: "reaction" },
        { names: combinedPhysicalAttackNames, targetValue: "attack" },
        { names: ED4E.systemV0_8_2.threadWeavingNames, targetValue: "threadWeaving" },
        { names: ED4E.systemV0_8_2.spellcastingNames, targetValue: "spellcasting" },
      ];

      // mapping for subcategories of the roll type (reactionType, combatType)
      const configSubCategoryMappings = [
        { names: ED4E.systemV0_8_2.physicalReactionNames, targetValue: "physical" },
        { names: ED4E.systemV0_8_2.mysticReactionNames, targetValue: "mystical" },
        { names: ED4E.systemV0_8_2.socialReactionNames, targetValue: "social" },
        { names: ED4E.systemV0_8_2.unarmedCombatNames, targetValue: "unarmed" },
        { names: combinedMeleeNames, targetValue: "melee" },
        { names: ED4E.systemV0_8_2.missileWeaponNames, targetValue: "missile" },
        { names: ED4E.systemV0_8_2.throwingWeaponNames, targetValue: "thrown" },
      ];
     
      source.system.rollType = determineConfigValue( slugifiedName, configMappings );
      if ( source.system.rollType === "reaction" ) {
        source.system.rollTypeDetails.reaction.defenseType = determineConfigValue( slugifiedName, configSubCategoryMappings );
      } else if ( source.system.rollType === "attack" ) {
        source.system.rollTypeDetails.attack.weaponType = determineConfigValue( slugifiedName, configSubCategoryMappings );
        if ( source.system.rollTypeDetails.attack.weaponType === "thrown" ) {
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
          source.system.rollTypeDetails.attack.weaponItemStatus.add( "mainHand" );
        } else if ( source.system.rollTypeDetails.attack.weaponType === "missile" ) {
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
          source.system.rollTypeDetails.attack.weaponItemStatus.add( "twoHands" );
        } else if ( source.system.rollTypeDetails.attack.weaponType === "melee" ) {
          if ( ED4E.systemV0_8_2.offHandCombatTalents.some( offHandCombatNames =>
            slugifiedName.includes( offHandCombatNames.slugify( { lowercase: true, strict: true } ) )  
          ) ) {
            source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
            source.system.rollTypeDetails.attack.weaponItemStatus.add( "offHand" );
          } else {
            source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
            source.system.rollTypeDetails.attack.weaponItemStatus.add( "mainHand" );
            source.system.rollTypeDetails.attack.weaponItemStatus.add( "twoHands" );
          }
        }
      } else if ( source.system.rollType === "threadWeaving" ) {
        const matchingKey = Object.keys( ED4E.systemV0_8_2.threadWeavingNameForCasters ).find( 
          key => ED4E.systemV0_8_2.threadWeavingNameForCasters[key] === source.name );
        if ( matchingKey && ED4E.spellcastingTypes[matchingKey] ) {
          source.system.rollTypeDetails.threadWeaving.castingType = matchingKey;
          source.system.rollTypeDetails.threadWeaving = {
            castingType:     matchingKey,
          };
        }
      }

      if ( !source.system.rollType ) {
        source.system.rollType = "ability";
      }
      
    }
    
    return source; // Return the modified data
  }
}