/**
 * oldAttributes options
 * @enum {string}
 */
export const oldAttributes = 
[ 
  "", 
  "dexterityStep", 
  "strengthStep", 
  "toughnessStep", 
  "perceptionStep", 
  "willpowerStep", 
  "charismaStep", 
  "initiativeStep" 
];

/**
 * newAttributes options
 * @enum {string}
 */
export const newAttributes = 
[ 
  "", 
  "dex", 
  "str", 
  "tou", 
  "per", 
  "wil", 
  "cha", 
  "" 
];

/**
 * oldTargetDefense options
 * @enum {string}
 */
export const oldTargetDefense = [ "", "physicaldefense", "mysticaldefense", "socialdefense" ];

/**
 * newTargetDefense options
 * @enum {string}
 */
export const newTargetDefense = [ "", "physical", "mystical", "social" ];

/**
 * oldGroupDifficulty options
 * @enum {string}
 */
export const oldGroupDifficulty = [ "", "defenseLow", "defenseLowPlus", "defenseHigh", "defenseHighPlus" ];

/**
 * newGroupDifficulty options
 * @enum {string}
 */
export const newGroupDifficulty = [ "", "lowestOfGroup", "lowestX", "highestOfGroup", "highestX" ];

/**
 * newGroupDifficulty options
 * @enum {string}
 */
export const oldThreadWeavingTalentNames = [
  "Fadenweben (Beschützerweben)",
  "Fadenweben (Diebweben)",
  "Fadenweben (Elementarismus)",
  "Fadenweben (Fadenschmieden)",
  "Fadenweben (Flussweben)",
  "Fadenweben (Geisterbeschwörung)",
  "Fadenweben (Geschichtenweben)",
  "Fadenweben (Himmelsweben)",
  "Fadenweben (Illusionismus)",
  "Fadenweben (Kriegsweben)",
  "Fadenweben (Kundschafterweben)",
  "Fadenweben (Luftweben)",
  "Fadenweben (Magie)",
  "Fadenweben (Meeresweben)",
  "Fadenweben (Pfeilweben)",
  "Fadenweben (Reiterweben)",
  "Fadenweben (Schamanismus)",
  "Fadenweben (Tierweben)",
  "Fadenweben (Waffenweben)",
  "Thread Weaving (ENGLISH)",
  // missing Translations thread weaving names 
  // English
  // polish
  // french
];
  
/**
 * oldThreadWeavingTalentNameForCasters options
 * @enum {string}
 */
export const oldThreadWeavingTalentNameForCasters = {
  elementalism: "Fadenweben (Elementarismus)",
  illusionism:  "Fadenweben (Illusionismus)",
  nethermancy:  "Fadenweben (Geisterbeschwörung)",
  shamanism:    "Fadenweben (Schamanismus)",
  wizardry:     "Fadenweben (Magie)",
  // missing Translations thread weaving names 
  // English
  // polish
  // french
};
  
/**
 * oldSpellcastingTalentNames options
 * @enum {string}
 */
export const oldSpellcastingTalentNames = [ "Spellcasting", "Spruchzauberei" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * oldSpellcastingTalentNames options
 * @enum {string}
 */
export const patterncraftNames = [ "Patterncraft", "Struktur Verstehen" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * oldSpellcastingTalentNames options
 * @enum {string}
 */
export const versatilityTalentNames = [ "Versatility", "Vielseitigkeit" 
  // missing Translations thread weaving names 
  // polish
  // french];
];
  
/**
 * oldDamageAdderNames options
 * @enum {string}
 */
export const oldDamageAdderNames = [
  "Schmetterschlag",
  "Brandpfeil",
  "Sturmangriff",
  "Hammerschlag",
  "Krallenhand",
  "Körperkontrolle",
  "Überraschungsschlag",
  "Willensstärke",
  // missing Translations thread weaving names 
  // English
  // polish
  // french
];
  
/**
 * unarmedCombatNames options
 * @enum {string}
 */
export const unarmedCombatNames = [ "Unarmed Combat", "Waffenloser Kampf" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * meleeWeaponNames options
 * @enum {string}
 */
export const meleeWeaponNames = [ "Melee Weapons", "Nahkampfwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * missileWeaponNames options
 * @enum {string}
 */
export const missileWeaponNames = [ "Missile Weapons", "Projektilwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * throwingWeaponNames options
 * @enum {string}
 */
export const throwingWeaponNames = [ "Throwing Weapons", "Wurfwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
];
  
/**
 * physicalReactionNames options
 * @enum {string}
 */
export const physicalReactionNames = [ "Avoid Blow", "Riposte", "Hieb Ausweichen" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * mysticReactionNames options
 * @enum {string}
 */
export const mysticReactionNames = [ "Steel Thought", "Eiserner Wille" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * socialReactionNames options
 * @enum {string}
 */
export const socialReactionNames = [ "Resist Taunt", "Starrsinn" 
  // missing Translations thread weaving names 
  // polish
  // french];
];
  
/**
 * itemStatusMeleeWeapons options
 * @enum {string}
 */
export const itemStatusMeleeWeapons = [ "mainHand", "twoHands" ];

/**
 * itemStatusMissileWeapons options
 * @enum {string}
 */
export const itemStatusMissileWeapons = [ "twoHands" ];

/**
 * itemStatusThrowingWeapons options
 * @enum {string}
 */
export const itemStatusThrowingWeapons = [ "mainHand" ];

  
// took them over from draft branch, will use them later
// /**
//  * ammunitionArrowNames options
//  * @enum {string}
//  */
// export const ammunitionArrowNames = [ "Windlingspfeile", "Langbogenpfeile", "Kurzbogenpfeile", "Kriegsbogenpfeile"// missing Translations thread weaving names 
//   // English
//   // polish
//   // french
// ];

// /**
//  * ammunitionBoltNames options
//  * @enum {string}
//  */
// export const ammunitionBoltNames = [ "Mittlere Bolzen", "Leichte Bolzen"// missing Translations thread weaving names 
//   // English
//   // polish
//   // french
// ];
// /**
//  * ammunitionNeedleNames options
//  * @enum {string}
//  */
// export const ammunitionNeedleNames = [ "Schachtel mit 10 Nadeln"// missing Translations thread weaving names 
//   // English
//   // polish
//   // french
// ];
  