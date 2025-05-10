/**
 * Old system configuration
 */
export const previousSystem = {
/**
 * attributes options from the LaPorta System
 * @enum {string}
 */
  attributes:
[ 
  "", 
  "dexterityStep", 
  "strengthStep", 
  "toughnessStep", 
  "perceptionStep", 
  "willpowerStep", 
  "charismaStep", 
  "initiativeStep" 
],
  /**
   * targetDefense options from the LaPorta System
   * @enum {string}
   */
  targetDefense: [ "", "physicaldefense", "mysticaldefense", "socialdefense" ],

  /**
   * GroupDifficulty options from the LaPorta System
   * @enum {string}
   */
  groupDifficulty: [ "", "defenseLow", "defenseLowPlus", "defenseHigh", "defenseHighPlus" ],

};

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
 * newTargetDefense options
 * @enum {string}
 */
export const newTargetDefense = [ "", "physical", "mystical", "social" ];

/**
 * newGroupDifficulty options
 * @enum {string}
 */
export const newGroupDifficulty = [ "", "lowestOfGroup", "lowestX", "highestOfGroup", "highestX" ];

/**
 * thread weaving naming options for automatic migration (will be slugified)
 * @enum {string}
 */
export const threadWeavingNames = [
  "Beschützerweben",
  "Diebweben",
  "Elementarismus",
  "Fadenschmieden",
  "Flussweben",
  "Geisterbeschwörung",
  "Geschichtenweben",
  "Himmelsweben",
  "Illusionismus",
  "Kriegsweben",
  "Kundschafterweben",
  "Luftweben",
  "Magie",
  "Meeresweben",
  "Pfeilweben",
  "Reiterweben",
  "Schamanismus",
  "Tierweben",
  "Waffenweben",
  "Fadenweben",
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
export const threadWeavingNameForCasters = {
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
 * oldSpellcastingNames options
 * @enum {string}
 */
export const spellcastingNames = [ "Spellcasting", "Spruchzauberei" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * oldSpellcastingNames options
 * @enum {string}
 */
export const patterncraftNames = [ "Patterncraft", "Struktur Verstehen" 
  // missing Translations thread weaving names 
  // polish
  // french];
];

/**
 * oldSpellcastingNames options
 * @enum {string}
 */
export const versatilityNames = [ "Versatility", "Vielseitigkeit" 
  // missing Translations thread weaving names 
  // polish
  // french];
];
  
/**
 * oldDamageAdderNames options
 * @enum {string}
 */
export const damageAdderNames = [
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
 * oldSystemRollType options
 * @enum {string}
 */
export const offHandCombatTalents = [ "Zweitwaffe", "Second Weapon" ];