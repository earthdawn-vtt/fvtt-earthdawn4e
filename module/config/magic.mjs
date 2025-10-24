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

/**
 * Modifiers applied to spellcasting based on whether the grimoire is owned or not.
 * @type {{notOwned: number, ownedExtraSuccess: number}}
 */
export const grimoireModifiers = {
  notOwned:          -2,
  ownedExtraSuccess: 1,
};

export const spellcastingColors = {
  elementalism: "rgb(221, 135, 79)",
  illusionism:  "rgb(160, 160, 240)",
  nethermancy:  "rgb(28,0,0)",
  shamanism:    "rgb(98, 145, 17)",
  wizardry:     "rgb(42, 90, 165)",
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

/**
 * The different types of spell effects.
 * @enum {{label: string, flavorTemplate: string}}
 */
export const spellEffectTypes = {
  damage: {
    label:            "ED.Config.SpellEffectTypes.damage",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/spell-effect-damage-roll-flavor.hbs",
  },
  effect: {
    label:            "ED.Config.SpellEffectTypes.effect",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/spell-effect-effect-roll-flavor.hbs",
  },
  macro: {
    label:            "ED.Config.SpellEffectTypes.macro",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/spell-effect-macro-roll-flavor.hbs",
  },
  special: {
    label:            "ED.Config.SpellEffectTypes.special",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/spell-effect-special-roll-flavor.hbs",
  },
};
preLocalize( "spellEffectTypes", { key: "label" } );

export const spellEnhancements = {
  area: {
    label:         "ED.Config.SpellEnhancements.area",
    icon:          "fa-arrow-up-right-and-arrow-down-left-from-center",
    inputTemplate: "systems/ed4e/templates/form/input/area-metric.hbs",
    unitConfig:    "movementUnits",
  },
  duration: {
    label:         "ED.Config.SpellEnhancements.duration",
    icon:          "fa-clock",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "scalarTimePeriods",
  },
  effect: {
    label:         "ED.Config.SpellEnhancements.effect",
    icon:          "fa-star",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "",
  },
  range: {
    label:         "ED.Config.SpellEnhancements.range",
    icon:          "fa-ruler",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "movementUnits",
  },
  section: {
    label:         "ED.Config.SpellEnhancements.section",
    icon:          "fa-arrows-left-right-to-line",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "",
  },
  special: {
    label:         "ED.Config.SpellEnhancements.special",
    icon:          "fa-sparkles",
    inputTemplate: "systems/ed4e/templates/form/input/base-metric.hbs",
    unitConfig:    "",
  },
  target: {
    label:         "ED.Config.SpellEnhancements.target",
    icon:          "fa-crosshairs-simple",
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

/**
 * The different types of patterns a thread can be woven to, determining its type.
 * @enum {string}
 */
export const threadTypes = {
  threadItem:   "ED.Config.ThreadTypes.threadItem",
  patternItem:  "ED.Config.ThreadTypes.patternItem",
  groupPattern: "ED.Config.ThreadTypes.groupPattern",
};
preLocalize( "threadTypes" );

/**
 * The types of true patterns, as defined in {@link threadTypes}.
 * @enum {string}
 */
export const truePatternTypes = threadTypes;