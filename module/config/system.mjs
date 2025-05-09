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
  creatureAttack:  "creature-attack",
  languageRW:      "language-rw",
  languageSpeak:   "language-speak",
  patterncraft:    "patterncraft",
  questorDevotion: "questor-devotion",
  spellMatrix:     "matrix",
  spellcasting:    "spellcasting",
  threadWeaving:   "thread-weaving",
  unarmedCombat:   "unarmed-combat",
  versatility:     "versatility",
};

// endregion

/**
 * @description The grouping for the document creation dialogues in from the sidebar.
 */
export const typeGroups = {
  Item: {
    Equipment:    [ "armor", "equipment", "shield", "weapon" ],
    Powers:       [ "maneuver", "power" ],
    Abilities:    [ "devotion", "knackAbility", "knackManeuver","knackKarma", "skill", "specialAbility", "talent" ],
    Conditions:   [ "cursemark", "effect", "poisonDisease" ],
    Magic:        [ "spell", "spellKnack", "bindingSecret", ],
    Classes:      [ "discipline", "path", "questor" ],
    Other:        [ "mask", "namegiver", "shipWeapon" ]
  },
  Actor: {
    Namegivers:   [ "character", "npc" ],
    Creatures:    [ "creature", "spirit", "horror", "dragon" ],
    Other:        [ "group", "vehicle", "trap", "loot" ]
  }
};

// region Font Awesome Icons

export const icons = {
  ability:          "fa-bolt",
  attack:           "fa-crosshairs",
  attribute:        "fa-dice-d20",
  attune:           "fa-thin fa-chart-network",
  cancel:           "fa-times",
  classAdvancement: "fa-arrow-trend-up",
  configure:        "fa-cogs",
  damage:           "fa-skull-crossbones",
  delete:           "fa-trash",
  dice:             "fa-dice",
  effect:           "fa-biohazard",
  effectExecution:  "fa-light fa-arrow-progress",
  emptyMatrices:    "fa-empty-set",
  halfmagic:        "fa-hat-wizard",
  initiative:       "fa-running",
  itemHistory:      "fa-history",
  ok:               "fa-check",
  onTheFly:         "fa-forward-fast",
  patterncraft:     "fa-thin fa-group-arrows-rotate",
  recovery:         "fa-heartbeat",
  research:         "fa-thin fa-search",
  spellcasting:     "fa-thin fa-sparkles",
  threadWeaving:    "fa-thin fa-chart-network",
  finishCharGen:    "fa-thin fa-check-double",
  previousCharGen:  "fa-thin fa-arrow-left",
  nextCharGen:      "fa-thin fa-arrow-right",
  resetPoints:      "fa-arrows-rotate",
  undo:             "fa-arrow-rotate-left",
  unknown:          "fa-question",
  Tabs:             {
  },
};

// endregion