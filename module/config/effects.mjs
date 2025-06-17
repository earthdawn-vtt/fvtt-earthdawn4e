import { preLocalize } from "../utils.mjs";
import { armor, attributes, defense } from "./actors.mjs";
import { movementTypes } from "./quantities.mjs";


export const COMMON_EAE_CHANGES = {
  coverPartial: [
    {
      key:   "system.characteristics.defenses.physical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: +2,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: +2,
    },
  ],
  darknessPartial: [
    {
      key:   "system.globalBonuses.allTests.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -2,
    },
  ],
  darknessFull: [
    {
      key:   "system.globalBonuses.allTests.value",
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
      value: -4,
    },
  ],
  impairedLight: Object.entries(
    movementTypes
  ).map( ( [ key, label ] ) => {
    return {
      key:   `system.characteristics.movement.${key}`,
      value: -5,
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
    };
  } ),
  impairedHeavy: Object.entries(
    movementTypes
  ).map( ( [ key, label ] ) => {
    return {
      key:   `system.characteristics.movement.${key}`,
      value: -10,
      mode:  CONST.ACTIVE_EFFECT_MODES.ADD,
    };
  } ),
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
  allActions: {
    label:       "ED.Actor.GlobalBonus.allActions"
  },
  allAttacks: {
    label:       "ED.Actor.GlobalBonus.allAttacks"
  },
  allCloseAttacks: {
    label:       "ED.Actor.GlobalBonus.allCloseAttacks"
  },
  allDamage: {
    label:       "ED.Actor.GlobalBonus.allDamage"
  },
  allEffects: {
    label:       "ED.Actor.GlobalBonus.allEffects"
  },
  allKnockdownTests: {
    label:       "ED.Actor.GlobalBonus.allKnockdownTests"
  },
  allMeleeDamage: {
    label:       "ED.Actor.GlobalBonus.allMeleeDamage"
  },
  allRangedAttacks: {
    label:       "ED.Actor.GlobalBonus.allRangedAttacks"
  },
  allRangedDamage: {
    label:       "ED.Actor.GlobalBonus.allRangedDamage"
  },
  allRecoveryTests: {
    label:       "ED.Actor.GlobalBonus.allRecoveryTests"
  },
  allSpellcasting: {
    label:       "ED.Actor.GlobalBonus.allSpellcasting"
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
    label:           "ED.Data.Actor.Sentient.FIELDS.initiative.label",
    group:           "ED.ActiveEffect.ChangeKeys.Groups.initiative",
  },
  // encumbrance
  {
    value:          "system.encumbrance.value",
    label:          "ED.Data.Actor.Sentient.FIELDS.encumbrance.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
  },
  {
    value:          "system.encumbrance.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.encumbrance.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
  },
  {
    value:          "system.encumbrance.bonus",
    label:          "ED.Data.Actor.Sentient.FIELDS.encumbrance.bonus.label",
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
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.death.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.unconscious",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.unconscious.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.bloodMagic.damage",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health..bloodMagic.damage.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.bloodMagic",
  },
  {
    value:          "system.characteristics.health.bloodMagic.wounds",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.bloodMagic.wounds.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.bloodMagic",
  },
  {
    value:          "system.characteristics.health.woundThreshold",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.woundThreshold.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.wounds",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.wounds.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  {
    value:          "system.characteristics.health.maxWounds",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.maxWounds.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
  },
  // recovery
  {
    value:          "system.characteristics.recoveryTestsResource.value",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics..recoveryTestsResource.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.recoveryTestsResource",
  },
  {
    value:          "system.characteristics.recoveryTestsResource.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.recoveryTestsResource.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.recoveryTestsResource",
  },
  // karma
  {
    value:          "system.karma.value",
    label:          "ED.Data.Sentient.FIELDS.karma.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
  },
  {
    value:          "system.karma.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.karma.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
  },
  {
    value:          "system.karma.step",
    label:          "ED.Data.Actor.Sentient.FIELDS.karma.step.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
  },
  // devotion
  {
    value:          "system.devotion.value",
    label:          "ED.Data.Actor.Sentient.FIELDS.devotion.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
  },
  {
    value:          "system.devotion.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.devotion.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
  },
  {
    value:          "system.devotion.step",
    label:          "ED.Data.Actor.Sentient.FIELDS.devotion.step.label",
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
    label:          "ED.Data.Item.Rollable.FIELDS.rollType.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.rollable",
  },
  // Action
  {
    value:          "system.action",
    label:          "ED.Data.Item.Action.FIELDS.action.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.action",
  },
  {
    value:          "system.strain",
    label:          "ED.Data.Item.Action.FIELDS.strain.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.action",
  },
  // Targeting
  {
    value:          "system.difficulty.target",
    label:          "ED.Data.Item.Target.FIELDS.difficulty.target.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.targeting",
  },
  {
    value:          "system.difficulty.group",
    label:          "ED.Data.Item.Target.FIELDS.difficulty.group.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.targeting",
  },
  {
    value:          "system.difficulty.fixed",
    label:          "ED.Data.Item.Target.FIELDS.difficulty.fixed.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.targeting",
  },
  // Ability
  {
    value:          "system.attribute",
    label:          "ED.Data.Item.Ability.FIELDS.attribute.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.ability",
  },
  {
    value:          "system.tier",
    label:          "ED.Data.Item.Ability.FIELDS.tier.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.ability",
  },
  {
    value:          "system.level",
    label:          "ED.Data.Item.IncreasableAbility.FIELDS.level.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.ability",
  },
  // Armor
  {
    value:          "system.physical.armor",
    label:          "ED.Data.Item.Armor.FIELDS.physicalArmor.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.physical.forgeBonus",
    label:          "ED.Data.Item.Armor.FIELDS.physicalForgeBonus.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.mystical.armor",
    label:          "ED.Data.Item.Armor.FIELDS.mysticalArmor.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.mystical.forgeBonus",
    label:          "ED.Data.Item.Armor.FIELDS.mystical.forgeBonus.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.initiativePenalty",
    label:          "ED.Data.Item.Armor.FIELDS.initiativePenalty.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  // Shield
  {
    value:          "system.defenseBonus.physical",
    label:          "ED.Data.Item.Shield.FIELDS.defenseBonus.physical.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  {
    value:          "system.defenseBonus.mystical",
    label:          "ED.Data.Item.Shield.FIELDS.defenseBonus.mystical.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  {
    value:          "system.initiativePenalty",
    label:          "ED.Data.Item.Shield.FIELDS.initiativePenalty.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  {
    value:          "system.shatterThreshold",
    label:          "ED.Data.Item.Shield.FIELDS.shatterThreshold.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.shield",
  },
  // Weapon
  {
    value:          "system.damage.attribute",
    label:          "ED.Data.Item.Weapon.FIELDS.damage.attribute.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.damage.baseStep",
    label:          "ED.Data.Item.Weapon.FIELDS.damage.baseStep.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.damage.type",
    label:          "ED.Data.Item.Weapon.FIELDS.damage.type.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.forgeBonus",
    label:          "ED.Data.Item.Weapon.FIELDS.forgeBonus.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weapon",
  },
  {
    value:          "system.range.shortMin",
    label:          "ED.Data.Item.Weapon.FIELDS.range.shortMin.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
  {
    value:          "system.range.shortMax",
    label:          "ED.Data.Item.Weapon.FIELDS.range.shortMax.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
  {
    value:          "system.range.longMin",
    label:          "ED.Data.Item.Weapon.FIELDS.range.longMin.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
  {
    value:          "system.range.longMax",
    label:          "ED.Data.Item.Weapon.FIELDS.range.longMax.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.weaponRange",
  },
];
preLocalize( "eaeChangeKeysItem", { keys: [ "label", "group" ] } );