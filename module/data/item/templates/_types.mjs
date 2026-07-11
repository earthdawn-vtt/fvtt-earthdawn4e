/**
 * @import { DescriptionData, DocumentId, DocumentUuid, EdId, ValueProperty } from "../../_types.mjs";
 * @import { ConstraintData } from "../../common/restrict-require.mjs";
 * @import AdvancementData from "../../advancement/base-advancement.mjs";
 * @import TruePatternData from "../../thread/true-pattern.mjs";
 * @import { action, groupDifficulty, targetDifficulty } from "../../../config/actions.mjs";
 * @import { availability, denomination, itemStatus, weaponType } from "../../../config/items.mjs";
 * @import { tier } from "../../../config/legend.mjs";
 * @import { matrixTypes, spellcastingTypes } from "../../../config/magic.mjs";
 */

// region Item Description Template

/**
 * The item's description and summary and its Earthdawn ID.
 * @typedef ItemDescriptionTemplateData
 * @property {DescriptionData} description The item description as an HTML string.
 * @property {DescriptionData} summary A short summary of the item as an HTML string.
 * @property {EdId} edid The Earthdawn ID (edid) uniquely identifying this item across the system.
 */

// endregion

// region Rollable Template

/**
 * @typedef {"" | "ability" | "attack" | "damage" | "effect" | "initiative" | "knockdown"
 *   | "reaction" | "recovery" | "spellcasting" | "threadWeaving"} ItemRollType
 */

/**
 * Details for an "ability" roll.
 * @typedef RollTypeAbilityData
 */

/**
 * Details for an "attack" roll.
 * @typedef RollTypeAttackData
 * @property {Set<itemStatus>} weaponItemStatus Item statuses of weapons that are eligible for this attack.
 * @property {Set<weaponType>} weaponTypes Weapon types (e.g. melee, ranged) that are eligible for this attack.
 */

/**
 * Details for a "damage" roll.
 * @typedef RollTypeDamageData
 * @property {Set<weaponType>} combatType Weapon types (e.g. melee, ranged) that determine which weapons contribute to the
 * damage roll.
 */

/**
 * Details for an "effect" roll.
 * @typedef RollTypeEffectData
 */

/**
 * Details for an "initiative" roll.
 * @typedef RollTypeInitiativeData
 */

/**
 * Details for a "reaction" roll.
 * @typedef RollTypeReactionData
 * @property {targetDifficulty} defenseType The defense type used as the target for the reaction roll.
 */

/**
 * Details for a "recovery" roll.
 * @typedef RollTypeRecoveryData
 */

/**
 * Details for a "spellcasting" roll.
 * @typedef RollTypeSpellcastingData
 */

/**
 * Details for a "threadWeaving" roll.
 * @typedef RollTypeThreadWeavingData
 * @property {spellcastingTypes|null} castingType The spellcasting type this thread weaving ability uses.
 */

/**
 * Roll-type specific details. Only the sub-schema matching the currently selected {@link ItemRollType}
 * is meaningful, but all are always present on the schema.
 * @typedef RollTypeDetailsData
 * @property {RollTypeAbilityData} ability Details for an "ability" roll (currently no fields).
 * @property {RollTypeAttackData} attack Details for an "attack" roll.
 * @property {RollTypeDamageData} damage Details for a "damage" roll.
 * @property {RollTypeEffectData} effect Details for an "effect" roll (currently no fields).
 * @property {RollTypeInitiativeData} initiative Details for an "initiative" roll (currently no fields).
 * @property {RollTypeReactionData} reaction Details for a "reaction" roll.
 * @property {RollTypeReactionData} recovery Details for a "recovery" roll (currently no fields).
 * @property {RollTypeSpellcastingData} spellcasting Details for a "spellcasting" roll (currently no fields).
 * @property {RollTypeThreadWeavingData} threadWeaving Details for a "threadWeaving" roll.
 */

/**
 * Data shared by items that can be rolled.
 * @typedef RollableTemplateData
 * @property {ItemRollType} rollType Which type of roll this item performs by default.
 * @property {RollTypeDetailsData} rollTypeDetails Additional data for each supported roll type.
 */

// endregion

// region Action Template

/**
 * Data shared by items that represent an action, e.g., abilities and attack items.
 * @typedef _ActionData
 * {@ignore}
 * @property {action|null} action The action type, e.g. "standard", "simple", "free".
 * @property {number} strain The strain cost incurred when using this action.
 */

/**
 * @typedef {RollableTemplateData & _ActionData} ActionTemplateData
 * {@interface}
 */

// endregion

// region Targeting Template

/**
 * The difficulty settings for a target-based roll.
 * @typedef DifficultyData
 * @property {targetDifficulty} target The defense type of the target (e.g. "physical", "mystical", "social").
 * @property {groupDifficulty} group Group difficulty rule, e.g. "highestOfGroup" or "lowestX".
 * @property {number|null} fixed A fixed numeric difficulty that overrides target and group when > 0.
 */

/**
 * Data for items whose roll targets one or more actors.
 * @typedef TargetTemplateData
 * @property {DifficultyData} difficulty The difficulty settings used to determine the target number.
 */

// endregion

// region Learnable Template

/**
 * Marker template for items that can be learned through legend points. Does not add any schema fields;
 * behavior is provided through getters and static methods on the mixin.
 * @typedef LearnableTemplateData
 * {@interface}
 */

// endregion

// region LP Increase Template

/**
 * Marker template for items whose level can be increased through legend points. Does not add any schema
 * fields; behavior is provided through getters and static methods on the mixin.
 * @typedef LpIncreaseTemplateData
 * {@interface}
 */

// endregion

// region Ability Template

/**
 * Reference back to the class/discipline/questor/path that granted this ability.
 * @typedef AbilitySourceData
 * @property {DocumentId} class The id of the sibling class item that is the source of this ability.
 * @property {number|null} atLevel The level of the source class at which this ability was learned.
 */

/**
 * Additional data for ability-like items, on top of the action template.
 * @typedef _AbilityData
 * {@ignore}
 * @property {string} attribute The 3-letter attribute abbreviation used for the ability's roll.
 * @property {tier} tier The tier of the ability (e.g. "novice", "journeyman", "warden", "master").
 * @property {AbilitySourceData} source The source class information for this ability.
 */

/**
 * @typedef {ActionTemplateData & TargetTemplateData & LearnableTemplateData & _AbilityData} AbilityTemplateData
 * {@interface}
 */

// endregion

// region Increasable Ability Template

/**
 * Additional data for abilities whose level can be increased via LP.
 * @typedef _IncreasableAbilityData
 * {@ignore}
 * @property {number} level The current rank / level of the ability.
 */

/**
 * @typedef {AbilityTemplateData & LpIncreaseTemplateData & _IncreasableAbilityData} IncreasableAbilityTemplateData
 * {@interface}
 */

// endregion

// region Knack Template

/**
 * Data shared by knack items derived from a source talent, skill, or devotion.
 * @typedef _KnackData
 * {@ignore}
 * @property {EdId} sourceItem The edid of the source item (usually a talent) this knack derives from.
 * @property {number} minLevel The minimum rank of the source item required to learn this knack.
 * @property {number} [lpCost] Optional fixed legend point cost overriding the default per-tier cost.
 * @property {Record<string, ConstraintData>} requirements Additional requirements for learning this knack, keyed
 * by unique entry id.
 * @property {Record<string, ConstraintData>} restrictions Restrictions that must not apply for learning this knack,
 * keyed by unique entry id.
 */

/**
 * @typedef {LearnableTemplateData & TargetTemplateData & _KnackData} KnackTemplateData
 * {@interface}
 */

// endregion

// region Grimoire Template

/**
 * Data for a grimoire item. `null` if the item is not currently a grimoire.
 * @typedef GrimoireData
 * @property {Set<DocumentUuid>} spells The UUIDs of spells inscribed in the grimoire.
 * @property {DocumentUuid} owner The UUID of the actor that owns the grimoire.
 * @property {DocumentUuid|null} attunedSpell The UUID of the spell currently attuned from the grimoire, or `null` if none.
 */

/**
 * Data shared by items that can act as a grimoire.
 * @typedef GrimoireTemplateData
 * @property {GrimoireData|null} grimoire Grimoire data, or `null` when this item is not a grimoire.
 */

// endregion

// region Matrix Template

/**
 * Threads currently held by the matrix.
 * @typedef MatrixThreadsHoldData
 * @property {number} value The number of threads currently woven into the matrix.
 * @property {number} max The maximum number of threads the matrix can hold.
 */

/**
 * @typedef MatrixThreadsData
 * @property {MatrixThreadsHoldData} hold Threads held in the matrix.
 */

/**
 * Data for a matrix item. `null` if the item is not currently a matrix.
 * @typedef MatrixData
 * @property {matrixTypes} matrixType The type of matrix (e.g. "standard", "armored", "shared").
 * @property {number} level The rank of the matrix.
 * @property {number} damage The current damage on the matrix.
 * @property {number} deathRating The maximum damage the matrix can take before breaking.
 * @property {Set<DocumentId>} spells The ids of spells attuned to the matrix (must be on the same parent actor).
 * @property {DocumentId|null} activeSpell The id of the currently active attuned spell (must be on the same parent actor).
 * @property {MatrixThreadsData} threads Threads currently held in the matrix.
 */

/**
 * Data shared by items that can act as a matrix.
 * @typedef MatrixTemplateData
 * @property {MatrixData|null} matrix Matrix data, or `null` when this item is not a matrix.
 */

// endregion

// region Physical Item Template

/**
 * The item's price with denomination.
 * @typedef PriceData
 * @property {number} value Numeric price value.
 * @property {denomination} denomination Denomination of the price (e.g. "silver", "gold").
 */

/**
 * The item's weight and calculation options.
 * @typedef WeightData
 * @property {number} value The item's base weight.
 * @property {number} multiplier A multiplier applied when calculating total weight.
 * @property {boolean} calculated Whether the weight is calculated, e.g., for different namegiver sizes.
 */

/**
 * Additional data for physical items on top of grimoire and matrix templates.
 * @typedef _PhysicalItemData
 * {@ignore}
 * @property {PriceData} price The item's price with denomination.
 * @property {WeightData} weight The item's weight data.
 * @property {availability} availability The item's availability rating (e.g. "average", "rare").
 * @property {number} amount The number of units of this item.
 * @property {number} bloodMagicDamage Blood magic damage inflicted on the actor while this item is active.
 * @property {itemStatus} itemStatus Whether the item is owned, carried, or equipped.
 * @property {TruePatternData} truePattern The item's true pattern data (embedded).
 */

/**
 * @typedef {GrimoireTemplateData & MatrixTemplateData & _PhysicalItemData} PhysicalItemTemplateData
 * {@interface}
 */

// endregion

// region Class Template

/**
 * Additional data for class-like items (disciplines, paths, questors).
 * @typedef _ClassData
 * {@ignore}
 * @property {number} level The current circle / rank of the class.
 * @property {AdvancementData} advancement The embedded advancement data for this class.
 */

/**
 * @typedef {LearnableTemplateData & LpIncreaseTemplateData & _ClassData} ClassTemplateData
 * {@interface}
 */

// endregion