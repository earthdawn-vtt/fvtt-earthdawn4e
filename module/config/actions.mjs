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
  mystical:   "ED.Config.Defenses.mystical",
  physical:   "ED.Config.Defenses.physical",
  social:     "ED.Config.Defenses.social",
};
preLocalize( "targetDifficulty" );