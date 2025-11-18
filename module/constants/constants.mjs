// region System Types

/**
 * The system types for various Foundry VTT documents.
 * @type {{ActiveEffect: Record<symbol,string>, Actor: Record<symbol, string>, ChatMessage: Record<symbol,string>, Combatant: Record<symbol,string>, Item: Record<symbol,string>}}
 */
export const systemTypes = {
  ActiveEffect: {
    eae:       "eae",
    condition: "condition"
  },
  Actor: {
    creature:  "creature",
    dragon:    "dragon",
    group:     "group",
    horror:    "horror",
    loot:      "loot",
    npc:       "npc",
    character: "character",
    pc:        "character",
    spirit:    "spirit",
    trap:      "trap",
    vehicle:   "vehicle"
  },
  ChatMessage: {
    attack:        "attack",
    common:        "common",
    damage:        "damage",
    initiative:    "initiative",
    spellcasting:  "spellcasting",
    threadWeaving: "threadWeaving"
  },
  Combatant: {
    base: "base"
  },
  Item: {
    armor:          "armor",
    bindingSecret:  "bindingSecret",
    curseMark:      "curseMark",
    devotion:       "devotion",
    discipline:     "discipline",
    equipment:      "equipment",
    knackAbility:   "knackAbility",
    knackKarma:     "knackKarma",
    knackManeuver:  "knackManeuver",
    maneuver:       "maneuver",
    mask:           "mask",
    namegiver:      "namegiver",
    path:           "path",
    poisonDisease:  "poisonDisease",
    power:          "power",
    questor:        "questor",
    shield:         "shield",
    shipWeapon:     "shipWeapon",
    skill:          "skill",
    specialAbility: "specialAbility",
    spell:          "spell",
    spellKnack:     "spellKnack",
    talent:         "talent",
    thread:         "thread",
    weapon:         "weapon"
  }
};

// endregion