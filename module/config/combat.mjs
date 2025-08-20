import { preLocalize } from "../utils.mjs";


/**
 * The bonus to the damage step for each extra success on an attack roll.
 * @type {number}
 */
export const bonusDamagePerExtraSuccess = 2;

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
 * Configuration for a damage source type
 * @typedef {object} DamageSourceConfiguration
 * @property {string} label - Localized label for the damage source.
 * @property {string} damageType - Type of damage: "standard" or "stun", see {@link damageType}.
 * @property {boolean} ignoreArmor - Whether this damage type ignores armor.
 * @property {string|null} armorType - The armor type that protects from this damage, or null if no armor protects.
 * See {@link module:config~ACTORS~armorType}.
 */

/**
 * Available damage source types and their configurations for damage rolls.
 * @enum {DamageSourceConfiguration}
 */
export const damageSourceConfig = {
  arbitrary: {
    label:       "ED.Config.DamageSourceConfig.arbitrary",
    damageType:  "standard",
    ignoreArmor: false,
    armorType:   null,
  },
  drowning: {
    label:       "ED.Config.DamageSourceConfig.drowning",
    damageType:  "standard",
    ignoreArmor: true,
    armorType:   null,
  },
  falling: {
    label:       "ED.Config.DamageSourceConfig.falling",
    damageType:  "standard",
    ignoreArmor: true,
    armorType:   null,
  },
  fire: {
    label:       "ED.Config.DamageSourceConfig.fire",
    damageType:  "standard",
    ignoreArmor: false,
    armorType:   "physical",
  },
  poison: {
    label:       "ED.Config.DamageSourceConfig.poison",
    damageType:  "standard",
    ignoreArmor: true,
    armorType:   null,
  },
  spell: {
    label:       "ED.Config.DamageSourceConfig.spell",
    damageType:  undefined,
    ignoreArmor: false,
    armorType:   undefined,
  },
  suffocation: {
    label:       "ED.Config.DamageSourceConfig.suffocation",
    damageType:  "standard",
    ignoreArmor: true,
    armorType:   null,
  },
  unarmed: {
    label:       "ED.Config.DamageSourceConfig.unarmed",
    damageType:  "standard",
    ignoreArmor: false,
    armorType:   "physical",
  },
  warping: {
    label:       "ED.Config.DamageSourceConfig.warping",
    damageType:  "standard",
    ignoreArmor: false,
    armorType:   "mystical",
  },
  weapon: {
    label:       "ED.Config.DamageSourceConfig.weapon",
    damageType:  undefined,
    ignoreArmor: false,
    armorType:   undefined,
  },
};
preLocalize( "damageSourceConfig", { key: "label" } );

/**
 * Damage type
 * @enum {string}
 */
export const damageType = {
  standard:   "ED.Config.Health.damageStandard",
  stun:       "ED.Config.Health.damageStun",
};
preLocalize( "damageType" );

/**
 * Damage resistances
 * @enum {string}
 */
export const resistances = {
  fire:       "ED.Config.Resistances.fire",
};
preLocalize( "resistances" );

/**
 * Damage vulnerabilities
 * @enum {string}
 */
export const vulnerabilities = {
  fire:       "ED.Config.Vulnerabilities.fire",
};
preLocalize( "vulnerabilities" );