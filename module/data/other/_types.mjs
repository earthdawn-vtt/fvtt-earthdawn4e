/**
 * @import { DocumentUuid } from "../../_types.mjs";
 * @import { attributes } from "../../config/actors.mjs";
 */

// region Character Generation

/**
 * A single attribute's point-buy state during character generation.
 * @typedef CharacterGenerationAttributeData
 * @property {number} change The signed modifier applied to this attribute's base value
 * (bounded by {@link CharacterGenerationData.minAttributeModifier} and
 * {@link CharacterGenerationData.maxAttributeModifier}).
 * @property {number} cost The attribute-point cost of the current `change`.
 */

/**
 * The pool of ranks the character still has available to spend, split by category.
 * @typedef CharacterGenerationAvailableRanksData
 * @property {number} talent    Remaining talent ranks (adept class abilities).
 * @property {number} devotion  Remaining devotion ranks (questor class abilities).
 * @property {number} knowledge Remaining knowledge skill ranks.
 * @property {number} artisan   Remaining artisan skill ranks.
 * @property {number} general   Remaining general skill ranks.
 * @property {number} speak     Remaining ranks to spend on spoken languages.
 * @property {number} readWrite Remaining ranks to spend on read/written languages.
 */

/**
 * The chosen languages during character generation, grouped by proficiency.
 * @typedef CharacterGenerationLanguagesData
 * @property {Set<string>} speak     The languages the character can speak.
 * @property {Set<string>} readWrite The languages the character can read and write.
 */

/**
 * The system data model for {@link CharacterGenerationData}, holding all in-progress choices for
 * generating a new player character (namegiver, class, attributes, abilities, spells,
 * languages, equipment).
 * @typedef CharacterGenerationSystemData
 * @property {string} name The chosen character name.
 * @property {DocumentUuid|null} namegiver The UUID of the chosen namegiver item.
 * @property {boolean} isAdept `true` if a discipline was chosen (adept path),
 * `false` for a questor.
 * @property {DocumentUuid|null} selectedClass The UUID of the chosen class item (discipline or
 * questor).
 * @property {Record<keyof typeof attributes, CharacterGenerationAttributeData>} attributes Point-buy state per
 * attribute (keyed by the attribute id).
 * @property {Record<string, Record<DocumentUuid, number>>} abilities Chosen abilities and their
 * assigned ranks, grouped by category (`"optional"`, `"class"`, `"free"`, `"special"`,
 * `"artisan"`, `"knowledge"`, `"general"`, `"language"`, `"namegiver"`).
 * @property {CharacterGenerationAvailableRanksData} availableRanks The remaining ranks the
 * character can still assign, per rank category.
 * @property {Set<DocumentUuid>} spells The UUIDs of the chosen spells.
 * @property {CharacterGenerationLanguagesData} languages The chosen languages, grouped by
 * proficiency.
 * @property {Set<DocumentUuid>} equipment The UUIDs of the chosen starting equipment items.
 */

// endregion
