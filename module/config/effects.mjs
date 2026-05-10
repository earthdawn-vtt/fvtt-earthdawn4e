import { armor, attributes, defense } from "./actors.mjs";
import { movementTypes } from "./quantities.mjs";
import { preLocalize } from "../i18n/localization.mjs";


export const COMMON_EAE_CHANGES = {
  coverPartial: [
    {
      key:   "system.characteristics.defenses.physical.value",
      type:  "add",
      value: +2,
    },
    {
      key:   "system.characteristics.defenses.mystical.value",
      type:  "add",
      value: +2,
    },
  ],
  darknessPartial: [
    {
      key:   "system.globalModifiers.allTests.value",
      type:  "add",
      value: -2,
    },
  ],
  darknessFull: [
    {
      key:   "system.globalModifiers.allTests.value",
      type:  "add",
      value: -4,
    },
  ],
  impairedLight: Object.entries(
    movementTypes
  ).map( ( [ key, label ] ) => {
    return {
      key:   `system.characteristics.movement.${key}`,
      value: -5,
      type:  "add",
    };
  } ),
  impairedHeavy: Object.entries(
    movementTypes
  ).map( ( [ key, label ] ) => {
    return {
      key:   `system.characteristics.movement.${key}`,
      value: -10,
      type:  "add",
    };
  } ),
  noMovement: Object.entries(
    movementTypes
  ).map( ( [ key, label ] ) => {
    return {
      key:   `system.characteristics.movement.${key}`,
      value: 0,
      type:  "override",
    };
  } ),
};

/**
 * Document types that Active Effects can be embedded in.
 * @enum {{label:string}}
 */
export const eaeDocumentTypes = {
  Actor: {
    label: "DOCUMENT.Actor",
  },
  Item: {
    label: "DOCUMENT.Item",
  },
};
preLocalize( "eaeDocumentTypes", { key: "label" } );

/**
 * @enum {{label:string; hint: string}}
 * @see CONFIG.ActiveEffect.phases
 */
export const eaeChangePhases = {
  derived: {
    hint:  "ED.Config.Eae.ChangePhases.derived.hint",
    label: "ED.Config.Eae.ChangePhases.derived.label",
  },
};
preLocalize( "eaeChangePhases", { keys: [ "hint", "label" ] } );

/**
 * @enum {string}
 * @see CONST.ACTIVE_EFFECT_DURATION_UNITS
 */
export const eaeDurationTypes = {
  uses:       "ED.Config.Eae.DurationTypes.uses",
};
preLocalize( "eaeDurationTypes" );

/**
 * The time an executable effect is triggered.
 * @enum {FormSelectOption}
 */
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
 * The target an effect should be applied to if `transfer === true`.
 * @enum {FormSelectOption}
 */
export const eaeTransferTargets = {
  ability: {
    value: "ability",
    label: "ED.Config.Eae.TransferTargets.ability",
  },
  owner: {
    value: "owner",
    label: "ED.Config.Eae.TransferTargets.owner",
  },
  target: {
    value: "target",
    label: "ED.Config.Eae.TransferTargets.target",
  },
};
preLocalize( "eaeTransferTargets", { key: "label" } );

/**
 * Configuration data for Global Modifier
 * @typedef {object} GlobalModifierConfiguration
 * @property {string} label                               Localized label.
 * @property {{[key: string]: number|string}} [defaults]  Default values for this Attribute based on actor type.
 */

/**
 * @description The global modifier configurations
 * @enum { GlobalModifierConfiguration }
 */
export const globalModifiers = {
  allActions: {
    label:       "ED.Actor.GlobalModifier.allActions"
  },
  allAttacks: {
    label:       "ED.Actor.GlobalModifier.allAttacks"
  },
  allCloseAttacks: {
    label:       "ED.Actor.GlobalModifier.allCloseAttacks"
  },
  allDamage: {
    label:       "ED.Actor.GlobalModifier.allDamage"
  },
  allEffects: {
    label:       "ED.Actor.GlobalModifier.allEffects"
  },
  allKnockdownTests: {
    label:       "ED.Actor.GlobalModifier.allKnockdownTests"
  },
  allCloseDamage: {
    label:       "ED.Actor.GlobalModifier.allCloseDamage"
  },
  allRangedAttacks: {
    label:       "ED.Actor.GlobalModifier.allRangedAttacks"
  },
  allRangedDamage: {
    label:       "ED.Actor.GlobalModifier.allRangedDamage"
  },
  allRecoveryTests: {
    label:       "ED.Actor.GlobalModifier.allRecoveryTests"
  },
  allSpellcasting: {
    label:       "ED.Actor.GlobalModifier.allSpellcasting"
  },
  allSpellTests: {
    label:       "ED.Actor.GlobalModifier.allSpellTests"
  },
  allTests: {
    label:       "ED.Actor.GlobalModifier.allTests",
  },
};
preLocalize( "globalModifiers", { key: "label" } );

export const singleModifiers = {
  knockdownEffects: {
    label: "ED.Config.Eae.allKnockdownTests",
  },
};
preLocalize( "singleModifiers", { key: "label" } );

/**
 * @typedef {object} _ActiveEffectPhaseAssignment
 * @property {string} [phase] The phase in which the Active Effect should be applied to. Defaults
 * to the initial of {@link EarthdawnActiveEffectChangeData#phase}.
 */

/**
 * @typedef {FormSelectOption&_ActiveEffectPhaseAssignment} EaeChangeConfig
 * @property {string} value The change key, which is the value of the input field.
 * @description Prepared input data for human-readable change selection in Active Effects and
 * information on handling of a given key.
 */

/**
 * A list of select input options that map a human-readable label to the field path for the change.
 * @type {EaeChangeConfig[]}
 */
export const eaeChangeKeysActor = [
  ...Object.entries( globalModifiers ).map( ( [ key, { label } ] ) => {
    return {
      value:          `system.globalModifiers.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.globalModifiers",
      disabled:       false,
      selected:       false,
      rule:           false,
      phase:          "final",
    };
  } ),
  ...Object.entries( attributes ).map( ( [ key, { label } ] ) => {
    return {
      value:          `system.attributes.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.attributeValue",
      phase:          "initial",
    };
  } ),
  ...Object.entries( attributes ).map( ( [ key, { label } ] ) => {
    return {
      value:          `system.attributes.${key}.step`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.attributeStep",
      phase:          "derived",
    };
  } ),
  ...Object.entries( movementTypes ).map( ( [ key, label ] ) => {
    return {
      value:          `system.characteristics.movement.${key}`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.movement",
      phase:          "final",
    };
  } ),
  ...Object.entries( defense ).map( ( [ key, label ] ) => {
    return {
      value:          `system.characteristics.defenses.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.defense",
      phase:          "final",
    };
  } ),
  ...Object.entries( armor ).map( ( [ key, label ] ) => {
    return {
      value:          `system.characteristics.armor.${key}.value`,
      label:          label,
      group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
      phase:          "final",
    };
  } ),
  // initiative
  {
    value:           "system.initiative",
    label:           "ED.Data.Actor.Sentient.FIELDS.initiative.label",
    group:           "ED.ActiveEffect.ChangeKeys.Groups.initiative",
    phase:          "final",
  },
  // encumbrance
  // is a modifier for the value and max really needed? this heavily complicates data preparation
  /* {
    value:          "system.encumbrance.value",
    label:          "ED.Data.Actor.Sentient.FIELDS.encumbrance.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
    phase:          "derived",
  },
  {
    value:          "system.encumbrance.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.encumbrance.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
    phase:          "final",
  }, */
  {
    value:          "system.encumbrance.bonus",
    label:          "ED.Data.Actor.Sentient.FIELDS.encumbrance.bonus.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.encumbrance",
    phase:          "derived",
  },
  // movement
  {
    value:          "system.jumpUpStep",
    label:          "ED.Data.Actor.Sentient.FIELDS.jumpUpStep.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.movement",
    phase:          "final",
  },
  {
    value:          "system.knockdownStep",
    label:          "ED.Data.Actor.Sentient.FIELDS.knockdownStep.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.movement",
    phase:          "final",
  },
  // health
  {
    value:          "system.durabilityBonus",
    label:          "ED.Data.Actor.Pc.FIELDS.durabilityBonus.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
    phase:          "initial",
  },
  {
    value:          "system.characteristics.health.death",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.death.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
    phase:          "final",
  },
  {
    value:          "system.characteristics.health.unconscious",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.unconscious.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
    phase:          "derived",
  },
  {
    value:          "system.characteristics.health.bloodMagic.damage",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.bloodMagic.damage.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.bloodMagic",
    phase:          "derived",
  },
  {
    value:          "system.characteristics.health.bloodMagic.wounds",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.bloodMagic.wounds.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.bloodMagic",
    phase:          "final",
  },
  {
    value:          "system.characteristics.health.woundThreshold",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.woundThreshold.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
    phase:          "final",
  },
  {
    value:          "system.characteristics.health.wounds",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.wounds.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
    phase:          "final",
  },
  {
    value:          "system.characteristics.health.maxWounds",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.health.maxWounds.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.health",
    phase:          "final",
  },
  // recovery
  {
    value:          "system.characteristics.recoveryTestsResource.value",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.recoveryTestsResource.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.recoveryTestsResource",
    phase:          "final",
  },
  {
    value:          "system.characteristics.recoveryTestsResource.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.recoveryTestsResource.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.recoveryTestsResource",
    phase:          "final",
  },
  {
    value:          "system.characteristics.recoveryTestsResource.step",
    label:          "ED.Data.Actor.Sentient.FIELDS.characteristics.recoveryTestsResource.step.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.recoveryTestsResource",
    phase:          "final",
  },
  // karma
  {
    value:          "system.karma.value",
    label:          "ED.Data.Actor.Sentient.FIELDS.karma.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
    phase:          "final",
  },
  {
    value:          "system.karma.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.karma.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
    phase:          "final",
  },
  {
    value:          "system.karma.step",
    label:          "ED.Data.Actor.Sentient.FIELDS.karma.step.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.karma",
    phase:          "final",
  },
  // devotion
  {
    value:          "system.devotion.value",
    label:          "ED.Data.Actor.Sentient.FIELDS.devotion.value.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
    phase:          "final",
  },
  {
    value:          "system.devotion.max",
    label:          "ED.Data.Actor.Sentient.FIELDS.devotion.max.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
    phase:          "final",
  },
  {
    value:          "system.devotion.step",
    label:          "ED.Data.Actor.Sentient.FIELDS.devotion.step.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.devotion",
    phase:          "final",
  },
];
preLocalize( "eaeChangeKeysActor", { keys: [ "label", "group" ] } );

/**
 * All change configs for actors indexed by the modified data model key.
 * @type {Record<string,EaeChangeConfig>}
 */
export const eaeActorChangeConfigByKey = eaeChangeKeysActor.reduce( ( acc, changeConfig ) => {
  acc[changeConfig.value] = changeConfig;
  return acc;
}, {} );

/**
 * A list of select input options that map a human-readable label to the field path for the change.
 * @type {EaeChangeConfig[]}
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
    label:          "ED.Data.Item.Armor.FIELDS.physical.armor.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.physical.forgeBonus",
    label:          "ED.Data.Item.Armor.FIELDS.physical.forgeBonus.label",
    group:          "ED.ActiveEffect.ChangeKeys.Groups.armor",
  },
  {
    value:          "system.mystical.armor",
    label:          "ED.Data.Item.Armor.FIELDS.mystical.armor.label",
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

/**
 * All available change keys indexed by the document type the effect modifies.
 * @type {{Actor: Array<EaeChangeConfig>, Item: Array<EaeChangeConfig>}}
 */
export const eaeChangeKeys = {
  Actor: eaeChangeKeysActor,
  Item:  eaeChangeKeysItem,
};