import { preLocalize } from "../utils.mjs";
import { armor, attributes, defense } from "./actors.mjs";
import { movementTypes } from "./quantities.mjs";


export const COMMON_EAE_CHANGES = {
  noMovement: Object.entries(
    movementTypes
  ).map( ( [ key, label ] ) => {
    return {
      key:   `system.characteristics.movement.${key}`,
      value: 0,
      mode:  CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
    };
  } ),
};

/**
 * Indicates how the duration of an effect is determined, via real time, combat time, or times used.
 * @enum {string}
 */
export const eaeDurationTypes = {
  combat:     "ED.Config.Eae.DurationTypes.combat",
  permanent:  "ED.Config.Eae.DurationTypes.permanent",
  realTime:   "ED.Config.Eae.DurationTypes.realTime",
  uses:       "ED.Config.Eae.DurationTypes.uses",
};
preLocalize( "eaeDurationTypes" );

export const eaeExecutionTime = {
  combatStart: {
    value: "combatStart",
    label: "ED.Config.Eae.ExecutionTime.combatStart",
    group: "ED.Config.Eae.ExecutionTime.Groups.combat",
  },
  combatEnd: {
    value: "combatEnd",
    label: "ED.Config.Eae.ExecutionTime.combatEnd",
    group: "ED.Config.Eae.ExecutionTime.Groups.combat",
  },
  roundStart: {
    value: "roundStart",
    label: "ED.Config.Eae.ExecutionTime.roundStart",
    group: "ED.Config.Eae.ExecutionTime.Groups.round",
  },
  roundEnd: {
    value: "roundEnd",
    label: "ED.Config.Eae.ExecutionTime.roundEnd",
    group: "ED.Config.Eae.ExecutionTime.Groups.round",
  },
  turnStart: {
    value: "turnStart",
    label: "ED.Config.Eae.ExecutionTime.turnStart",
    group: "ED.Config.Eae.ExecutionTime.Groups.turn",
  },
  turnEnd: {
    value: "turnEnd",
    label: "ED.Config.Eae.ExecutionTime.turnEnd",
    group: "ED.Config.Eae.ExecutionTime.Groups.turn",
  },
};
preLocalize( "eaeExecutionTime", { keys: [ "label", "group" ] } );

/**
 * Configuration data for Global Bonuses
 * @typedef {object} GlobalBonusConfiguration
 * @property {string} label                               Localized label.
 * @property {{[key: string]: number|string}} [defaults]  Default values for this Attribute based on actor type.
 */

/**
 * @description The global bonus configurations
 * @enum { GlobalBonusConfiguration }
 */
export const globalBonuses = {
  allAttacks: {
    label:       "ED.Actor.GlobalBonus.allAttacks"
  },
  allEffects: {
    label:       "ED.Actor.GlobalBonus.allEffects"
  },
  allActions: {
    label:       "ED.Actor.GlobalBonus.allActions"
  },
  allRangedAttacks: {
    label:       "ED.Actor.GlobalBonus.allRangedAttacks"
  },
  allCloseAttacks: {
    label:       "ED.Actor.GlobalBonus.allCloseAttacks"
  },
  allSpellcasting: {
    label:       "ED.Actor.GlobalBonus.allSpellcasting"
  },
  allDamage: {
    label:       "ED.Actor.GlobalBonus.allDamage"
  },
  allMeleeDamage: {
    label:       "ED.Actor.GlobalBonus.allMeleeDamage"
  },
  allRangedDamage: {
    label:       "ED.Actor.GlobalBonus.allRangedDamage"
  },
  allRecoveryTests: {
    label:       "ED.Actor.GlobalBonus.allRecoveryTests"
  },
  allKnockdownTests: {
    label:       "ED.Actor.GlobalBonus.allKnockdownTests"
  },
  allSpellTests: {
    label:       "ED.Actor.GlobalBonus.allSpellTests"
  },
  allTests: {
    label:       "ED.Actor.GlobalBonus.allTests",
  },
};
preLocalize( "globalBonuses", { key: "label" } );

export const singleBonuses = {
  knockdownEffects: {
    label: "ED.Config.Eae.allKnockdownTests",
  },
};
preLocalize( "singleBonuses", { key: "label" } );

/**
 * A list of select input options that map a human-readable label to the field path for the change.
 * @type {FormSelectOption[]}
 */
export const eaeChangeKeysActor = [
  ...Object.entries( globalBonuses ).map( ( [ key, { label } ] ) => {
    return {
      value:          `system.globalBonuses.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.globalBonuses",
      disabled:       false,
      selected:       false,
      rule:           false,
      applyIteration: 0,
    };
  } ),
  ...Object.entries( attributes ).map( ( [ key, { label } ] ) => {
    return {
      value:          `system.attributes.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.attributeValue",
      applyIteration: 0,
    };
  } ),
  ...Object.entries( attributes ).map( ( [ key, { label } ] ) => {
    return {
      value:          `system.attributes.${key}.step`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.attributeStep",
      applyIteration: 1,
    };
  } ),
  ...Object.entries( movementTypes ).map( ( [ key, label ] ) => {
    return {
      value:          `system.characteristics.movement.${key}`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.movement",
      applyIteration: 0,
    };
  } ),
  ...Object.entries( defense ).map( ( [ key, label ] ) => {
    return {
      value:          `system.characteristics.defenses.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.defense",
      applyIteration: 1,
    };
  } ),
  ...Object.entries( armor ).map( ( [ key, label ] ) => {
    return {
      value:          `system.characteristics.armor.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
      applyIteration: 1,
    };
  } ),
  // initiative
  {
    value:           "system.initiative",
    label:           "ED.Data.Actor.Labels.initiative",
    group:           "ED.ActiveEffect.ChangeKeys.Groups.initiative",
  },
  // encumbrance
  {
    value:          "system.encumbrance.value",
    label:          "ED.Data.Actor.Labels.encumbrance",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
  },
  {
    value:          "system.encumbrance.max",
    label:          "ED.Data.Actor.Labels.encumbranceMax",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
  },
  {
    value:          "system.encumbrance.bonus",
    label:          "ED.Data.Actor.Labels.encumbranceBonus",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
  },
  // health
  {
    value:          "system.durabilityBonus",
    label:          "ED.Data.Actor.Labels.durabilityBonus",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.death",
    label:          "ED.Data.Actor.Labels.Characteristics.deathRating",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.unconscious",
    label:          "ED.Data.Actor.Labels.Characteristics.unconsciousRate",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.bloodMagic.damage",
    label:          "ED.Data.Actor.Labels.Characteristics.bloodMagicDamage",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.bloodMagic",
  },
  {
    value:          "system.characteristics.health.bloodMagic.wounds",
    label:          "ED.Data.Actor.Labels.Characteristics.bloodMagicWounds",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.bloodMagic",
  },
  {
    value:          "system.characteristics.health.woundThreshold",
    label:          "ED.Data.Actor.Labels.Characteristics.woundThreshold",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.wounds",
    label:          "ED.Data.Actor.Labels.Characteristics.wounds",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.maxWounds",
    label:          "ED.Data.Actor.Labels.Characteristics.maxWounds",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  // recovery
  {
    value:          "system.characteristics.recoveryTestsResource.value",
    label:          "ED.Data.Actor.Labels.Characteristics.recoveryTestsCurrent",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.recoveryTestsResource",
  },
  {
    value:          "system.characteristics.recoveryTestsResource.max",
    label:          "ED.Data.Actor.Labels.Characteristics.recoveryTestsMax",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.recoveryTestsResource",
  },
  // karma
  {
    value:          "system.karma.value",
    label:          "ED.Data.Actor.Labels.karma",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
  },
  {
    value:          "system.karma.max",
    label:          "ED.Data.Actor.Labels.karmaMax",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
  },
  {
    value:          "system.karma.step",
    label:          "ED.Data.Actor.Labels.karmaStep",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
  },
  // devotion
  {
    value:          "system.devotion.value",
    label:          "ED.Data.Actor.Labels.devotion",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
  },
  {
    value:          "system.devotion.max",
    label:          "ED.Data.Actor.Labels.devotionMax",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
  },
  {
    value:          "system.devotion.step",
    label:          "ED.Data.Actor.Labels.devotionStep",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
  },
];
preLocalize( "eaeChangeKeysActor", { keys: [ "label", "group" ] } );

/**
 * A list of select input options that map a human-readable label to the field path for the change.
 * @type {FormSelectOption[]}
 */
export const eaeChangeKeysItem = [
  // Rollable
  {
    value:          "system.rollType",
    label:          "ED.Data.General.Labels.Rollable.type",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.rollable",
  },
  // Action
  {
    value:          "system.action",
    label:          "ED.Data.Item.Labels.Action.action",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.action",
  },
  {
    value:          "system.strain",
    label:          "ED.Data.Item.Labels.Action.strain",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.action",
  },
  // Targeting
  {
    value:          "system.difficulty.target",
    label:          "ED.Data.General.Labels.Target.target",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.targeting",
  },
  {
    value:          "system.difficulty.group",
    label:          "ED.Data.General.Labels.Target.group",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.targeting",
  },
  {
    value:          "system.difficulty.fixed",
    label:          "ED.Data.General.Labels.Target.fixed",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.targeting",
  },
  // Ability
  {
    value:          "system.attribute",
    label:          "ED.Data.Item.Labels.Ability.attribute",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.ability",
  },
  {
    value:          "system.tier",
    label:          "ED.Data.Item.Labels.Ability.tier",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.ability",
  },
  {
    value:          "system.level",
    label:          "ED.Data.Item.Labels.Ability.rank",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.ability",
  },
  // Armor
  {
    value:          "system.physical.armor",
    label:          "ED.Data.Item.Labels.Armor.physicalArmor",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.physical.forgeBonus",
    label:          "ED.Data.Item.Labels.Armor.forgeBonusPhysical",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.mystical.armor",
    label:          "ED.Data.Item.Labels.Armor.mysticalArmor",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.mystical.forgeBonus",
    label:          "ED.Data.Item.Labels.Armor.forgeBonusMystical",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.initiativePenalty",
    label:          "ED.Data.Item.Labels.Armor.initiativePenalty",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  // Shield
  {
    value:          "system.defenseBonus.physical",
    label:          "ED.Data.Item.Labels.Shields.defenseBonusPhysical",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  {
    value:          "system.defenseBonus.mystical",
    label:          "ED.Data.Item.Labels.Shields.defenseBonusMystical",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  {
    value:          "system.initiativePenalty",
    label:          "ED.Data.Item.Labels.Shields.initiativePenalty",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  {
    value:          "system.shatterThreshold",
    label:          "ED.Data.Item.Labels.Shields.shatterThreshold",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  // Weapon
  {
    value:          "system.damage.attribute",
    label:          "ED.Data.Item.Labels.Weapons.damageAttribute",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.damage.baseStep",
    label:          "ED.Data.Item.Labels.Weapons.damageBaseStep",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.damage.type",
    label:          "ED.Data.Item.Labels.Weapons.damageType",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.forgeBonus",
    label:          "ED.Data.Item.Labels.Weapons.forgeBonus",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.range.shortMin",
    label:          "ED.Data.Item.Labels.Weapons.rangeShortMin",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
  {
    value:          "system.range.shortMax",
    label:          "ED.Data.Item.Labels.Weapons.rangeShortMax",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
  {
    value:          "system.range.longMin",
    label:          "ED.Data.Item.Labels.Weapons.rangeLongMin",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
  {
    value:          "system.range.longMax",
    label:          "ED.Data.Item.Labels.Weapons.rangeLongMax",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
];
preLocalize( "eaeChangeKeysItem", { keys: [ "label", "group" ] } );