/**
 * System configuration for the migration of the system from Version 0.8.2 
 */
export const systemV0_8_2 = {
  /**
   * Migration key for earthdawn4e legacy system
   * @type {string}
   */
  legacySystemKey: "earthdawn4e-legacy",
  
  /**
   * Attributes options from the LaPorta System
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
   * Attribute values from the LaPorta System
   * @enum {string}
   */
  attributeValues: [
    "dexterityvalue",
    "strengthvalue",
    "toughnessvalue",
    "perceptionvalue",
    "willpowervalue",
    "charismavalue"
  ],

  /**
   * Damage attributes options from the LaPorta System
   * @enum {string}
   */
  damageAttributes: [
    "dexterity",
    "strength",
    "toughness",
    "perception",
    "willpower",
    "charisma",
  ],

  /**
   * Target Defense options from the LaPorta System
   * @enum {string}
   */
  targetDefense: [ "mysticaldefense", "physicaldefense", "socialdefense" ],

  /**
   * Group Difficulty options from the LaPorta System
   * @enum {string}
   */
  groupDifficulty: [ "defenseHigh", "defenseLow", "defenseHighPlus", "defenseLowPlus" ],

  /**
   * Weapon types from the LaPorta System
   * @enum {string}
   */
  weaponTypesMelee:   [ "melee", "secondweapon", "secondattack" ],
  weaponTypesMissile: [ "ranged", "secondshot" ],
  weaponTypesThrown:  [ "thrown" ],
  weaponTypesUnarmed: [ "unarmed", "swiftkick" ],

  /**
   * availability options from the LaPorta System
   * @enum {string}
   */
  availability: [
    [ "availabilityeveryday", "everyday" ],
    [ "availabilityaverage", "average" ],
    [ "availabilityunusual", "unusual" ],
    [ "availabilityrare", "rare" ],
    [ "availabilityveryrare", "veryrare" ],
  ],

  /**
   * Thread weaving naming options for automatic migration (will be slugified)
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
   * Thread weaving talent name for casters options
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
   * Spellcasting names options
   * @enum {string}
   */
  spellcastingNames: [ "Spellcasting", "Spruchzauberei" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * Patterncraft names options
   * @enum {string}
   */
  patterncraftNames: [ "Patterncraft", "Struktur Verstehen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * Versatility names options
   * @enum {string}
   */
  versatilityNames: [ "Versatility", "Vielseitigkeit" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],
  
  /**
   * Damage adder names options
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
   * Unarmed combat names options
   * @enum {string}
   */
  unarmedCombatNames: [ "Unarmed Combat", "Waffenloser Kampf" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * Melee weapon names options
   * @enum {string}
   */
  meleeWeaponNames: [ "Melee Weapons", "Nahkampfwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * Missile weapon names options
   * @enum {string}
   */
  missileWeaponNames: [ "Missile Weapons", "Projektilwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * Throwing weapon names options
   * @enum {string}
   */
  throwingWeaponNames: [ "Throwing Weapons", "Wurfwaffen" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],
  
  /**
   * Physical reaction names options
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
   * Resist knock down names options
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
   * Mystical reaction names options
   * @enum {string}
   */
  mysticReactionNames: [ "Steel Thought", "Eiserner Wille" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * Social reaction names options
   * @enum {string}
   */
  socialReactionNames: [ "Resist Taunt", "Starrsinn" 
  // missing Translations thread weaving names 
  // polish
  // french];
  ],

  /**
   * Off hand combat talent names options
   * @enum {string}
   */
  offHandCombatTalents: [ "Zweitwaffe", "Second Weapon" ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Artisan skill names 
   * @enum {string}
   */
  artisan:       [ "Kunsthandwerk", "Artisan" ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Knowledge skill names 
   * @enum {string}
   */
  knowledge:     [ "Wissen", "Knowledge" ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Read and write skill names 
   * @enum {string}
   */
  languageRW:    [ "Lesen und Schreiben", "Read and Write" ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Speak language skill names 
   * @enum {string}
   */
  languageSpeak: [ "Fremdsprachen", "Speak Language" ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * System ability names for Physical Defense
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
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * System ability names for Mystical Defense
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
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * System ability names for Social Defense
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
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * System ability names for highest group defenses 
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
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * System ability names for highest group defenses plus number of targets
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
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * System ability names for lowest group defenses 
   * @enum {string}
   */
  abilityGroupDefenseMinNames: [

  ],

  /**
   * System ability names for lowest group defenses plus number of targets
   * @enum {string}
   */
  abilityGroupDefenseMinNamesPlus: [

  ],

  /**
   * System ability names for durability Devotions
   * @enum {string}
   */
  durabilityNames: [
    "durability",
    "unempfindlichkeit",
  ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Item names for shields to set bow usage
   * @enum {string}
   */
  shieldBowUsageNames: [
    "Buckler",
    "Farnschild",
    "Kristallbuckler",
  ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Item names for bows
   * @enum {string}
   */
  bowNames: [
    "Kurzbogen",
    "Langbogen",
    "Windlingsbogen",
    "Elfischer Kriegsbogen",
  ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Item names for bows
   * @enum {string}
   */
  crossbowNames: [
    "Leichte Armbrust",
    "Mittlere Armbrust",
  ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Item names for bows
   * @enum {string}
   */
  blowgunNames: [
    "Blasrohr",
  ],
  // missing Translations thread weaving names 
  // polish
  // french];

  /**
   * Item names for bows
   * @enum {string}
   */
  slingNames: [
    "Schleuder",
    "Trollschleuder",
  ],
  // missing Translations thread weaving names 
  // polish
  // french];
};

