/**
 * @import { DocumentUuid } from "../../_types.mjs";
 * @import { MetricData } from "../common/metrics.mjs";
 * @import { CASTING_WORKFLOW_TYPES } from "../../workflows/workflow/spellcasting-workflow.mjs";
 */

// region Base Message

/**
 * The system data model for {@link BaseMessageData}, the abstract base for all system-specific
 * chat message data models. It defines no schema fields itself; concrete subclasses extend it and
 * declare their own schema.
 * @typedef {object} BaseMessageSystemData
 */

// endregion

// region Attack Message

/**
 * Successes tracking data for an attack, structured like a value/max resource so it can be used
 * with an HTML meter element.
 * @typedef AttackSuccessesData
 * @property {number} value The currently available successes (unspent).
 * @property {number} max   The total number of successes on the original attack roll.
 */

/**
 * The system data model for {@link AttackMessageData}, a chat message representing an attack roll.
 * @typedef {BaseMessageSystemData} _AttackMessageBase
 * {@ignore}
 * @property {AttackSuccessesData} successes The available/original successes of the attack.
 * @property {boolean} successful Whether the attack roll was successful.
 */

/**
 * @typedef {BaseMessageSystemData & _AttackMessageBase} AttackMessageSystemData
 */

// endregion

// region Damage Message

/**
 * A single damage transaction recorded on a damage message, representing damage dealt to one actor.
 * @typedef DamageTransactionData
 * @property {number|null} damage The amount of damage dealt in this transaction.
 * @property {DocumentUuid} dealtTo The UUID of the actor the damage was dealt to.
 * @property {number} timestamp Timestamp (ms since epoch) when the transaction occurred.
 */

/**
 * The system data model for {@link DamageMessageData}, a chat message representing a damage roll
 * and the transactions of damage it has been applied to.
 * @typedef {BaseMessageSystemData} _DamageMessageBase
 * {@ignore}
 * @property {DamageTransactionData[]} transactions All damage-applied transactions on this message.
 */

/**
 * @typedef {BaseMessageSystemData & _DamageMessageBase} DamageMessageSystemData
 */

// endregion

// region Initiative Message

/**
 * The system data model for {@link InitiativeMessageData}, a chat message representing an
 * initiative roll. Defines no additional schema fields on top of {@link BaseMessageSystemData}.
 * @typedef {BaseMessageSystemData} InitiativeMessageSystemData
 */

// endregion

// region Spellcasting Message

/**
 * The system data model for {@link SpellcastingMessageData}, a chat message representing the
 * casting of a spell. Defines no additional schema fields on top of {@link BaseMessageSystemData}.
 * @typedef {BaseMessageSystemData} SpellcastingMessageSystemData
 */

// endregion

// region Thread Weaving Message

/**
 * The system data model for {@link ThreadWeavingMessageData}, a chat message representing a
 * thread weaving roll.
 * @typedef {BaseMessageSystemData} _ThreadWeavingMessageBase
 * {@ignore}
 * @property {keyof typeof CASTING_WORKFLOW_TYPES} [castingMethod] The chosen casting workflow type.
 * @property {DocumentUuid|null} matrix The UUID of the spell matrix used for weaving, if any.
 * @property {DocumentUuid|null} grimoire The UUID of the grimoire used for weaving, if any.
 * @property {number} numThreadsWoven The number of threads woven in this roll.
 * @property {Record<string, MetricData>|null} extraThreads Extra thread contributions keyed by
 * metric type. May be `null` when unused.
 */

/**
 * @typedef {_ThreadWeavingMessageBase} ThreadWeavingMessageSystemData
 */

// endregion
