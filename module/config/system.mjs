import { SYSTEM_TYPES } from "../constants/constants.mjs";

export const SYSTEM_ID = "ed4";

export const ASCII = `_______________________________
________  _____       _____ _______
|  _____| |    \     / _  | |  ____|
|  |____  | |\  \   / / | | |  |___
|  _____| | | |  | |  |_| | |   ___|
|  |____  | |/  /  |___   | |  |___
|_______| |___/        |  | |______|
_______________________________`;

// region ED-IDs

/**
 * Reserved earthdawn ids.
 * @enum {string}
 */
export const reservedEdid = {
  DEFAULT:    "none",
  ANY:        "any",
};

/**
 * The default values for certain ed ids that can be set via settings.
 * @enum {string}
 */
export const defaultEdIds = {
  grimoire:            "grimoire",
  itemHistory:         "item-history",
  learnImprovedSpells: "learn-improved-spells",
  languageRW:          "language-rw",
  languageSpeak:       "language-speak",
  patterncraft:        "patterncraft",
  questorDevotion:     "questor-devotion",
  spellMatrix:         "matrix",
  spellcasting:        "spellcasting",
  threadWeaving:       "thread-weaving",
  unarmedCombat:       "unarmed-combat",
  versatility:         "versatility",
  willforce:           "willforce",
};

// endregion

/**
 * @description The grouping for the document creation dialogues in from the sidebar.
 */
export const typeGroups = {
  Item: {
    equipment:    [ SYSTEM_TYPES.Item.armor, SYSTEM_TYPES.Item.equipment, SYSTEM_TYPES.Item.shield, SYSTEM_TYPES.Item.weapon ],
    powers:       [ SYSTEM_TYPES.Item.maneuver, SYSTEM_TYPES.Item.power ],
    abilities:    [ SYSTEM_TYPES.Item.devotion, SYSTEM_TYPES.Item.knackAbility, SYSTEM_TYPES.Item.knackManeuver,SYSTEM_TYPES.Item.knackKarma, SYSTEM_TYPES.Item.skill, SYSTEM_TYPES.Item.specialAbility, SYSTEM_TYPES.Item.talent ],
    conditions:   [ SYSTEM_TYPES.Item.curseMark, SYSTEM_TYPES.Item.poisonDisease ],
    magic:        [ SYSTEM_TYPES.Item.spell, SYSTEM_TYPES.Item.spellKnack, SYSTEM_TYPES.Item.bindingSecret, ],
    classes:      [ SYSTEM_TYPES.Item.discipline, SYSTEM_TYPES.Item.path, SYSTEM_TYPES.Item.questor ],
    other:        [ SYSTEM_TYPES.Item.mask, SYSTEM_TYPES.Item.namegiver, SYSTEM_TYPES.Item.shipWeapon ],
  },
  Actor: {
    namegivers:   [ SYSTEM_TYPES.Actor.pc, SYSTEM_TYPES.Actor.npc ],
    creatures:    [ SYSTEM_TYPES.Actor.creature, SYSTEM_TYPES.Actor.spirit, SYSTEM_TYPES.Actor.horror, SYSTEM_TYPES.Actor.dragon ],
    other:        [ SYSTEM_TYPES.Actor.group, SYSTEM_TYPES.Actor.vehicle, SYSTEM_TYPES.Actor.trap, SYSTEM_TYPES.Actor.loot ],
  }
};

// region Font Awesome Icons

export const icons = {
  AstralPollution:  {
    safe:           "fa-thin fa-shield-check",
    open:          "fa-regular circle-radiation",
    tainted:       "fa-regular radiation",
    corrupt:       "fa-regular fa-biohazard",
  },
  GroupDifficulty:  {
    group:          "fa-users",
    highest:        "fa-arrow-up",
    lowest:         "fa-arrow-down",
    x:              "fa-xmark",
  },
  RecoveryMode:     {
    recovery:      "fa-heart",
    fullRest:      "fa-campfire",
    recoverStun:   "fa-spiral",
  },
  Tabs:             {
    lpEarned:        "fa-light fa-hexagon-plus",
    lpSpend:         "fa-light fa-hexagon-minus",
    lpChronological: "fa-light fa-timeline-arrow",
  },
  ability:           "fa-bolt",
  add:               "fa-plus",
  attack:            "fa-crosshairs",
  attribute:         "fa-dice-d20",
  attune:            "fa-thin fa-chart-network",
  cancel:            "fa-times",
  classAdvancement:  "fa-arrow-trend-up",
  configure:         "fa-cogs",
  damage:            "fa-skull-crossbones",
  delete:            "fa-trash",
  detailsArrowDown:  "fa-square-chevron-down",
  detailsArrowRight: "fa-square-chevron-right",
  dice:              "fa-dice",
  earthdawn:         "fa-e",
  effect:            "fa-biohazard",
  effectExecution:   "fa-light fa-arrow-progress",
  emptyMatrices:     "fa-empty-set",
  eye:               "fa-eye",
  eyeSlash:          "fa-eye-slash",
  favoritable:       "fa-star",
  finishCharGen:     "fa-thin fa-check-double",
  halfmagic:         "fa-hat-wizard",
  import:            "fa-file-import",
  initiative:        "fa-running",
  itemHistory:       "fa-history",
  nextCharGen:       "fa-thin fa-arrow-right",
  ok:                "fa-check",
  onTheFly:          "fa-forward-fast",
  patterncraft:      "fa-thin fa-group-arrows-rotate",
  previousCharGen:   "fa-thin fa-arrow-left",
  recovery:          "fa-heartbeat",
  research:          "fa-thin fa-search",
  resetPoints:       "fa-arrows-rotate",
  spellcasting:      "fa-thin fa-sparkles",
  threadWeaving:     "fa-thin fa-chart-network",
  undo:              "fa-arrow-rotate-left",
  unknown:           "fa-question",
  x:                 "fa-x",
};

// endregion

// region Flags

export const FLAGS = {
  learnedSpellKnackThroughPath: "learnedSpellKnackThroughPath",
};

// endregion