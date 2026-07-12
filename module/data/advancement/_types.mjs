/**
 * @import { AdvancementLevelData } from "./advancement-level.mjs";
 * @import { DocumentId, DocumentUuid, Identifier } from "../../_types.mjs";
 * @import { tier, abilityPools } from "../../config/legend.mjs";
 */

// region Advancement Level

/**
 * The system data model for {@link AdvancementLevelData}, representing a single level within an
 * {@link AdvancementData advancement track} of a class-like item (discipline, path, questor).
 * @typedef AdvancementLevelSystemData
 * @property {Identifier} identifier A stable custom identifier for this level.
 * @property {number} level The numeric level (1-based) this level represents.
 * @property {keyof typeof tier} tier The tier this level belongs to (e.g. "novice", "journeyman").
 * @property {Record<keyof typeof abilityPools, Set<DocumentUuid>>} abilities Ability UUIDs learned at this level,
 * grouped by ability pool.
 * @property {Set<DocumentUuid>} effects UUIDs of active effects applied at this level.
 * @property {number} resourceStep The step value used for resource (devotion, karma) rolls granted by this level.
 */

// endregion

// region Advancement

/**
 * A map from level number to {@link AdvancementLevelSystemData level data}.
 * @typedef {Record<number, AdvancementLevelData>} AdvancementLevels
 */

/**
 * The system data model for {@link AdvancementData}, representing the advancement track of a class-like item
 * (discipline, path, questor).
 * @typedef AdvancementSystemData
 * @property {AdvancementLevels} levels The levels of this advancement, keyed by level number.
 * @property {Record<keyof typeof tier, Set<DocumentUuid>>} abilityOptions UUIDs of abilities available to be learned at
 * each tier.
 * @property {Record<DocumentUuid, number>} learnedOptions Map of UUIDs of learned ability options to the level
 * at which they were learned.
 */

// endregion

// region LP Transactions

/**
 * Base data shared by all LP transactions.
 * @typedef LpTransactionBaseData
 * @property {string} id A random ID identifying this transaction. See {@link foundry.utils.randomID}.
 * @property {"earnings"|"spendings"} type The type of transaction.
 * @property {number} amount The amount of Legend Points involved in the transaction.
 * @property {number} date Timestamp (ms since epoch) when the transaction occurred.
 * @property {string} description A free-form description of the transaction.
 */

/**
 * The system data model for {@link LpTransactionData}, the abstract base for LP transactions.
 * @typedef {LpTransactionBaseData} LpTransactionSystemData
 * {@interface}
 */

/**
 * The system data model for {@link LpEarningTransactionData}, an LP earning transaction.
 * @typedef {LpTransactionBaseData} LpEarningTransactionSystemData
 * {@interface}
 */

/**
 * Before/after value pair for an LP spending transaction.
 * @typedef LpSpendingValueData
 * @property {number|null} before The value (e.g. circle, rank) before the spending.
 * @property {number|null} after The value (e.g. circle, rank) after the spending.
 */

/**
 * Additional data for {@link LpSpendingTransactionData}, on top of the base LP transaction data.
 * @typedef _LpSpendingTransactionData
 * {@ignore}
 * @property {string} entityType What this spending was applied to (e.g. "talent", "skill", "attribute").
 * @property {string} name The display name of the item that was leveled or acquired.
 * @property {LpSpendingValueData} value The before/after values (e.g. level, rank).
 * @property {DocumentId|null} itemId Sibling document id of the item this spending is associated with.
 */

/**
 * The system data model for {@link LpSpendingTransactionData}.
 * @typedef {LpTransactionBaseData & _LpSpendingTransactionData} LpSpendingTransactionSystemData
 * {@interface}
 */

// endregion

// region LP Tracking

/**
 * The system data model for {@link LpTrackingData}, tracking all LP earnings and spendings for an actor.
 * @typedef LpTrackingSystemData
 * @property {LpEarningTransactionSystemData[]} earnings All LP earning transactions.
 * @property {LpSpendingTransactionSystemData[]} spendings All LP spending transactions.
 */

// endregion
