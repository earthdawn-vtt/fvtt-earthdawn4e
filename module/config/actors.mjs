import { preLocalize } from "../utils.mjs";


/**
 * Armor
 * @enum {string}
 */
export const armor = {
  physical:   "ED.Config.Armor.physical",
  mystical:   "ED.Config.Armor.mystical",
};
preLocalize( "armor" );

/**
 * Configuration data for attributes.
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
export const attributes = {
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
 * Defense Types
 * @enum {string}
 */
export const defense = {
  mystical:   "ED.Config.Defenses.mystical",
  physical:   "ED.Config.Defenses.physical",
  social:     "ED.Config.Defenses.social",
};
preLocalize( "defense" );

/**
 * Map the defense type to its corresponding attribute (abbreviated).
 * @enum {string}
 */
export const defenseAttributeMapping = {
  physical: "dex",
  mystical: "per",
  social:   "cha"
};

/**
 * The possible statuses of encumbrance
 * @enum {string}
 */
export const encumbranceStatus = {
  notEncumbered:    "ED.Conditions.Encumbrance.notEncumbered",
  light:            "ED.Conditions.Encumbrance.light",
  heavy:            "ED.Conditions.Encumbrance.heavy",
  tooHeavy:         "ED.Conditions.Encumbrance.tooHeavy"
};
preLocalize( "encumbranceStatus" );

export const languages = {
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