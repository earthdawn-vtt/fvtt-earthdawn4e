/* eslint-disable complexity */
import ED4E from "../../../../config/_module.mjs";

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

      source.system = source.system || {};
      // set up rolltypeDetails and reaction object if they don't exist
      if ( !source.system?.rollTypeDetails ) {
        source.system.rollTypeDetails = {};
        if ( !source.system?.rollTypeDetails?.reaction ) {
          source.system.rollTypeDetails.reaction = {};
        }
        if ( !source.system?.rollTypeDetails?.attack ) {
          source.system.rollTypeDetails.attack = {};
        }
        if ( !source.system?.rollTypeDetails?.threadWeaving ) {
          source.system.rollTypeDetails.threadWeaving = {};
        }
      }
      

      // thread weaving and castingType fehlt wie bei reactions oben.

      if ( ED4E.damageAdderNames.some( damageAdder =>
        slugifiedName.includes( damageAdder.slugify( { lowercase: true, strict: true } ) )
      ) ) {
        source.system.rollType = "damage";
      } else if ( 
        combinedReactionNames.some( reactionName =>
          slugifiedName.includes( reactionName.slugify( { lowercase: true, strict: true } ) )
        ) ) {
        source.system.rollType = "reaction";
        if ( ED4E.physicalReactionNames.some( reactionName =>
          slugifiedName.includes( reactionName.slugify( { lowercase: true, strict: true } ) )
        ) ) {
          source.system.rollTypeDetails.reaction.defenseType = "physical"; 
        } else if ( ED4E.mysticReactionNames.some( reactionName =>
          slugifiedName.includes( reactionName.slugify( { lowercase: true, strict: true } ) )
        ) ) {
          source.system.rollTypeDetails.reaction.defenseType = "mystical";
        } else if ( ED4E.socialReactionNames.some( reactionName =>
          slugifiedName.includes( reactionName.slugify( { lowercase: true, strict: true } ) )
        ) ) {
          source.system.rollTypeDetails.reaction.defenseType = "social";
        } 
      } else if ( combinedPhysicalAttackNames.some( physicalAttackName =>
        slugifiedName.includes( physicalAttackName.slugify( { lowercase: true, strict: true } ) )
      ) ) {
        source.system.rollType = "attack";
        if ( ED4E.unarmedCombatNames.some( unarmedCombatName =>
          slugifiedName.includes( unarmedCombatName.slugify( { lowercase: true, strict: true } ) )  
        ) ) {
          source.system.rollTypeDetails.attack.weaponType = "unarmed";
        } else if ( combinedMeleeNames.some( meleeWeaponName =>
          slugifiedName.includes( meleeWeaponName.slugify( { lowercase: true, strict: true } ) )  
        ) ) {
          source.system.rollTypeDetails.attack.weaponType = "melee";
          if ( !ED4E.offHandCombatTalents.some( unarmedCombatName =>
            slugifiedName.includes( unarmedCombatName.slugify( { lowercase: true, strict: true } ) )  
          ) ) {
            source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
            source.system.rollTypeDetails.attack.weaponItemStatus.add( "mainHand" );
            source.system.rollTypeDetails.attack.weaponItemStatus.add( "twoHands" );
          } else {
            source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
            source.system.rollTypeDetails.attack.weaponItemStatus.add( "offHand" );
          }
        } else if ( ED4E.missileWeaponNames.some( missileWeaponName =>  
          slugifiedName.includes( missileWeaponName.slugify( { lowercase: true, strict: true } ) )
        ) ) {
          source.system.rollTypeDetails.attack.weaponType = "missile";
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
          source.system.rollTypeDetails.attack.weaponItemStatus.add( "twoHands" );
        } else if ( ED4E.throwingWeaponNames.some( throwingWeaponName =>
          slugifiedName.includes( throwingWeaponName.slugify( { lowercase: true, strict: true } ) )
        ) ) {
          source.system.rollTypeDetails.attack.weaponType = "thrown";
          source.system.rollTypeDetails.attack.weaponItemStatus = new Set();
          source.system.rollTypeDetails.attack.weaponItemStatus.add( "mainHand" );
        } 
      } else if ( ED4E.threadWeavingNames.some( threadWeavingName =>
        slugifiedName.includes( threadWeavingName.slugify( { lowercase: true, strict: true } ) )
      ) ) {
        source.system.rollType = "threadWeaving";
        const matchingKey = Object.keys( ED4E.threadWeavingNameForCasters ).find( 
          key => ED4E.threadWeavingNameForCasters[key] === source.name );
        if ( matchingKey && ED4E.spellcastingTypes[matchingKey] ) {
          source.system.rollTypeDetails.threadWeaving.castingType = matchingKey;
          source.system.rollTypeDetails.threadWeaving = {
            castingType:     matchingKey,
          };
        }
      } else if ( ED4E.spellcastingNames.some( spellcastingName =>
        slugifiedName.includes( spellcastingName.slugify( { lowercase: true, strict: true } ) )
      ) ) {
        source.system.rollType = "spellcasting";
      } else {
        source.system.rollType = "ability";
      }
    }
    
    return source; // Return the modified data
  }
}