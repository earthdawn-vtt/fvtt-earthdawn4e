/**
 * system configuration for the migration of the system from Version 0.8.2 
 */
export const systemV0_8_2 = {
/**
 * attributes options from the LaPorta System
 * @enum {string}
 */
  attributes:
[ 
  "dexterityStep", 
  "strengthStep", 
  "toughnessStep", 
  "perceptionStep", 
  "willpowerStep", 
  "charismaStep", 
],
  /**
   * targetDefense options from the LaPorta System
   * @enum {string}
   */
  targetDefense: [ "mysticaldefense", "physicaldefense", "socialdefense" ],

  /**
   * GroupDifficulty options from the LaPorta System
   * @enum {string}
   */
  groupDifficulty: [ "defenseHigh", "defenseLow", "defenseHighPlus", "defenseLowPlus" ],

  /**
   * thread weaving naming options for automatic migration (will be slugified)
   * @enum {string}
   */
  threadWeavingNames: [
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
  ],

  /**
   * oldThreadWeavingTalentNameForCasters options
   * @enum {string}
   */
  threadWeavingNameForCasters: {
    elementalism: "Fadenweben (Elementarismus)",
    illusionism:  "Fadenweben (Illusionismus)",
    nethermancy:  "Fadenweben (Geisterbeschwörung)",
    shamanism:    "Fadenweben (Schamanismus)",
    wizardry:     "Fadenweben (Magie)",
  // missing Translations thread weaving names 
  // English
  // polish
  // french
  },

  /**
   * oldSpellcastingNames options
   * @enum {string}
   */
  spellcastingNames: [ "Spellcasting", "Spruchzauberei" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * oldSpellcastingNames options
   * @enum {string}
   */
  patterncraftNames: [ "Patterncraft", "Struktur Verstehen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * oldSpellcastingNames options
   * @enum {string}
   */
  versatilityNames: [ "Versatility", "Vielseitigkeit" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],
  
  /**
   * oldDamageAdderNames options
   * @enum {string}
   */
  damageAdderNames: [
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
  ],
  
  /**
   * unarmedCombatNames options
   * @enum {string}
   */
  unarmedCombatNames: [ "Unarmed Combat", "Waffenloser Kampf" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * meleeWeaponNames options
   * @enum {string}
   */
  meleeWeaponNames: [ "Melee Weapons", "Nahkampfwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * missileWeaponNames options
   * @enum {string}
   */
  missileWeaponNames: [ "Missile Weapons", "Projektilwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * throwingWeaponNames options
   * @enum {string}
   */
  throwingWeaponNames: [ "Throwing Weapons", "Wurfwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],
  
  /**
   * physicalReactionNames options
   * @enum {string}
   */
  physicalReactionNames: [ "Avoid Blow", "Riposte", "Hieb Ausweichen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * mysticReactionNames options
   * @enum {string}
   */
  mysticReactionNames: [ "Steel Thought", "Eiserner Wille" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * socialReactionNames options
   * @enum {string}
   */
  socialReactionNames: [ "Resist Taunt", "Starrsinn" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * oldSystemRollType options
   * @enum {string}
   */
  offHandCombatTalents: [ "Zweitwaffe", "Second Weapon" ],

};

