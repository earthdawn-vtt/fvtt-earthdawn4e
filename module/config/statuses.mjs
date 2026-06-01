import { COMMON_EAE_CHANGES } from "./effects.mjs";
import SentientTemplate from "../data/actor/templates/sentient.mjs";
import { SYSTEM_TYPES } from "../constants/constants.mjs";
import { preLocalize } from "../i18n/localization.mjs";

const STATUS_CHANGES = {
  aggressive: [
    {
      key:   "system.globalModifiers.allCloseAttacks.value",
      type:  "add",
      value: +3,
    },
    {
      key:   "system.globalModifiers.allCloseDamage.value",
      type:  "add",
      value: +3,
    },
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
      value: -3,
    },
  ],
  blindness:  COMMON_EAE_CHANGES.darknessFull,
  blindsided: [
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
      value: -3,
    },
  ],
  calledShot: [
    {
      key:   "system.globalModifiers.allAttacks.value",
      type:  "add",
      value: -3,
    },
  ],
  dazzled:    COMMON_EAE_CHANGES.darknessPartial,
  defensive:  [
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: +3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
      value: +3,
    },
    {
      key:   "system.globalModifiers.allTests.value",
      type:  "add",
      value: -3,
    },
    {
      // defensive stance gives penalty to _all_ tests except knockdown tests
      // add an explicit bonus to knockdown effects to neutralize the penalty from `globalModifiers.allTests`
      key:   "system.globalModifiers.allKnockdownTests.value",
      type:  "add",
      value: +3,
    },
  ],
  fury: [
    {
      key:   "system.globalModifiers.allTests",
      type:  "add",
      // ignore existing wounds and add them as bonus
      value: "2 * @wounds",
    },
  ],
  grappled:    COMMON_EAE_CHANGES.noMovement,
  harried:     [
    {
      key:   "system.globalModifiers.allActions.value",
      type:  "add",
      value: -2,
    },
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: -2,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
      value: -2,
    },
  ],
  knockedDown: [
    {
      key:   "system.globalModifiers.allTests.value",
      type:  "add",
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
      value: -3,
    },
    {
      key:   "system.characteristics.movement.walk",
      type:  "override",
      value: 2,
    },
  ],
  overwhelmed: [
    {
      key:   "system.globalModifiers.allActions.value",
      type:  "add",
      value: -1,
    },
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: -1,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
      value: -1,
    },
  ],
  surprised:   [
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: -3,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
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
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.aggressive",
    img:  "systems/ed4e/assets/icons/status-effects/aggressive.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.aggressive,
    system:  {
      changes: STATUS_CHANGES.aggressive,
    },
  },
  {
    id:   "attackKnockdown",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.attackKnockdown",
    img:  "systems/ed4e/assets/icons/status-effects/attack-knockdown.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:   "attackStun",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.attackStun",
    img:  "systems/ed4e/assets/icons/status-effects/attack-stun.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:   "attuningOnTheFly",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.attuningOnTheFly",
    img:  "systems/ed4e/assets/icons/status-effects/attune-on-the-fly.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:    SYSTEM_TYPES.ActiveEffect.condition,
    changes: [ {} ],
    system:  {
      changes: [ {} ],
    },
    statuses: new Set( [ "concentrating", ] ),
  },
  {
    id:    "blindness",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.blindness",
    img:  "systems/ed4e/assets/icons/status-effects/blindness.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.blindness,
    system:  {
      // only for sight based tests
      // different effects on low-light vision or heat sight
      changes: STATUS_CHANGES.blindness,
    },
  },
  {
    id:    "blindsided",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.blindsided",
    img:  "systems/ed4e/assets/icons/status-effects/blindsided.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.blindsided,
    system:  {
      // only against the attack that caused the blindsided effect
      changes: STATUS_CHANGES.blindsided,
    },
  },
  {
    id:   "calledShot",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.calledShot",
    img:  "systems/ed4e/assets/icons/status-effects/called-shot.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.calledShot,
    system:  {
      changes: STATUS_CHANGES.calledShot,
    },
  },
  {
    id:   "concentrating",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.concentrating",
    img:  "systems/ed4e/assets/icons/status-effects/concentrating.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:    SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:    "cover",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.cover",
    img:  "systems/ed4e/assets/icons/status-effects/cover.svg",

    levelNames: [ "", "ED.ActiveEffect.Status.coverPartial", "ED.ActiveEffect.Status.coverFull" ],
    levels:     2,
    reference:  "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  COMMON_EAE_CHANGES.coverPartial,
    system:  {
      changes: COMMON_EAE_CHANGES.coverPartial,
    },
  },
  {
    id:    "darkness",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.darkness",
    img:  "systems/ed4e/assets/icons/status-effects/darkness.svg",

    levelNames: [ "", "ED.ActiveEffect.Status.darknessPartial", "ED.ActiveEffect.Status.darknessFull" ],
    levels:     2,
    reference:  "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  COMMON_EAE_CHANGES.darknessPartial,
    system:  {
      changes: COMMON_EAE_CHANGES.darknessPartial,
    },
  },
  {
    id:    "dazzled",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.dazzled",
    img:  "systems/ed4e/assets/icons/status-effects/dazzled.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.dazzled,
    system:  {
      // only for sight based tests
      changes: STATUS_CHANGES.dazzled,
    },
  },
  {
    id:    "dead",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.dead",
    img:  "systems/ed4e/assets/icons/status-effects/dead.svg",

    reference: "TODO: Compendium UUID to explanation",
  },
  {
    id:    "defensive",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.defensive",
    img:  "systems/ed4e/assets/icons/status-effects/defensive.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.defensive,
    system:  {
      changes: STATUS_CHANGES.defensive,
    },
  },
  {
    id:   "fury",
    hud:  { actorTypes: [ SYSTEM_TYPES.Actor.creature, ] },
    name: "ED.ActiveEffect.Status.fury",
    img:  "systems/ed4e/assets/icons/status-effects/fury.svg",

    levels:    Number.POSITIVE_INFINITY, // no limit theoretically? or like an ability up to 15?
    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.fury,
    system:  {
      // add custom handling: only up to level of fury
      changes: STATUS_CHANGES.fury,
    },
  },
  {
    id:    "grappled",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.grappled",
    img:  "systems/ed4e/assets/icons/status-effects/grappled.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.grappled,
    system:  {
      // can't move, can take no actions without beating the unarmed combat test
      // of the grappling attack
      changes: STATUS_CHANGES.grappled,
    },
  },
  {
    id:    "harried",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.harried",
    img:  "systems/ed4e/assets/icons/status-effects/harried.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.harried,
    system:  {
      changes: STATUS_CHANGES.harried,
    },
  },
  {
    id:    "impaired",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.impaired",
    img:  "systems/ed4e/assets/icons/status-effects/impaired.svg",

    levelNames: [ "", "ED.ActiveEffect.Status.impairedLight", "ED.ActiveEffect.Status.impairedHeavy" ],
    levels:     2,
    reference:  "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  COMMON_EAE_CHANGES.impairedLight,
    system:  {
      changes: COMMON_EAE_CHANGES.impairedLight,
    },
  },
  {
    id:   "jumpUp",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.jumpUp",
    img:  "systems/ed4e/assets/icons/status-effects/jump-up.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:    "knockedDown",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.knockedDown",
    img:  "systems/ed4e/assets/icons/status-effects/knocked-down.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.knockedDown,
    system:  {
      // unset other combat options, can't be used
      changes: STATUS_CHANGES.knockedDown,
    },
  },
  {
    id:    "overwhelmed",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.overwhelmed",
    img:  "systems/ed4e/assets/icons/status-effects/overwhelmed.svg",

    levels:    Number.POSITIVE_INFINITY, // no limit
    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.overwhelmed,
    system:  {
      changes: STATUS_CHANGES.overwhelmed,
    },
  },
  {
    id:   "setAgainstCharge",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.setAgainstCharge",
    img:  "systems/ed4e/assets/icons/status-effects/set-against-charge.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:   "shatterShield",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.shatterShield",
    img:  "systems/ed4e/assets/icons/status-effects/shatter-shield.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:   "splitMovement",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.splitMovement",
    img:  "systems/ed4e/assets/icons/status-effects/split-movement.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:    "surprised",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.surprised",
    img:  "systems/ed4e/assets/icons/status-effects/surprised.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes:  STATUS_CHANGES.surprised,
    duration: STATUS_DURATIONS.surprised,
    system:   {
      // can't take actions
      changes:  STATUS_CHANGES.surprised,
      duration: STATUS_DURATIONS.surprised,
    },
  },
  {
    id:   "tailAttack",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.tailAttack",
    img:  "systems/ed4e/assets/icons/status-effects/tail-attack.svg",

    combatOption: true,
    reference:    "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
  },
  {
    id:    "unconscious",
    hud:  { actorTypes: SentientTemplate.SENTIENT_ACTOR_TYPES },
    name: "ED.ActiveEffect.Status.unconscious",
    img:  "systems/ed4e/assets/icons/status-effects/unconscious.svg",

    reference: "TODO: Compendium UUID to explanation",

    type:     SYSTEM_TYPES.ActiveEffect.condition,
    changes: [ {} ],
    system:  {
      changes: [ {} ],
    },
    statuses: new Set( [ "blindsided", "knockedDown" ] ),
  },
];
statusEffects.forEach( ( status, index ) => {
  if ( status.levelNames?.length > 0 ) preLocalize( `statusEffects.${index}.levelNames` );
} );

export const STATUS_CONDITIONS = statusEffects.reduce( ( acc, effect ) => {
  acc[ effect.id ] = effect;
  return acc;
}, {} ) ;

export const specialStatusEffects = {
  BLIND:     "blindness",
  BURROW:    "burrow",
  DEFEATED:  "dead",
  FLY:       "fly",
  HOVER:     "hover",
  INVISIBLE: "invisible"
};