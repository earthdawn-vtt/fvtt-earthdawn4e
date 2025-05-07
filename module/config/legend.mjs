import { preLocalize } from "../utils.mjs";


// region Character Generation

export const availableRanks = {
  talent:    8,
  devotion:  1,
  knowledge: 2,
  artisan:   1,
  general:   8,
  speak:     2,
  readWrite: 1,
};

/**
 * Lookup table used during character generation based on attribute values.
 * @type {{defenseRating: number[], unconsciousRating: number[], carryingCapacity: number[], armor: number[], deathRating: number[], step: number[], woundThreshold: number[], recovery: number[]}}
 */
export const characteristicsTable = {
  step:              [ 0, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11 ],
  defenseRating:     [ 0, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16 ],
  carryingCapacity:  [ 0, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 95, 110, 125, 140, 155, 175, 195, 215, 235, 255, 280, 305, 330, 355, 380, 410, 440, 470, 500, 530 ],
  unconsciousRating: [ 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60 ],
  deathRating:       [ 0, 4, 6, 8, 11, 13, 15, 18, 20, 22, 25, 27, 29, 32, 34, 36, 39, 41, 43, 46, 48, 50, 53, 55, 57, 60, 62, 64, 67, 69, 71 ],
  woundThreshold:    [ 0, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17 ],
  recovery:          [ 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, ],
  armor:             [ 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6 ],
};

export const circleTalentRequirements = {
  disciplineTalents:   "ED.Settings.LpTracking.disciplineTalents",
  allTalents:          "ED.Settings.LpTracking.allTalents",
  allTalentsHouseRule: "ED.Settings.LpTracking.allTalentsHouseRule"
};
preLocalize( "circleTalentRequirements" );

export const spellCostRules = {
  noviceTalent: "ED.Settings.LpTracking.noviceTalent",
  circleX100:   "ED.Settings.LpTracking.circleX100",
  free:         "ED.Settings.LpTracking.free",
};
preLocalize( "spellCostRules" );

export const validationCategories = {
  base:               "ED.Config.LpTracking.Validation.titleBase",
  health:             "ED.Config.LpTracking.Validation.titleHealth",
  resources:          "ED.Config.LpTracking.Validation.titleResources",
  talentsRequirement: "ED.Config.LpTracking.Validation.titleTalentsRequirement",
  newAbilityLp:       "ED.Config.LpTracking.Validation.titleNewAbilityLp",
};
preLocalize( "validationCategories" );

// endregion


// region Character Advancement

/**
 * Type of grantable abilities for a class level
 * @enum {string}
 */
export const abilityPools = {
  class:      "ED.Advancement.Pools.class",
  free:       "ED.Advancement.Pools.free",
  special:    "ED.Advancement.Pools.special"
};
preLocalize( "abilityPools" );

/**
 * The rules for increasing attributes.
 * @enum {string}
 */
export const attributeIncreaseRules = {
  spendLp:          "ED.Settings.LpTracking.spendLp",
  spendLpPerCircle: "ED.Settings.LpTracking.spendLpPerCircle",
  freePerCircle:    "ED.Settings.LpTracking.freePerCircle"
};
preLocalize( "attributeIncreaseRules" );

export const attributePointsCost = [ 0, 1, 2, 3, 5, 7, 9, 12, 15 ];
attributePointsCost[-1] = -1;
attributePointsCost[-2] = -2;

export const constraints = {
  ability: {
    label:         "ED.Config.Constraints.ability",
    inputTemplate: "systems/ed4e/templates/form/input/base-constraint.hbs",
  },
  attribute: {
    label:         "ED.Config.Constraints.attribute",
    inputTemplate: "systems/ed4e/templates/form/input/base-constraint.hbs",
  },
  class: {
    label:         "ED.Config.Constraints.class",
    inputTemplate: "systems/ed4e/templates/form/input/base-constraint.hbs",
  },
  language: {
    label:         "ED.Config.Constraints.language",
    inputTemplate: "",
  },
  namegiver: {
    label:         "ED.Config.Constraints.namegiver",
    inputTemplate: "",
  },
  relation: {
    label:         "ED.Config.Constraints.relation",
    inputTemplate: "",
  },
};
preLocalize( "constraints", { key: "label", sort: true } );

export const disciplineTeacherCost = [ 0, 100, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3500, 5000, 7500, 10000, 15000, 20000 ];

export const legendPointsCost = [ 0, 100, 200, 300, 500, 800, 1300, 2100, 3400, 5500, 8900, 14400, 23300, 37700, 61000, 98700, 159700, 258400, 418100 ];

export const trainingTime = [ 2, 3, 5, 8, 13, 21, 34, 55, 89 ];

export const levelTierMapping = {
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
 * The modifier for the lookup table {@link legendPointsCost} based on the tier. Each tier starts at the next value
 * in the fibonacci (lp cost) sequence. The first index is the order of the corresponding discipline (with 0
 * being undefined). The key is the tier.
 * @type {[{}|{ novice: number, journeyman: number, warden: number, master: number }]}
 */
export const lpIndexModForTier = [
  {},
  { novice: 0, journeyman: 1, warden: 2, master: 3, },  // First Discipline
  { novice: 1, journeyman: 2, warden: 3, master: 4, }, // Second Discipline
  { novice: 2,  journeyman: 3, warden: 4, master: 5, }, // Third Discipline
  { novice: 3, journeyman: 4, warden: 5, master: 6, }, // Fourth+ Discipline
];

export const lpSpendingTypes = {
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
 * The cost of learning a new talent for additional disciplines. The first index is the order of the corresponding
 * discipline (with 0 and 1 undefined). The second index is the lowest circle attained between all disciplines.
 * @type {number[][]}
 */
export const multiDisciplineNewTalentLpCost = [
  [],
  [],
  [ 0, 1300, 800, 500, 300, 200 ], // Second Discipline
  [ 0, 2100, 1300, 800, 500, 300 ], // Third Discipline
  [ 0, 3400, 2100, 1300, 800, 500 ], // Fourth+ Discipline
];

/**
 * Types of skills.
 * @enum {string}
 */
export const skillTypes = {
  general:      "ED.Config.Skills.general",
  artisan:      "ED.Config.Skills.artisan",
  knowledge:    "ED.Config.Skills.knowledge",
};
preLocalize( "skillTypes" );

/**
 * talentCategory
 * @enum {string}
 */
export const talentCategory = {
  discipline:     "ED.Config.talentCategory.discipline",
  optional:       "ED.Config.talentCategory.optional",
  free:           "ED.Config.talentCategory.free",
  versatility:    "ED.Config.talentCategory.versatility"
};
preLocalize( "talentCategory" );

/**
 * Tier
 * @enum {string}
 */
export const tier = {
  novice:       "ED.Config.Tier.novice",
  journeyman:   "ED.Config.Tier.journeyman",
  warden:       "ED.Config.Tier.warden",
  master:       "ED.Config.Tier.master"
};
preLocalize( "tier" );

// endregion


