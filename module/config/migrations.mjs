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
  physicalReactionNames: [ 
    "Avoid Blow", 
    "Riposte", 
    "Hieb Ausweichen", 
    "Kunstreiten" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * physicalReactionNames options
   * @enum {string}
   */
  resistKnockDownNames: [ 
    "Sicherer Reitsitz", 
    "Standhaftigkeit",
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

  /**
   * old artisan skill names 
   * @enum {string}
   */
  artisan:       [ "Kunsthandwerk", "Artisan" ],

  /**
   * old knowledge skill names 
   * @enum {string}
   */
  knowledge:     [ "Wissen", "Knowledge" ],

  /**
   * old read and write skill names 
   * @enum {string}
   */
  languageRW:    [ "Lesen und Schreiben", "Read and Write" ],

  /**
   * old speak language skill names 
   * @enum {string}
   */
  languageSpeak: [ "Fremdsprachen", "Speak Language" ],

  /**
   * old system ability names for Physical Defense
   * @enum {string}
   */
  abilityPhysicalDefense: [
    "Abwehrkreis",
    "Akrobatische Verteidigung",
    "Blutige Krallen",
    "Entwaffnen",
    "Manövrieren",
    "Nachtreten",
    "Nahkampfwaffen",
    "Projektilewaffen",
    "Schwenkangriff",
    "schwungvoller Angriff",
    "Waffenloser kampf",
    "Wurfwaffen",
    "Zweiter Angriff",
    "Zweiter Schuss",
    "Zweitwaffe",
  ],

  /**
   * old system ability names for Mystical Defense
   * @enum {string}
   */
  abilityMysticalDefense: [
    "verspotten",
    "Astrale Interferenz",
    "Artefaktgeschichte",
    "Beweisanalyse",
    "Doppelter Sturmangriff",
    "Elementarbann",
    "Erdhaut",
    "Gedankenkette",
    "Geisterbann",
    "Geistersprache",
    "Gezielter Querschläger",
    "kampfsinn",
    "Lebensblick",
    "magische Markierung",
    "mentale Tierkontrolle",
    "reittier panzern",
    "Schwachstelle Erkennen",
    "Tieranalyse",
    "Tiere Bändigen",
    "Tiergefährten Rufen",
    "Tiergefährten Verbessern",
    "Tierische Sinne",
    "Tiersprache",
    "Verängstigen",
    "Verbannen",
    "Wispern",
  ],

  /**
   * old system ability names for Social Defense
   * @enum {string}
   */
  abilitySocialDefense: [
    "Ablenken",
    "Abrichten",
    "Andere Inspirieren",
    "arkanes Gefasel",
    "Bannmarkierung",
    "Beeindrucken",
    "Bleibender Eindruck",
    "Diplomatie",
    "Eleganter Abgang",
    "Empatische Wahrnehmung",
    "Erster Eindruck",
    "Feilschen",
    "Führung",
    "Furchterregender Sturmangriff",
    "Gefühlsmelodie",
    "Gewinnendes Lächeln",
    "Herzliches Lachen",
    "hypnotisieren",
    "Kampfgebrüll",
    "Konversation",
    "Schlachtruf",
    "Schuld Abwälzen",
    "Stählender Blick",
    "Taktik",
    "Tierfreundschaft",
    "Verspotten",
    "Wortgeplänkel",
    "Flirten",
    "Gassenwissen",
    "Schauspielerei",
    "Tierbeherrschung",
    "Unterhaltung",
    "Verführen",
  ],

  /**
   * old system ability names for highest group defenses 
   * @enum {string}
   */
  abilityGroupDefenseMaxNames: [
    "Eleganter Abgang",
    "Führung",
    "Gefühlsmelodie",
    "Herzliches Lachen",
    "Lebensblick",
    "Schauspielerei",
    "Unterhaltung",
  ],

  /**
   * old system ability names for highest group defenses plus number of targets
   * @enum {string}
   */
  abilityGroupDefenseMaxNamesPlus: [
    "Akrobatische Verteidigung",
    "Andere Inspirieren",
    "arkanes Gefasel",
    "Konversation",
    "Schlachtruf",
    "Schuld Abwälzen",
    "Gassenwissen",
    "Tierbeherrschung",
  ],

  /**
   * old system ability names for lowest group defenses 
   * @enum {string}
   */
  abilityGroupDefenseMinNames: [

  ],

  /**
   * old system ability names for lowest group defenses plus number of targets
   * @enum {string}
   */
  abilityGroupDefenseMinNamesPlus: [

  ],

  /**
   * old system ability names for durability Devotions
   * @enum {string}
   */
  durabilityNames: [
    "durability",
    "unempfindlichkeit",
  ],
};

