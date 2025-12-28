import { preLocalize } from "../utils.mjs";


/**
 * Actions
 * @enum {string}
 */
export const action = {
  free:         "ED.Config.Action.free",
  simple:       "ED.Config.Action.simple",
  standard:     "ED.Config.Action.standard",
  sustained:    "ED.Config.Action.sustained",
};
preLocalize( "action" );

/**
 * Group  Difficulty
 * @enum {string}
 */
export const groupDifficulty = {
  highestOfGroup:   "ED.Config.Defenses.highestOfGroup",
  lowestOfGroup:    "ED.Config.Defenses.lowestOfGroup",
  highestX:         "ED.Config.Defenses.highestX",
  lowestX:          "ED.Config.Defenses.lowestX"
};
preLocalize( "groupDifficulty" );

/**
 * Target Difficulty
 * @enum {string}
 */
export const targetDifficulty = {
  mystical: {
    "label":        "ED.Config.TargetDifficulty.mystical",
    "abbreviation": "ED.Config.TargetDifficulty.mysticalAbbreviation",
  },
  physical: {
    "label":        "ED.Config.TargetDifficulty.physical",
    "abbreviation": "ED.Config.TargetDifficulty.physicalAbbreviation",
  },
  social:     {
    "label":        "ED.Config.TargetDifficulty.social",
    "abbreviation": "ED.Config.TargetDifficulty.socialAbbreviation",
  },
};
preLocalize( "targetDifficulty", {keys: [ "label", "abbreviation" ]} );