import { preLocalize } from "../utils.mjs";


/**
 * The available subtypes of (combatTypes) tests
 * @enum {string}
 */
export const combatTypes = {
  Aerial: {
    label:            "ED.Config.CombatTypes.aerial",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  Close: {
    label:            "ED.Config.CombatTypes.close",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  melee: {
    label:            "ED.Config.CombatTypes.melee",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  mounted: {
    label:            "ED.Config.CombatTypes.mounted",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  projectile: {
    label:            "ED.Config.CombatTypes.projectile",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  ranged: {
    label:            "ED.Config.CombatTypes.ranged",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  throwing: {
    label:            "ED.Config.CombatTypes.throwing",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  unarmed: {
    label:            "ED.Config.CombatTypes.unarmed",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
};
preLocalize( "testTypes", { key: "label" } );

/**
 * The minimum difficulty for any test.
 * @type {number}
 */
export const minDifficulty = 2;

export const resourceDefaultStep = {
  karma:    4,
  devotion: 3,
};

/**
 * The available subtypes of (roll) tests for {@link EdRollOptions}.
 * @enum {string}
 */
export const rollTypes = {
  ability: {
    label:            "ED.Config.RollTypes.ability",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/ability-roll-flavor.hbs",
  },
  attack: {
    label:            "ED.Config.RollTypes.attack",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attack-roll-flavor.hbs",
  },
  attribute: {
    label:            "ED.Config.RollTypes.attribute",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attribute-roll-flavor.hbs",
  },
  attuning: {
    label:            "ED.Config.RollTypes.attuning",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/attuning-roll-flavor.hbs",
  },
  damage: {
    label:            "ED.Config.RollTypes.damage",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/damage-roll-flavor.hbs",
  },
  effect: {
    label:            "ED.Config.RollTypes.effect",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/effect-roll-flavor.hbs",
  },
  halfmagic: {
    label:            "ED.Config.RollTypes.halfmagic",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/halfmagic-roll-flavor.hbs",
  },
  initiative: {
    label:            "ED.Config.RollTypes.initiative",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/initiative-roll-flavor.hbs",
  },
  reaction: {
    label:            "ED.Config.RollTypes.reaction",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/reaction-roll-flavor.hbs",
  },
  recovery: {
    label:            "ED.Config.RollTypes.recovery",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/recovery-roll-flavor.hbs",
  },
  spellcasting: {
    label:            "ED.Config.RollTypes.spellcasting",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/spellcasting-roll-flavor.hbs",
  },
  threadWeaving: {
    label:            "ED.Config.RollTypes.threadWeaving",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/threadWeaving-roll-flavor.hbs",
  },
  jumpUp: {
    label:            "ED.Config.RollTypes.jumpUp",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/ability-roll-flavor.hbs",
  },
  knockDown: {
    label:            "ED.Config.RollTypes.knockDown",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/ability-roll-flavor.hbs",
  },
};
preLocalize( "testTypes", { key: "label" } );

/**
 * The available types of (roll) tests for {@link EdRollOptions}.
 * @enum {string}
 */
export const testTypes = {
  arbitrary: {
    label:            "ED.Rolls.Labels.arbitraryTestRoll",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/arbitrary-roll-flavor.hbs",
  },
  action: {
    label:            "ED.Rolls.Labels.actionTestRoll",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/ability-roll-flavor.hbs",
  },
  effect: {
    label:            "ED.Rolls.Labels.effectTestRoll",
    flavorTemplate:   "systems/ed4e/templates/chat/chat-flavor/effect-roll-flavor.hbs",
  },
};
preLocalize( "testTypes", { key: "label" } );