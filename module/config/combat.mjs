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
 * The types of damage that can be rolled
 * @enum {string}
 */
export const damageSourceType = {
  arbitrary:   "ED.Config.DamageSourceType.arbitrary",
  drowning:    "ED.Config.DamageSourceType.drowning",
  falling:     "ED.Config.DamageSourceType.falling",
  fire:        "ED.Config.DamageSourceType.fire",
  poison:      "ED.Config.DamageSourceType.poison",
  spell:       "ED.Config.DamageSourceType.spell",
  suffocation: "ED.Config.DamageSourceType.suffocation",
  unarmed:     "ED.Config.DamageSourceType.unarmed",
  warping:     "ED.Config.DamageSourceType.warping",
  weapon:      "ED.Config.DamageSourceType.weapon",
};
preLocalize( "damageSourceType" );

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