/**
 * @import { DocumentUuid } from "../../_types.mjs";
 */

// region Combatant

/**
 * The system data model for {@link CombatantData}, the system-specific data attached to a
 * combatant in an active combat encounter.
 * @typedef CombatantSystemData
 * @property {DocumentUuid|null} replacementEffect UUID of an embedded item that replace the initiative step, if any.
 * @property {Set<DocumentUuid>} increaseAbilities UUIDs of embedded items that increase the combatant's
 * initiative step, if any.
 * @property {boolean} savePromptSettings Whether the combatant's prompt/dialog settings should
 * be persisted between rolls in this encounter.
 * @property {boolean} keepInitiative Whether the combatant should keep its rolled initiative
 * between rounds instead of re-rolling.
 */

// endregion
