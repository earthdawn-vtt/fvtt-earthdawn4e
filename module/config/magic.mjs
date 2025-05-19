import { preLocalize } from "../utils.mjs";


/**
 * The different ways of attuning spells.
 * @enum {string}
 */
export const attuningType = {
  matrixStandard: "ED.Config.AttuningType.matrixStandard",
  matrixOnTheFly: "ED.Config.AttuningType.matrixOnTheFly",
  grimoire:       "ED.Config.AttuningType.grimoire",
};
preLocalize( "attuningType" );

/**
 * Different types of Illusions
 * @enum {string}
 */
export const illusionType = {
  "figment":      "ED.Config.IllusionType.figment",
  "glamour":      "ED.Config.IllusionType.glamour",
  "illusion":     "ED.Config.IllusionType.illusion",
  "phantasm":     "ED.Config.IllusionType.phantasm",
  "shadow":       "ED.Config.IllusionType.shadow",
};
preLocalize( "illusionType" );

export const elements = {
  air:        "ED.Config.Elements.air",
  earth:      "ED.Config.Elements.earth",
  fire:       "ED.Config.Elements.fire",
  water:      "ED.Config.Elements.water",
  wood:       "ED.Config.Elements.wood",
};
preLocalize( "elements" );

export const elementSubtypes = {
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

export const matrixTypes = {
  "standard": {
    label:         "ED.Config.MatrixTypes.standard",
    deathRating:   10,
    maxHoldThread: 0,
  },
  "enhanced": {
    label:         "ED.Config.MatrixTypes.enhanced",
    deathRating:   15,
    maxHoldThread: 1,
  },
  "armored":  {
    label:         "ED.Config.MatrixTypes.armored",
    deathRating:   25,
    maxHoldThread: 1,
  },
  "shared":   {
    label:         "ED.Config.MatrixTypes.shared",
    deathRating:   20,
    maxHoldThread: 0,
  },
};
preLocalize( "matrixTypes", { key: "label" } );

export const spellcastingTypes = {
  elementalism:   "ED.Config.spellcastingTypes.elementalism",
  illusionism:    "ED.Config.spellcastingTypes.illusionism",
  nethermancy:    "ED.Config.spellcastingTypes.nethermancy",
  shamanism:      "ED.Config.spellcastingTypes.shamanism",
  wizardry:       "ED.Config.spellcastingTypes.wizardry",
};
preLocalize( "spellcastingTypes" );

export const spellEnhancements = {
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

export const spellKeywords = {
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