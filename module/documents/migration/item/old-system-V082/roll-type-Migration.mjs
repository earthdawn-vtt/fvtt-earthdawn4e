 
import ED4E from "../../../../config/_module.mjs";
import { determineConfigValue } from "../../../../utils.mjs";

export default class RollTypeMigration {

   
  static async migrateData( source ) {
    
    // set roll Type based on ability name
    if ( source.system?.rollType === undefined || source.system?.rollType === "" ) {

      const slugifiedName = source.name.slugify( { lowercase: true, strict: true } );
      const combinedReactionNames = [
        ...ED4E.physicalReactionNames,
        ...ED4E.mysticReactionNames,
        ...ED4E.socialReactionNames,
      ];
      const combinedPhysicalAttackNames = [
        ...ED4E.unarmedCombatNames,
        ...ED4E.meleeWeaponNames,
        ...ED4E.missileWeaponNames,
        ...ED4E.throwingWeaponNames,
        ...ED4E.offHandCombatTalents,
      ];
      const combinedMeleeNames = [
        ...ED4E.meleeWeaponNames,
        ...ED4E.offHandCombatTalents,
      ];
     
      source.system ??= {};
      source.system.rollTypeDetails ??= {};
      source.system.rollTypeDetails.reaction ??= {};
      source.system.rollTypeDetails.attack ??= {};
      source.system.rollTypeDetails.threadWeaving ??= {};

      // mapping for the roll type
      const configMappings = [
        { names: ED4E.damageAdderNames, targetValue: "damage" },
        { names: combinedReactionNames, targetValue: "reaction" },
        { names: combinedPhysicalAttackNames, targetValue: "attack" },
        { names: ED4E.threadWeavingNames, targetValue: "threadWeaving" },
        { names: ED4E.spellcastingNames, targetValue: "spellcasting" },
      ];

      // mapping for subcategories of the roll type (reactionType, combatType)
      const configSubCategoryMappings = [
        { names: ED4E.physicalReactionNames, targetValue: "physical" },
        { names: ED4E.mysticReactionNames, targetValue: "mystical" },
        { names: ED4E.socialReactionNames, targetValue: "social" },
        { names: ED4E.unarmedCombatNames, targetValue: "unarmed" },
        { names: combinedMeleeNames, targetValue: "melee" },
        { names: ED4E.missileWeaponNames, targetValue: "missile" },
        { names: ED4E.throwingWeaponNames, targetValue: "thrown" },
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
          if ( ED4E.offHandCombatTalents.some( offHandCombatNames =>
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
        const matchingKey = Object.keys( ED4E.threadWeavingNameForCasters ).find( 
          key => ED4E.threadWeavingNameForCasters[key] === source.name );
        if ( matchingKey && ED4E.spellcastingTypes[matchingKey] ) {
          source.system.rollTypeDetails.threadWeaving.castingType = matchingKey;
          source.system.rollTypeDetails.threadWeaving = {
            castingType:     matchingKey,
          };
        }
      } else {
        source.system.rollType = "ability";
      }
    }
    
    return source; // Return the modified data
  }
}