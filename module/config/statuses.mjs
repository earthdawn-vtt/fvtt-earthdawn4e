export const statusEffects = [
  {
    id:   "aggressive",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.aggressive",
    img:  "systems/ed4e/assets/icons/confrontation.svg",
  },
  {
    id:    "blindness",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.blindness",
    img:  "icons/svg/blind.svg",
  },
  {
    id:    "blindsided",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.blindsided",
    img:  "systems/ed4e/assets/icons/backstab.svg",
  },
  {
    id:    "cover",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.cover",
    img:  "systems/ed4e/assets/icons/broken-wall.svg",
  },
  {
    id:    "darkness",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.darkness",
    img:  "systems/ed4e/assets/icons/fog.svg",
  },
  {
    id:    "dazzled",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.dazzled",
    img:  "systems/ed4e/assets/icons/laser-sparks.svg",
  },
  {
    id:    "dead",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.dead",
    img:  "icons/svg/skull.svg",
  },
  {
    id:    "defensive",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.defensive",
    img:  "systems/ed4e/assets/icons/surrounded-shield.svg",
  },
  {
    id:   "fury",
    hud:  { actorTypes: [ "creature" ] },
    name: "ED.ActiveEffect.Status.fury",
    img:  "systems/ed4e/assets/icons/enraged.svg",
  },
  {
    id:    "grappled",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.grappled",
    img:  "systems/ed4e/assets/icons/grab.svg",
  },
  {
    id:    "harried",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.harried",
    img:  "systems/ed4e/assets/icons/meeple-army.svg",
  },
  {
    id:    "impaired",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.impaired",
    img:  "systems/ed4e/assets/icons/achilles-heel.svg",
  },
  {
    id:    "knockedDown",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.knockedDown",
    img:  "icons/svg/falling.svg",
  },
  {
    id:    "overwhelmed",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.overwhelmed",
    img:  "systems/ed4e/assets/icons/dozen.svg",
  },
  {
    id:    "surprised",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.surprised",
    img:  "systems/ed4e/assets/icons/surprised.svg",
  },
  {
    id:    "unconscious",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.unconscious",
    img:  "systems/ed4e/assets/icons/dead-head.svg",
  },
];

export const specialStatusEffects = {
  BLIND:     "blindness",
  BURROW:    "burrow",
  DEFEATED:  "dead",
  FLY:       "fly",
  HOVER:     "hover",
  INVISIBLE: "invisible"
};