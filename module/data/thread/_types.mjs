/**
 * @import { DocumentUuid } from "../../_types.mjs";
 * @import { tier } from "../../config/legend.mjs";
 */

// region Thread Item Level

/**
 * The key knowledge question/answer pair for a single thread item level.
 * @typedef ThreadItemLevelKeyKnowledgeData
 * @property {string} question The key knowledge question the character must answer to unlock
 * this level.
 * @property {string} answer   The answer to the key knowledge question.
 * @property {boolean} isKnown Whether the player has discovered the key knowledge for this level.
 */

/**
 * The system data model for {@link ThreadItemLevelData}, a single rank/level of a thread item
 * embedded in a {@link TruePatternData}.
 * @typedef ThreadItemLevelSystemData
 * @property {number} level                            The sequential level number (1-based) of
 * this thread item rank.
 * @property {boolean} knownToPlayer                   Whether this rank has been revealed to
 * the player.
 * @property {ThreadItemLevelKeyKnowledgeData} keyKnowledge The key knowledge required to unlock
 * this rank.
 * @property {string} deed                             The deed associated with this rank, if any.
 * @property {string} effect                           A description of the mechanical or
 * narrative effect this rank grants.
 * @property {Set<DocumentUuid>} activeEffects         UUIDs of {@link ActiveEffect} documents
 * granted when this rank is active.
 * @property {Set<DocumentUuid>} abilities             UUIDs of embedded ability item documents
 * granted when this rank is active.
 */

// endregion

// region True Pattern

/**
 * The system data model for {@link TruePatternData}, an embedded document representing a true
 * pattern attached to an actor or item. Can act as a pattern item, a thread item (with
 * {@link ThreadItemLevelSystemData} ranks), or a group pattern depending on its parent document.
 * @typedef TruePatternSystemData
 * @property {number} mysticalDefense                                   The mystical defense
 * rating of the true pattern.
 * @property {number} maxThreads                                        The maximum number of
 * threads that can be attached to this true pattern.
 * @property {keyof typeof tier} tier                                   The tier of the true pattern.
 * @property {DocumentUuid|null} enchantmentPattern                     UUID of the associated
 * enchantment pattern item, if any.
 * @property {Record<number, ThreadItemLevelSystemData>|null} threadItemLevels A map of
 * level number → {@link ThreadItemLevelSystemData} for thread items. `null` when this true
 * pattern is not a thread item.
 * @property {Set<DocumentUuid>} attachedThreads                        UUIDs of thread item documents
 * currently attached to this true pattern.
 * @property {boolean} knownToPlayer                                    Whether the existence of
 * this true pattern is known to the player.
 */

// endregion

