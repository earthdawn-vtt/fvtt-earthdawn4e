import { preLocalize } from "../utils.mjs";


export const astralSpacePollution = {
  safe: {
    label:            "ED.Config.AstralSpacePollution.safe",
    sensingModifier:   0,
    backlashModifier:  4,
    rawMagic:          {
      warpingModifier:    0,
      damageModifier:     4,
      horrorMarkModifier: null,
    },
  },
  open: {
    label:            "ED.Config.AstralSpacePollution.open",
    sensingModifier:   2,
    backlashModifier:  8,
    rawMagic:          {
      warpingModifier:    5,
      damageModifier:     5,
      horrorMarkModifier: 2,
    },
  },
  tainted: {
    label:            "ED.Config.AstralSpacePollution.tainted",
    sensingModifier:   5,
    backlashModifier:  12,
    rawMagic:          {
      warpingModifier:    10,
      damageModifier:     12,
      horrorMarkModifier: 5,
    },
  },
  corrupt: {
    label:            "ED.Config.AstralSpacePollution.corrupt",
    sensingModifier:   12,
    backlashModifier:  16,
    rawMagic:          {
      warpingModifier:    15,
      damageModifier:     16,
      horrorMarkModifier: 10,
    },
  },
};
preLocalize( "astralSpacePollution", { key: "label" } );


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

/**
 * The number of extra threads that can be added to a spell based on the circle of its corresponding discipline.
 * @type {{ [circle: number]: number }}
 */
export const extraThreadsByCircle = {
  1:  1,
  2:  1,
  3:  1,
  4:  1,
  5:  2,
  6:  2,
  7:  2,
  8:  2,
  9:  3,
  10: 3,
  11: 3,
  12: 3,
  13: 4,
  14: 4,
  15: 4,
};

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