import { preLocalize } from "./utils.mjs";

// Namespace Configuration Values
const ED4E = {};

ED4E.ASCII = `_______________________________
________  _____       _____ _______
|  _____| |    \     / _  | |  ____|
|  |____  | |\  \   / / | | |  |___
|  _____| | | |  | |  |_| | |   ___|
|  |____  | |/  /  |___   | |  |___
|_______| |___/        |  | |______|
_______________________________`;

/**
 * @description The grouping for the document creation dialogues in from the sidebar.
 */
ED4E.typeGroups = {
  Item: {
    Equipment:    [ "armor", "equipment", "shield", "weapon" ],
    Powers:       [ "attack", "maneuver", "power" ],
    Abilities:    [ "devotion", "knackAbility", "knackManeuver","knackKarma", "skill", "specialAbility", "talent" ],
    Conditions:   [ "cursemark", "effect", "poisonDisease" ],
    Magic:        [ "spell", "spellKnack", "bindingSecret", "matrix" ],
    Classes:      [ "discipline", "path", "questor" ],
    Other:        [ "mask", "namegiver", "shipWeapon" ]
  },
  Actor: {
    Namegivers:   [ "character", "npc" ],
    Creatures:    [ "creature", "spirit", "horror", "dragon" ],
    Other:        [ "group", "vehicle", "trap", "loot" ]
  }
};

/**
 * Configuration data for abilities.
 * @typedef {object} AttributeConfiguration
 * @property {string} label                               Localized label.
 * @property {string} abbreviation                        Localized abbreviation.
 * @property {{[key: string]: number|string}}  [defaults]  Default values for this Attribute based on actor type.
 *                                                        If a string is used, the system will attempt to fetch.
 *                                                        the value of the specified Attribute.
 */

/**
 * The set of Attribute Scores used within the system.
 * @enum {AttributeConfiguration}
 */
ED4E.attributes = {
  dex: {
    label:          "ED.Actor.Attributes.dexterity",
    abbreviation:   "ED.Actor.Attributes.dexterityAbbr"
  },
  str: {
    label:          "ED.Actor.Attributes.strength",
    abbreviation:   "ED.Actor.Attributes.strengthAbbr"
  },
  tou: {
    label:          "ED.Actor.Attributes.toughness",
    abbreviation:   "ED.Actor.Attributes.toughnessAbbr"
  },
  per: {
    label:          "ED.Actor.Attributes.perception",
    abbreviation:   "ED.Actor.Attributes.perceptionAbbr"
  },
  wil: {
    label:          "ED.Actor.Attributes.willpower",
    abbreviation:   "ED.Actor.Attributes.willpowerAbbr"
  },
  cha: {
    label:          "ED.Actor.Attributes.charisma",
    abbreviation:   "ED.Actor.Attributes.charismaAbbr"
  }
};
preLocalize( "attributes", {keys: [ "label", "abbreviation" ]} );

/**
 * configuration data for Global Bonuses
 * @typedef {object} GlobalBonusConfiguration
 * @property {string} label                               Localized label.
 * @property {{[key: string]: number|string}} [defaults]  Default values for this Attribute based on actor type.
 */

/**
 * @description the global bonus configurations
 * @enum { GlobalBonusConfiguration }
 */
ED4E.globalBonuses = {
  allAttacks: {
    label:       "ED.Actor.GlobalBonus.allAttacks"
  },
  allEffects: {
    label:       "ED.Actor.GlobalBonus.allEffects"
  },
  allActions: {
    label:       "ED.Actor.GlobalBonus.allActions"
  },
  allRangedAttacks: {
    label:       "ED.Actor.GlobalBonus.allRangedAttacks"
  },
  allCloseAttacks: {
    label:       "ED.Actor.GlobalBonus.allCloseAttacks"
  },
  allSpellcasting: {
    label:       "ED.Actor.GlobalBonus.allSpellcasting"
  },
  allDamage: {
    label:       "ED.Actor.GlobalBonus.allDamage"
  },
  allMeleeDamage: {
    label:       "ED.Actor.GlobalBonus.allMeleeDamage"
  },
  allRangedDamage: {
    label:       "ED.Actor.GlobalBonus.allRangedDamage"
  },
  allRecoveryEffects: {
    label:       "ED.Actor.GlobalBonus.allRecoveryEffects"
  },
  allKnockdownEffects: {
    label:       "ED.Actor.GlobalBonus.allKnockDownEffects"
  },
  allSpellEffects: {
    label:       "ED.Actor.GlobalBonus.allSpellEffects"
  }
};
preLocalize( "globalBonuses", {key: "label"} );



/**
 * Denomination options
 * @enum {string}
 */
ED4E.curseType = {
  minor:       "ED.Config.curseType.minor",
  major:       "ED.Config.curseType.major",
  horror:      "ED.Config.curseType.horror"
};
preLocalize( "curseType" );

/**
 * Denomination options
 * @enum {string}
 */
ED4E.denomination = {
  copper:       "ED.Config.Denomination.copper",
  silver:       "ED.Config.Denomination.silver",
  gold:         "ED.Config.Denomination.gold"
};
preLocalize( "denomination" );

/**
 * Availability
 * @enum {string}
 */
ED4E.availability = {
  everyday:       "ED.Config.Availability.everyday",
  average:         "ED.Config.Availability.average",
  unusual:         "ED.Config.Availability.unusual",
  rare:           "ED.Config.Availability.rare",
  veryRare:       "ED.Config.Availability.veryRare",
  unique:         "ED.Config.Availability.unique"
};
preLocalize( "availability" );

/**
 * Actions
 * @enum {string}
 */
ED4E.action = {
  free:         "ED.Config.Action.free",
  simple:       "ED.Config.Action.simple",
  standard:     "ED.Config.Action.standard",
  sustained:    "ED.Config.Action.sustained",
};
preLocalize( "action" );

/**
 * RecoveryProperty
 * @enum {string}
 */
ED4E.recoveryProperty = {
  0:           "ED.Config.RecoveryProperty.noRecovery",
  1:           "ED.Config.RecoveryProperty.arbitrary",
  2:           "ED.Config.RecoveryProperty.arbitraryAndAttribute",
  3:           "ED.Config.RecoveryProperty.arbitraryOptionalAttribute",
  4:           "ED.Config.RecoveryProperty.abilityStep",
  5:           "ED.Config.RecoveryProperty.noHealing",
};
preLocalize( "recoveryProperty" );

/**
 * Target Difficulty
 * @enum {string}
 */
ED4E.targetDifficulty = {
  mystical:   "ED.Config.Defenses.mystical",
  physical:   "ED.Config.Defenses.physical",
  social:     "ED.Config.Defenses.social",
};
preLocalize( "targetDifficulty" );

/**
 * activation Types of Poisons and Diseases
 * @enum {string}
 */
ED4E.poisonActivation = {
  contact:        "ED.Config.PoisonActivation.contact",
  ingested:       "ED.Config.PoisonActivation.ingested",
  inhaled:        "ED.Config.PoisonActivation.inhaled",
  injury:         "ED.Config.PoisonActivation.injury",
  wound:          "ED.Config.PoisonActivation.wound",
};
preLocalize( "poisonActivation" );

/**
 * Different types of Illusions
 * @enum {string}
 */
ED4E.illusionType = {
  "figment":      "ED.Config.IllusionType.figment",
  "glamour":      "ED.Config.IllusionType.glamour",
  "illusion":     "ED.Config.IllusionType.illusion",
  "phantasm":     "ED.Config.IllusionType.phantasm",
  "shadow":       "ED.Config.IllusionType.shadow",
};
preLocalize( "illusionType" );

/**
 * Group  Difficulty
 * @enum {string}
 */
ED4E.groupDifficulty = {
  highestOfGroup:   "ED.Config.Defenses.highestOfGroup",
  lowestOfGroup:    "ED.Config.Defenses.lowestOfGroup",
  highestX:         "ED.Config.Defenses.highestX",
  lowestX:          "ED.Config.Defenses.lowestX"
};
preLocalize( "groupDifficulty" );

/**
 * Armor
 * @enum {string}
 */
ED4E.armor = {
  physical:   "ED.Armor.physical",
  mystical:   "ED.Armor.mystical",
};
preLocalize( "armor" );

/**
 * WeaponType
 * @enum {string}
 */
ED4E.weaponType = {
  melee:          {
    label:      "ED.Config.WeaponType.melee",
    ranged:     false,
  },
  missile:        {
    label:      "ED.Config.WeaponType.missile",
    ranged:     true,
  },
  thrown:         {
    label:      "ED.Config.WeaponType.thrown",
    ranged:     true,
  },  
  unarmed:        { 
    label:      "ED.Config.WeaponType.unarmed",
    ranged:     false,
  },
};
preLocalize( "weaponType", { key: "label" } );

ED4E.weaponSubType = {
  bow: {
    label:      "ED.Config.WeaponSubType.bow",
    weaponType: "missile",
  },
  crossbow: {
    label:      "ED.Config.WeaponSubType.crossbow",
    weaponType: "missile",
  },
};

/**
 * The way a weapon has to be equipped to wield it.
 * @enum {string}
 */
ED4E.weaponWieldingType = {
  mainHand:   "ED.Config.ItemStatus.mainHand",
  offHand:    "ED.Config.ItemStatus.offHand",
  twoHands:   "ED.Config.ItemStatus.twoHands",
  tail:       "ED.Config.ItemStatus.tail",
};
preLocalize( "weaponWieldingType" );

/**
 * Damage type
 * @enum {string}
 */
ED4E.damageType = {
  standard:   "ED.Health.Damage.standard",
  stun:       "ED.Health.Damage.stun",
};
preLocalize( "damageType" );

/**
 * Damage resistances
 * @enum {string}
 */
ED4E.resistances = {
  fire:       "ED.Config.Resistances.fire",
};
preLocalize( "resistances" );

/**
 * Damage vulnerabilities
 * @enum {string}
 */
ED4E.vulnerabilities = {
  fire:       "ED.Config.Vulnerabilities.fire",
};
preLocalize( "vulnerabilities" );

/**
 * The possible states for a physical item that describe in which way they connect to an actor.
 * @enum {string}
 */
ED4E.itemStatus = {
  owned:      "ED.Config.ItemStatus.owned",
  carried:    "ED.Config.ItemStatus.carried",
  equipped:   "ED.Config.ItemStatus.equipped",
  mainHand:   "ED.Config.ItemStatus.mainHand",
  offHand:    "ED.Config.ItemStatus.offHand",
  twoHands:   "ED.Config.ItemStatus.twoHands",
  tail:       "ED.Config.ItemStatus.tail",
};
preLocalize( "itemStatus" );

ED4E.languages = {
  dwarf:        "ED.Languages.dwarf",
  elf:          "ED.Languages.elf",
  human:        "ED.Languages.human",
  obsidiman:    "ED.Languages.obsidiman",
  ork:          "ED.Languages.ork",
  troll:        "ED.Languages.troll",
  tskrang:      "ED.Languages.tskrang",
  windling:     "ED.Languages.windling",
};
preLocalize( "languages" );

ED4E.spellcastingTypes = {
  elementalism:   "ED.Config.spellcastingTypes.elementalism",
  illusionism:    "ED.Config.spellcastingTypes.illusionism",
  nethermancy:    "ED.Config.spellcastingTypes.nethermancy",
  shamanism:      "ED.Config.spellcastingTypes.shamanism",
  wizardry:       "ED.Config.spellcastingTypes.wizardry",
};
preLocalize( "spellcastingTypes" );

ED4E.spellKeywords = {
  binding:        "ED.Config.SpellKeywords.binding",
  concentration:  "ED.Config.SpellKeywords.concentration",
  fate:           "ED.Config.SpellKeywords.fate",
  figment:        "ED.Config.SpellKeywords.figment",
  illusion:       "ED.Config.SpellKeywords.illusion",
  pack:           "ED.Config.SpellKeywords.pack",
  spirit:         "ED.Config.SpellKeywords.spirit",
  summon:         "ED.Config.SpellKeywords.summon",
};
preLocalize( "spellKeywords" );

ED4E.elements = {
  air:        "ED.Config.Elements.air",
  earth:      "ED.Config.Elements.earth",
  fire:       "ED.Config.Elements.fire",
  water:      "ED.Config.Elements.water",
  wood:       "ED.Config.Elements.wood",
};
preLocalize( "elements" );

ED4E.elementSubtypes = {
  air: {
    electric:   "ED.Config.Elements.airElectric",
  },
  earth: {
    metal:      "ED.Config.Elements.earthMetal",
  },
  fire:  {},
  water: {
    acid:       "ED.Config.Elements.waterAcid",
    cold:       "ED.Config.Elements.waterCold",
  },
  wood: {},
};
preLocalize(
  "elementSubtypes",
  { keys: [ "air", "earth", "fire", "water", "wood" ] }
);

ED4E.spellEnhancements = {
  area: {
    label:         "ED.Config.SpellEnhancements.area",
    inputTemplate: "systems/ed4e/templates/form/input/area-metric.hbs",
    unitConfig:    "movementUnits",
  },
  duration: {
    label:         "ED.Config.SpellEnhancements.duration",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "scalarTimePeriods",
  },
  effect: {
    label:         "ED.Config.SpellEnhancements.effect",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "",
  },
  range: {
    label:         "ED.Config.SpellEnhancements.range",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "movementUnits",
  },
  section: {
    label:         "ED.Config.SpellEnhancements.section",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "",
  },
  special: {
    label:         "ED.Config.SpellEnhancements.special",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "",
  },
  target: {
    label:         "ED.Config.SpellEnhancements.target",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "",
  },
};
preLocalize( "spellEnhancements", { key: "label", sort: true } );


/* -------------------------------------------- */
/*  Active Effects                              */
/* -------------------------------------------- */

ED4E.singleBonuses = {
  knockdownEffects: "ED.Config.Eae.allKnockDownEffects",
};
preLocalize( "singleBonuses" );

/**
 * @enum {string}
 */
ED4E.eaeTargetChoices = {
  self:     "ED.Config.EaeTargetChoices.self",
  target:   "ED.Config.EaeTargetChoices.target",
};
preLocalize( "eaeTargetChoices" );


/* -------------------------------------------- */
/*  Advancement & Char Gen                      */
/* -------------------------------------------- */

ED4E.attributePointsCost = [ 0, 1, 2, 3, 5, 7, 9, 12, 15 ];
ED4E.attributePointsCost[-1] = -1;
ED4E.attributePointsCost[-2] = -2;
ED4E.disciplineTeacherCost = [ 0, 100, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3500, 5000, 7500, 10000, 15000, 20000 ];
ED4E.legendPointsCost = [ 0, 100, 200, 300, 500, 800, 1300, 2100, 3400, 5500, 8900, 14400, 23300, 37700, 61000, 98700, 159700, 258400, 418100 ];

/**
 * The cost of learning a new talent for additional disciplines. The first index is the order of the corresponding
 * discipline (with 0 and 1 undefined). The second index is the lowest circle attained between all disciplines.
 * @type {number[][]}
 */
ED4E.multiDisciplineNewTalentLpCost = [
  [],
  [],
  [ 0, 1300, 800, 500, 300, 200 ], // Second Discipline
  [ 0, 2100, 1300, 800, 500, 300 ], // Third Discipline
  [ 0, 3400, 2100, 1300, 800, 500 ], // Fourth+ Discipline
];

/**
 * The modifier for the lookup table {@link ED4E.legendPointsCost} based on the tier. Each tier starts at the next value
 * in the fibonacci (lp cost) sequence. The first index is the order of the corresponding discipline (with 0
 * being undefined). The key is the tier.
 * @type {[{}|{ novice: number, journeyman: number, warden: number, master: number }]}
 */
ED4E.lpIndexModForTier = [
  {},
  { novice: 0, journeyman: 1, warden: 2, master: 3, },  // First Discipline
  { novice: 1, journeyman: 2, warden: 3, master: 4, }, // Second Discipline
  { novice: 2,  journeyman: 3, warden: 4, master: 5, }, // Third Discipline
  { novice: 3, journeyman: 4, warden: 5, master: 6, }, // Fourth+ Discipline
];

ED4E.lpSpendingTypes = {
  attribute:        "X.Attribute",
  devotion:         "X.devotion",
  knack:            "X.knack",
  knackManeuver:    "X.knackManeuver",
  skill:            "X.skill",
  spell:            "X.spell",
  spellKnack:       "X.spellKnack",
  talent:           "X.talent",
  thread:           "X.thread",
};
preLocalize( "lpSpendingTypes" );

/**
 * Tier
 * @enum {string}
 */
ED4E.tier = {
  novice:       "ED.Config.Tier.novice",
  journeyman:   "ED.Config.Tier.journeyman",
  warden:       "ED.Config.Tier.warden",
  master:       "ED.Config.Tier.master"
};
preLocalize( "tier" );

ED4E.levelTierMapping = {
  discipline: {
    1:  "novice",
    2:  "novice",
    3:  "novice",
    4:  "novice",
    5:  "journeyman",
    6:  "journeyman",
    7:  "journeyman",
    8:  "journeyman",
    9:  "warden",
    10: "warden",
    11: "warden",
    12: "warden",
    13: "master",
    14: "master",
    15: "master",
  },
  path:       {
    1:  "journeyman",
    2:  "journeyman",
    3:  "journeyman",
    4:  "journeyman",
    5:  "warden",
    6:  "warden",
    7:  "warden",
    8:  "warden",
    9:  "master",
    10: "master",
    11: "master",
    12: "master",
  },
  questor:    {
    1:  "follower",
    2:  "follower",
    3:  "follower",
    4:  "follower",
    5:  "adherent",
    6:  "adherent",
    7:  "adherent",
    8:  "adherent",
    9:  "exemplar",
    10: "exemplar",
    11: "exemplar",
    12: "exemplar",
  },
};

/**
 * talentCategory
 * @enum {string}
 */
ED4E.talentCategory = {
  discipline:     "ED.Config.talentCategory.discipline",
  optional:       "ED.Config.talentCategory.optional",
  free:           "ED.Config.talentCategory.free",
  versatility:    "ED.Config.talentCategory.versatility"
};
preLocalize( "talentCategory" );

/**
 * ammunitionType
 * @enum {string}
 */
ED4E.ammunitionType = {
  arrow:           "ED.Config.AmmunitionType.arrow",
  bolt:           "ED.Config.AmmunitionType.bolt",
  needle:         "ED.Config.AmmunitionType.needle",
  stone:           "ED.Config.AmmunitionType.stone",
};
preLocalize( "ammunitionType" );

/**
 * Type of grantable abilities for a class level
 * @enum {string}
 */
ED4E.abilityPools = {
  class:      "ED.Advancement.Pools.class",
  free:       "ED.Advancement.Pools.free",
  special:    "ED.Advancement.Pools.special"
};
preLocalize( "abilityPools" );

/**
 * Types of skills.
 * @enum {string}
 */
ED4E.skillTypes = {
  general:      "ED.Config.Skills.general",
  artisan:      "ED.Config.Skills.artisan",
  knowledge:    "ED.Config.Skills.knowledge",
};
preLocalize( "skillTypes" );

/**
 * The rules for increasing attributes.
 * @enum {string}
 */
ED4E.attributeIncreaseRules = {
  spendLp:          "ED.Settings.LpTracking.spendLp",
  spendLpPerCircle: "ED.Settings.LpTracking.spendLpPerCircle",
  freePerCircle:    "ED.Settings.LpTracking.freePerCircle"
};
preLocalize( "attributeIncreaseRules" );

/**
 * Lookup table used during character generation based on attribute values.
 * @type {{defenseRating: number[], unconsciousRating: number[], carryingCapacity: number[], armor: number[], deathRating: number[], step: number[], woundThreshold: number[], recovery: number[]}}
 */
ED4E.characteristicsTable = {
  step:              [ 0, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11 ],
  defenseRating:     [ 0, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16 ],
  carryingCapacity:  [ 0, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 95, 110, 125, 140, 155, 175, 195, 215, 235, 255, 280, 305, 330, 355, 380, 410, 440, 470, 500, 530 ],
  unconsciousRating: [ 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60 ],
  deathRating:       [ 0, 4, 6, 8, 11, 13, 15, 18, 20, 22, 25, 27, 29, 32, 34, 36, 39, 41, 43, 46, 48, 50, 53, 55, 57, 60, 62, 64, 67, 69, 71 ],
  woundThreshold:    [ 0, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17 ],
  recovery:          [ 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, ],
  armor:             [ 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6 ],
};

ED4E.availableRanks = {
  talent:    8,
  devotion:  1,
  knowledge: 2,
  artisan:   1,
  general:   8,
  speak:     2,
  readWrite: 1,
};

ED4E.spellCostRules = {
  noviceTalent: "ED.Settings.LpTracking.noviceTalent",
  circleX100:   "ED.Settings.LpTracking.circleX100",
  free:         "ED.Settings.LpTracking.free",
};
preLocalize( "spellCostRules" );

ED4E.circleTalentRequirements = {
  disciplineTalents:   "ED.Settings.LpTracking.disciplineTalents",
  allTalents:          "ED.Settings.LpTracking.allTalents",
  allTalentsHouseRule: "ED.Settings.LpTracking.allTalentsHouseRule"
};
preLocalize( "circleTalentRequirements" );

ED4E.validationCategories = {
  base:               "ED.Config.LpTracking.Validation.titleBase",
  health:             "ED.Config.LpTracking.Validation.titleHealth",
  resources:          "ED.Config.LpTracking.Validation.titleResources",
  talentsRequirement: "ED.Config.LpTracking.Validation.titleTalentsRequirement",
  newAbilityLp:       "ED.Config.LpTracking.Validation.titleNewAbilityLp",
};
preLocalize( "validationCategories" );

/* -------------------------------------------- */
/*  Encumbrance                                 */
/* -------------------------------------------- */

/**
 * The possible statuses of encumbrance
 * @enum {string}
 */
ED4E.encumbranceStatus = {
  notEncumbered:    "ED.Conditions.Encumbrance.notEncumbered",
  light:            "ED.Conditions.Encumbrance.light",
  heavy:            "ED.Conditions.Encumbrance.heavy",
  tooHeavy:         "ED.Conditions.Encumbrance.tooHeavy"
};
preLocalize( "encumbranceStatus" );


/* -------------------------------------------- */
/*  Rolls and Tests                             */
/* -------------------------------------------- */

/**
 * The minimum difficulty for any test.
 * @type {number}
 */
ED4E.minDifficulty = 2;

/**
 * The available types of (roll) tests for {@link EdRollOptions}.
 * @enum {string}
 */
ED4E.testTypes = {
  arbitrary: {
    label:            "ED.Rolls.Labels.arbitraryTestRoll",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/arbitrary-roll-flavor.hbs",
  },
  action: {
    label:            "ED.Rolls.Labels.actionTestRoll",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/ability-roll-flavor.hbs",
  },
  effect: {
    label:            "ED.Rolls.Labels.effectTestRoll",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/effect-roll-flavor.hbs",
  },
};
preLocalize( "testTypes", { key: "label" } );


/**
 * The available sub-types of (roll) tests for {@link EdRollOptions}.
 * @enum {string}
 */
ED4E.rollTypes = {
  ability: {
    label:            "ED.Config.rollTypes.ability",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/ability-roll-flavor.hbs",
  },
  attack: {
    label:            "ED.Config.rollTypes.attack",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  attribute: {
    label:            "ED.Config.rollTypes.attribute",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attribute-roll-flavor.hbs",
  },
  damage: {
    label:            "ED.Rolls.Labels.damageRoll",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/damage-roll-flavor.hbs",
  },
  effect: {
    label:            "ED.Config.rollTypes.effect",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/effect-roll-flavor.hbs",
  },
  halfmagic: {
    label:            "ED.Config.rollTypes.halfmagic",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/halfmagic-roll-flavor.hbs",
  },
  initiative: {
    label:            "ED.Config.rollTypes.initiative",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/initiative-roll-flavor.hbs",
  },
  reaction: {
    label:            "ED.Config.rollTypes.reaction",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/reaction-roll-flavor.hbs",
  },
  recovery: {
    label:            "ED.Config.rollTypes.recovery",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/recovery-roll-flavor.hbs",
  },
  spellcasting: {
    label:            "ED.Config.rollTypes.spellcasting",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/spellcasting-roll-flavor.hbs",
  },
  threadWeaving: {
    label:            "ED.Config.rollTypes.threadWeaving",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/threadWeaving-roll-flavor.hbs",
  },
};
preLocalize( "testTypes", { key: "label" } );

/**
 * The available sub-types of (combatTypes) tests
 * @enum {string}
 */
ED4E.combatTypes = {
  Aerial: {
    label:            "ED.Config.combatTypes.Aerial",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  Close: {
    label:            "ED.Config.combatTypes.Close",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  melee: {
    label:            "ED.Config.combatTypes.melee",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  mounted: {
    label:            "ED.Config.combatTypes.mounted",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  projectile: {
    label:            "ED.Config.combatTypes.projectile",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  ranged: {
    label:            "ED.Config.combatTypes.ranged",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  throwing: {
    label:            "ED.Config.combatTypes.throwing",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  unarmed: {
    label:            "ED.Config.combatTypes.unarmed",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
};
preLocalize( "testTypes", { key: "label" } );

ED4E.resourceDefaultStep = {
  karma:    4,
  devotion: 3,
};


/* -------------------------------------------- */
/*  System                                      */
/* -------------------------------------------- */

/**
 * Reserved earthdawn ids.
 * @enum {string}
 */
ED4E.reserved_edid = {
  DEFAULT:    "none",
  ANY:        "any",
};

ED4E.formulaValueTypes = {
  attribute:  "ED.Config.FormulaValueTypes.attribute",
  circle:     "ED.Config.FormulaValueTypes.circle",
  numeric:    "ED.Config.FormulaValueTypes.numeric",
  rank:       "ED.Config.FormulaValueTypes.rank",
  special:    "ED.Config.FormulaValueTypes.special",
};

/**
 * Time periods that accept a numeric value.
 * @enum {string}
 */
ED4E.scalarTimePeriods = {
  turn:   "ED.Config.ScalarTimePeriods.turn",
  round:  "ED.Config.ScalarTimePeriods.round",
  minute: "ED.Config.ScalarTimePeriods.minute",
  hour:   "ED.Config.ScalarTimePeriods.hour",
  day:    "ED.Config.ScalarTimePeriods.day",
  week:   "ED.Config.ScalarTimePeriods.week",
  month:  "ED.Config.ScalarTimePeriods.month",
  year:   "ED.Config.ScalarTimePeriods.year"
};
preLocalize( "scalarTimePeriods" );

/**
 * Time periods for spells that don't have a defined ending.
 * @enum {string}
 */
ED4E.permanentTimePeriods = {
  perm: "ED.Config.PermanentTimePeriods.perm"
};
preLocalize( "permanentTimePeriods" );

/* -------------------------------------------- */

/**
 * Time periods that don't accept a numeric value.
 * @enum {string}
 */
ED4E.specialTimePeriods = {
  inst: "ED.Config.SpecialTimePeriods.inst",
  spec: "ED.Config.SpecialTimePeriods.special"
};
preLocalize( "specialTimePeriods" );

/* -------------------------------------------- */

/**
 * The various lengths of time over which effects can occur.
 * @enum {string}
 */
ED4E.timePeriods = {
  ...ED4E.specialTimePeriods,
  ...ED4E.permanentTimePeriods,
  ...ED4E.scalarTimePeriods
};
preLocalize( "timePeriods" );

/* -------------------------------------------- */

/**
 * The various types of movement of moving entities.
 * @enum {string}
 */
ED4E.movementTypes = {
  burrow: "ED.Config.MovementTypes.burrow",
  climb:  "ED.Config.MovementTypes.Climb",
  fly:    "ED.Config.MovementTypes.Fly",
  swim:   "ED.Config.MovementTypes.Swim",
  walk:   "ED.Config.MovementTypes.Walk"
};
preLocalize( "movementTypes", { sort: true } );

/* -------------------------------------------- */

/**
 * The valid units of measure for movement distances in the game system.
 * By default, this uses the imperial units of feet and miles.
 * @enum {string}
 */
ED4E.movementUnits = {
  in: "ED.Config.MovementUnits.inch",
  ft: "ED.Config.MovementUnits.feet",
  yd: "ED.Config.MovementUnits.yard",
  mi: "ED.Config.MovementUnits.mile",
};
preLocalize( "movementUnits" );

/* -------------------------------------------- */

/**
 * The types of range that are used for measuring actions and effects.
 * @enum {string}
 */
ED4E.rangeTypes = {
  self:  "ED.Config.RangeTypes.self",
  touch: "ED.Config.RangeTypes.touch",
  spec:  "ED.Config.RangeTypes.special",
  any:   "ED.Config.RangeTypes.any",
};
preLocalize( "rangeTypes" );

/* -------------------------------------------- */

/**
 * The valid units of measure for the range of an action or effect. A combination of {@link ED4E.movementUnits}
 * and {@link ED4E.rangeTypes}.
 * @enum {string}
 */
ED4E.distanceUnits = {
  ...ED4E.movementUnits,
  ...ED4E.rangeTypes,
};
preLocalize( "distanceUnits" );

/* -------------------------------------------- */

/**
 * Information needed to represent different area of effect target types.
 * @typedef {object} AreaTargetDefinition
 * @property {string} label        Localize(d) label for this type.
 * @property {string} template     Type of `MeasuredTemplate` create for this target type.
 * @property {string} [reference]  Reference to a rule page describing this area of effect.
 * @property {string[]} [sizes]    List of available sizes for this template. Options are chosen from the list: "angle",
 *                                 "radius", "width", "height", "length", "thickness". No more than 3 dimensions may
 *                                 be specified.
 */

/**
 * Types for effects that cover an area.
 * @enum {AreaTargetDefinition}
 */
ED4E.areaTargetDefinition = {
  circle:   {
    label:    "ED.Config.AreaTargets.circle",
    template: "circle",
    sizes:    [ "radius" ],
  },
  cone:     {
    label:    "ED.Config.AreaTargets.cone",
    template: "cone",
    sizes:    [ "angle", "radius" ],
  },
  cube:     {
    label:    "ED.Config.AreaTargets.cube",
    template: "rect",
    sizes:    [ "width" ],
  },
  cylinder: {
    label:    "ED.Config.AreaTargets.cylinder",
    template: "circle",
    sizes:    [ "radius", "height" ],
  },
  line:     {
    label:    "ED.Config.AreaTargets.line",
    template: "ray",
    sizes:    [ "length", "width" ],
  },
  radius:   {
    label:    "ED.Config.AreaTargets.radius",
    template: "circle",
  },
  sphere:   {
    label:    "ED.Config.AreaTargets.sphere",
    template: "circle",
    sizes:    [ "radius" ],
  },
  square:   {
    label:    "ED.Config.AreaTargets.square",
    template: "rect",
    sizes:    [ "width" ],
  },
  wall:     {
    label:    "ED.Config.AreaTargets.wall",
    template: "ray",
    sizes:    [ "length", "thickness", "height" ],
  },
};
preLocalize( "areaTargetDefinition", { key: "label", sort: true } );

ED4E.spellEnhancementUnits = {
  ...ED4E.movementUnits,
  ...ED4E.scalarTimePeriods,
};
preLocalize( "spellEnhancementUnits" );

/* -------------------------------------------- */
/*  Chat Commands                               */
/* -------------------------------------------- */

/**
 * The available chat commands with their corresponding help text.
 * @enum {string}
 */
ED4E.chatCommands = {
  char:     "X.chatCommandCharHelp no parameters, trigger char gen",
  coin:     "X.chatCommandCoinHelp number plus coinage, pass out coins",
  group:    "X.chatCommandGroupHelp no parameters?, calc CR for group",
  h:        "X.chatCommandHelp optional param 'chatCommand', show general help or for given command",
  help:     "X.chatCommandHelp optional param 'chatCommand', show general help or for given command",
  lp:       "X.chatCommandLpHelp number, award LP points",
  s:        "X.chatCommandSHelp any number of steps separated by whitespace or +, roll the given steps",
};
preLocalize( "chatCommands" );


/* -------------------------------------------- */
/*           Document Data                      */
/* -------------------------------------------- */

ED4E.documentData = {
  Item: {
    skill: {
      languageSpeak: {
        name:   "ED.Item.CreateData.nameSpeakLanguage",
        type:   "skill",
        system: {
          description: { value: "ED.SpeakLanguage Skill Description" },
          // edid needs to be set on creation since settings are not ready on init
          // edid: game.settings.get( "ed4e", "edidLanguageSpeak" ),
          attribute:   "per",
        },
      },
      languageRW: {
        name:   "ED.Item.CreateData.nameReadWriteLanguage",
        type:   "skill",
        system: {
          description: { value: "ED.ReadWriteLanguage Skill Description" },
          // edid needs to be set on creation since settings are not ready on init
          // edid: game.settings.get( "ed4e", "edidLanguageRW" ),
          attribute:   "per",
        },
      },
    },
    devotion: {
      questor: {
        name:   "ED.Item.CreateData.nameQuestorDevotion",
        type:   "devotion",
        system: {
          description: { value: "ED.Devotion.Questor Description" },
          // edid needs to be set on creation since settings are not ready on init
          // edid: game.settings.get( "ed4e", "edidQuestorDevotion" ),
          attribute:   "cha",
          action:      "sustained",
          difficulty:  {fixed: 10},
          tier:        "journeyman",
        },
      },
    },
  },
};
preLocalize( "documentData.Item.skill.languageSpeak", { key: "name" } );
preLocalize( "documentData.Item.skill.languageSpeak.system.description", { key: "value" } );
preLocalize( "documentData.Item.skill.languageRW", { key: "name" } );
preLocalize( "documentData.Item.skill.languageRW.system.description", { key: "value" } );
preLocalize( "documentData.Item.devotion.questor", { key: "name" } );
preLocalize( "documentData.Item.devotion.questor.system.description", { key: "value" } );


/* -------------------------------------------- */
/*           Font Awesome Icons                 */
/* -------------------------------------------- */

ED4E.icons = {
  ability:          "fa-bolt",
  attack:           "fa-crosshairs",
  attribute:        "fa-dice-d20",
  cancel:           "fa-times",
  classAdvancement: "fa-arrow-trend-up",
  configure:        "fa-cogs",
  damage:           "fa-skull-crossbones",
  dice:             "fa-dice",
  effect:           "fa-biohazard",
  halfmagic:        "fa-hat-wizard",
  initiative:       "fa-running",
  patterncraft:     "fa-thin fa-group-arrows-rotate",
  recovery:         "fa-heartbeat",
  spellcasting:     "fa-thin fa-sparkles",
  threadWeaving:    "fa-thin fa-chart-network",
  finishCharGen:    "fa-thin fa-check-double",
  previousCharGen:  "fa-thin fa-arrow-left",
  nextCharGen:      "fa-thin fa-arrow-right",
  resetPoints:      "fa-arrows-rotate",
  undo:             "fa-arrow-rotate-left",
};


/* -------------------------------------------- */
/*  Enable .hbs Hot Reload                      */
/* -------------------------------------------- */

/* eslint-disable */
// Since Foundry does not support hot reloading object notation templates...
Hooks.on('hotReload', async ({ content, extension, packageId, packageType, path } = {}) => {
  if (extension === 'hbs') {
    const key = Object.entries(flattenObject(templates)).find(([_, tpath]) => tpath == path)?.[0];
    if (!key) throw new Error(`Unrecognized template: ${path}`);
    await new Promise((resolve, reject) => {
      game.socket.emit('template', path, resp => {
        if (resp.error) return reject(new Error(resp.error));
        const compiled = Handlebars.compile(resp.html);
        Handlebars.registerPartial(generateTemplateKey(key), compiled);
        console.log(`Foundry VTT | Retrieved and compiled template ${path} as ${key}`);
        resolve(compiled);
      });
    });
    Object.values(ui.windows).forEach(app => app.render(true));
  }
});
/* eslint-enable */


/* -------------------------------------------- */
/*  Export Config                               */
/* -------------------------------------------- */

export default ED4E;
