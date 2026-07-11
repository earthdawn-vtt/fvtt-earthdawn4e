/**
 * @import { StepProperty, ValueProperty } from "../_types.mjs";
 * @import LpTrackingData from "../advancement/lp-tracking.mjs";
 * @import {
 *   AttributeId,
 *   CommonTemplateData,
 *   NamegiverTemplateData,
 *   NoneCharacterData,
 *   SentientTemplateData,
 * } from "./templates/_types.mjs";
 */

/**
 * A single PC attribute, extending the common attribute data with values used for
 * character generation, attribute increases, and the current derived value.
 * @typedef _PcAttributeData
 * {@ignore}
 * @property {number} initialValue The initial value from character generation. It is only affected
 * by character generation and not by attribute increases.
 * @property {number} timesIncreased The number of times this attribute has been increased with LP.
 */

/**
 * @typedef {_PcAttributeData & ValueProperty & StepProperty} PcAttributeData
 * {@interface}
 */

/**
 * The attributes of a PC, keyed by attribute id.
 * @typedef {Record<AttributeId, PcAttributeData>} PcAttributesData
 * {@interface}
 */

/**
 * Additional data for PC actors on top of the namegiver template.
 * @typedef _PcData
 * {@ignore}
 * @property {PcAttributesData} attributes The PC's attributes with initial value, times increased,
 * and derived value/step.
 * @property {number} durabilityBonus A bonus multiplier for the actor's durability, applied on
 * top of the highest durability item.
 * @property {LpTrackingData} lp Tracking of earned and spent legend points.
 */

/**
 * The system data model for player characters (PCs).
 * @typedef {NamegiverTemplateData & _PcData} PcSystemData
 * {@interface}
 */

/**
 * The system data model for non-player characters (NPCs).
 * @typedef {NamegiverTemplateData & NoneCharacterData} NpcSystemData
 * {@interface}
 */

/**
 * The system data model for creatures.
 * @typedef {SentientTemplateData & NoneCharacterData} CreatureSystemData
 * {@interface}
 */

/**
 * The system data model for dragons.
 * @typedef {SentientTemplateData & NoneCharacterData} DragonSystemData
 * {@interface}
 */

/**
 * The system data model for spirits.
 * @typedef {SentientTemplateData & NoneCharacterData} SpiritSystemData
 * {@interface}
 */

/**
 * The system data model for horrors.
 * @typedef {SentientTemplateData & NoneCharacterData} HorrorSystemData
 * {@interface}
 */

/**
 * The system data model for groups and organizations.
 * @typedef {CommonTemplateData} GroupSystemData
 * {@interface}
 */

/**
 * The system data model for loot piles.
 * @typedef {CommonTemplateData} LootSystemData
 * {@interface}
 */

/**
 * The system data model for traps.
 * @typedef {CommonTemplateData} TrapSystemData
 * {@interface}
 */

/**
 * The system data model for vehicles.
 * @typedef {CommonTemplateData} VehicleSystemData
 * {@interface}
 */
