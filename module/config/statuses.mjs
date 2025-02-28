const STATUS_CHANGES = {
  aggressive: [
    {
      key:   "system.globalBonuses.allCloseAttacks.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: +3,
    },
    {
      key:   "system.globalBonuses.allMeleeDamage.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: +3,
    },
    {
      key:   "system.characteristics.defenses.physical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
  ],
  blindness:  [
    {
      key:   "system.globalBonuses.allTests.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -4,
    },
  ],
  blindsided: [
    {
      key:   "system.characteristics.defenses.physical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
  ],
  dazzled:  [
    {
      key:   "system.globalBonuses.allTests.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -2,
    },
  ],
  defensive: [
    {
      key:   "system.characteristics.defenses.physical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: +3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: +3,
    },
    {
      key:   "system.globalBonuses.allTests.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
    {
      // defensive stance gives penalty to _all_ tests except knockdown tests
      // add an explicit bonus to knockdown effects to neutralize the penalty from `globalBonuses.allTests`
      key:   "system.globalBonuses.allKnockdownTests.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: +3,
    },
  ],
  fury: [
    {
      key:   "system.globalBonuses.allTests",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      // ignore existing wounds and add them as bonus
      value: "2 * @wounds",
    },
  ],
  knockedDown: [
    {
      key:   "system.globalBonuses.allTests.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.physical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
    {
      key:   "system.characteristics.movement.walk",
      mode:  CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
      value: 2,
    },
  ],
  surprised: [
    {
      key:   "system.characteristics.defenses.physical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -3,
    },
  ],
};

const STATUS_DURATIONS = {
  surprised: {
    type:   "combat",
    rounds: 1,
  },
};

export const statusEffects = [
  {
    id:   "aggressive",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.aggressive",
    img:  "systems/ed4e/assets/icons/confrontation.svg",

    type:     "eae",
    changes:  STATUS_CHANGES.aggressive,
    system:  {
      changes: STATUS_CHANGES.aggressive,
    },
  },
  {
    id:    "blindness",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.blindness",
    img:  "icons/svg/blind.svg",

    type:     "eae",
    changes:  STATUS_CHANGES.blindness,
    system:  {
      // only for sight based tests
      // different effects on low-light vision or heat sight
      changes: STATUS_CHANGES.blindness,
    },
  },
  {
    id:    "blindsided",
    hud:  { actorTypes: [ "character", "npc", "creature", "spirit", "horror", "dragon" ] },
    name: "ED.ActiveEffect.Status.blindsided",
    img:  "systems/ed4e/assets/icons/backstab.svg",

    type:     "eae",
    changes:  STATUS_CHANGES.blindsided,
    system:  {
      // only against the attack that caused the blindsided effect
      changes: STATUS_CHANGES.blindsided,
    },
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

    type:     "eae",
    changes:  STATUS_CHANGES.dazzled,
    system:  {
      // only for sight based tests
      changes: STATUS_CHANGES.dazzled,
    },
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

    type:     "eae",
    changes:  STATUS_CHANGES.defensive,
    system:  {
      changes: STATUS_CHANGES.defensive,
    },
  },
  {
    id:   "fury",
    hud:  { actorTypes: [ "creature" ] },
    name: "ED.ActiveEffect.Status.fury",
    img:  "systems/ed4e/assets/icons/enraged.svg",

    type:     "eae",
    changes:  STATUS_CHANGES.fury,
    system:  {
      // add custom handling: only up to level of fury
      changes: STATUS_CHANGES.fury,
    },
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

    type:     "eae",
    changes:  STATUS_CHANGES.knockedDown,
    system:  {
      // unset other combat options, can't be used
      changes: STATUS_CHANGES.knockedDown,
    },
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

    type:     "eae",
    changes:  STATUS_CHANGES.surprised,
    duration: STATUS_DURATIONS.surprised,
    system:   {
      // can't take actions
      changes:  STATUS_CHANGES.surprised,
      duration: STATUS_DURATIONS.surprised,
    },
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