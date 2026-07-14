/**
 * @import { DocumentUuid } from "../../_types.mjs";
 * @import { RollModifiers, RollStepData, RollResourceData, RollTargetData, RollStrainData } from "../../_types.mjs";
 * @import { FlavorTemplateData } from "../../dice/ed-roll.mjs";
 */

// region Base Ed Roll Options

/**
 * Initialization data accepted by {@link EdRollOptions.fromData} / {@link EdRollOptions.fromActor}.
 * All fields are optional; missing values will be initialized to defaults or derived automatically.
 * @typedef EdRollOptionsInitializationData
 * @property {RollStepData} [step] The step data for the roll. Can be omitted if to be initialized
 * automatically.
 * @property {RollTargetData} [target] The target data for the roll. Can be omitted if to be
 * initialized automatically.
 * @property {RollStrainData} [strain] The strain data for the roll. Can be omitted if to be
 * initialized automatically.
 * @property {RollResourceData} [karma] The karma data for the roll. Can be omitted to initialize
 * to default.
 * @property {RollResourceData} [devotion] The devotion data for the roll. Can be omitted to
 * initialize to default.
 * @property {Record<string, number>} [extraDice] Extra dice that are added to the roll. Keys are
 * localized labels, values are the number of dice.
 * @property {FlavorTemplateData} [flavor] Optional flavor data for chat rendering.
 */

/**
 * Base successes data attached to a roll (may be `null` when unused).
 * @typedef EdRollSuccessesData
 * @property {number|null} guaranteed  Successes that are always counted.
 * @property {number|null} additionalExtra  Successes that are only counted if extra successes
 * are rolled.
 */

/**
 * The system data model for {@link EdRollOptions}, the base options used to configure an
 * {@link EdRoll}. Subclasses extend this with roll-type specific fields.
 * @typedef EdRollOptionsSystemData
 * @property {RollStepData} step Everything related to the step of the action - mods, bonuses,
 * mali, etc.
 * @property {RollResourceData|null} karma Available karma, karma dice and used karma.
 * @property {RollResourceData|null} devotion Available devotion, devotion die, devotion die used
 * and used devotion.
 * @property {Record<string, number>} extraDice Extra dice that are added to the roll. Keys are
 * localized labels, values are the number of dice.
 * @property {RollTargetData|null} target All information about the targets array: defenses,
 * number, resistance, public visibility, tokens.
 * @property {RollStrainData|null} strain How much strain this roll will cost.
 * @property {string} chatFlavor The text that is added to the ChatMessage when this roll is put
 * to chat.
 * @property {DocumentUuid|null} rollingActorUuid The UUID of the actor performing the roll.
 * @property {"action"|"effect"|"arbitrary"} testType The type of the test.
 * @property {string|null} rollType The type of the roll (see `ROLLS.rollTypes`).
 * @property {EdRollSuccessesData|null} successes Predefined successes for this roll.
 * @property {boolean} _dummy Whether this roll is a dummy roll that has no mechanical effect or
 * meaningful content.
 */

// endregion

// region Ability Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} AbilityRollOptionsInitializationData
 * @property {object} [ability] The ability being rolled. Must have `rankFinal` in its `system`
 * data. Can be omitted if `abilityUuid` is provided.
 * @property {DocumentUuid} [abilityUuid] The UUID of the ability being rolled. Can be omitted if
 * `ability` is provided.
 */

/**
 * The system data model for {@link AbilityRollOptions}, roll options for ability rolls.
 * @typedef {EdRollOptionsSystemData} _AbilityRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid} abilityUuid The UUID of the ability being rolled (embedded Item).
 */

/**
 * @typedef {_AbilityRollOptionsBase} AbilityRollOptionsSystemData
 */

// endregion

// region Attack Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} EdAttackRollOptionsInitializationData
 * @property {object} [weapon] The weapon used for the attack. Can be omitted if `weaponUuid` is
 * provided.
 * @property {DocumentUuid} [weaponUuid] The UUID of the weapon used for the attack (embedded
 * Item). Can be omitted if `weapon` is provided.
 * @property {object|null} [attackAbility] The ability used for the attack. `null` if no ability
 * is used (substitute via attribute), or omitted if `attackAbilityUuid` is provided.
 * @property {DocumentUuid|null} [attackAbilityUuid] The UUID of the ability used for the attack
 * (embedded Item).
 * @property {object} [attacker] The actor performing the attack. Can be omitted if
 * `rollingActorUuid` is provided.
 */

/**
 * The system data model for {@link AttackRollOptions}, roll options for attack rolls.
 * @typedef {EdRollOptionsSystemData} _AttackRollOptionsBase
 * {@ignore}
 * @property {string} weaponType The type of the weapon used for the attack
 * (a key of `ITEMS.weaponType`).
 * @property {DocumentUuid|null} weaponUuid The UUID of the weapon used for the attack
 * (embedded Item). `null` if no weapon is used.
 * @property {DocumentUuid|null} attackAbilityUuid The UUID of the ability used for the attack
 * (embedded Item). `null` if no ability is used.
 */

/**
 * @typedef {_AttackRollOptionsBase} AttackRollOptionsSystemData
 */

// endregion

// region Attribute Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} AttributeRollOptionsInitializationData
 * @property {string} attribute The attribute to use for the roll (a key of `attributes`).
 */

/**
 * The system data model for {@link AttributeRollOptions}, roll options for attribute rolls.
 * @typedef {EdRollOptionsSystemData} _AttributeRollOptionsBase
 * {@ignore}
 * @property {string} attribute The attribute to use for the roll.
 */

/**
 * @typedef {_AttributeRollOptionsBase} AttributeRollOptionsSystemData
 */

// endregion

// region Attuning Roll Options

/**
 * The system data model for {@link AttuningRollOptions}, roll options for attuning spells to
 * matrices or grimoires.
 * @typedef {EdRollOptionsSystemData} _AttuningRollOptionsBase
 * {@ignore}
 * @property {string} attuningType The type of attuning, either `"matrixOnTheFly"` or
 * `"grimoire"` (see `MAGIC.attuningType`).
 * @property {DocumentUuid} attuningAbility The UUID of the ability used for attuning (usually
 * thread weaving for matrices or patterncraft for grimoires; embedded Item).
 * @property {Set<DocumentUuid>} spellsToAttune The UUIDs of the spells to attune.
 * @property {boolean} grimoirePenalty Whether the penalty for unowned grimoires applies.
 * @property {Set<DocumentUuid>} itemsToAttuneTo The UUIDs of the matrix/grimoire items the
 * spells are being attuned to.
 */

/**
 * @typedef {_AttuningRollOptionsBase} AttuningRollOptionsSystemData
 */

// endregion

// region Damage Roll Options

/**
 * Base roll options initialization data for all types of damage rolls.
 * @typedef BaseDamageRollOptionsInitializationData
 * @property {string} damageSourceType The type of damage source (see
 * {@link DamageRollOptionsSystemData.damageSourceType}).
 * @property {object} [replacementAbility] The ability that will replace the attribute step used
 * for the base damage step (e.g. "Crushing Blow", "Down Strike", "Flame Arrow"). Can be omitted
 * if `replacementAbilityUuid` is provided.
 * @property {object[]} [increaseAbilities] Abilities that increase the damage step. Can be
 * omitted if `increaseAbilityUuids` is provided.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} ArbitraryDamageInitializationData
 * @property {"arbitrary"} damageSourceType Discriminator for arbitrary damage source.
 * @property {object} [sourceDocument] If given, will try to get the base damage step via
 * `system.rankFinal`, or `1` if not found.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} DrowningDamageInitializationData
 * @property {"drowning"} damageSourceType Discriminator for drowning damage source.
 * @property {number} [drowningRound=1] The round of drowning to roll damage for.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} FallingDamageInitializationData
 * @property {"falling"} damageSourceType Discriminator for falling damage source.
 * @property {number} [fallingHeight] The height of the fall in yards.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} FireDamageInitializationData
 * @property {"fire"} damageSourceType Discriminator for fire damage source.
 * @property {string} fireType The type of fire source (see `ENVIRONMENT.fireDamage`).
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} PoisonDamageInitializationData
 * @property {"poison"} damageSourceType Discriminator for poison damage source.
 * @property {object} sourceDocument Item of type "poison". The poison's effect damage step is
 * used as the base damage step.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} PowerDamageInitializationData
 * @property {"power"} damageSourceType Discriminator for power damage source.
 * @property {object} sourceDocument Item of type "power". The power's damage step is used as
 * the base damage step.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} SpellDamageInitializationData
 * @property {"spell"} damageSourceType Discriminator for spell damage source.
 * @property {object} sourceDocument Item of type "spell".
 * @property {object} caster The actor that cast the spell. The caster's willpower step is used
 * as the base damage step.
 * @property {object} [willforce] The willforce ability of the spell's caster, if used for the
 * damage roll.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} SuffocationDamageInitializationData
 * @property {"suffocation"} damageSourceType Discriminator for suffocation damage source.
 * @property {number} [suffocationRound=1] The round of suffocation to roll damage for.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} UnarmedDamageInitializationData
 * @property {"unarmed"} damageSourceType Discriminator for unarmed damage source.
 * @property {object} sourceDocument Actor of type "sentient". The attacker's Strength step is
 * used as the base damage step.
 * @property {object} [attackRoll] The attack roll that caused the damage.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} WarpingDamageInitializationData
 * @property {"warping"} damageSourceType Discriminator for warping damage source.
 * @property {object} sourceDocument Item of type "spell". The spell's circle is used as the
 * base damage step.
 * @property {string} [astralSpacePollution="safe"] The astral space pollution used for modifying
 * the step of warping damage.
 */

/**
 * @typedef {BaseDamageRollOptionsInitializationData} WeaponDamageInitializationData
 * @property {"weapon"} damageSourceType Discriminator for weapon damage source.
 * @property {object} sourceDocument The document that is causing the damage (e.g. a weapon).
 * @property {object} [attackRoll] The attack roll that caused the damage.
 */

/**
 * Union of all possible damage roll initialization options.
 * @typedef {(
 *   ArbitraryDamageInitializationData |
 *   DrowningDamageInitializationData |
 *   FallingDamageInitializationData |
 *   FireDamageInitializationData |
 *   PoisonDamageInitializationData |
 *   PowerDamageInitializationData |
 *   SpellDamageInitializationData |
 *   SuffocationDamageInitializationData |
 *   UnarmedDamageInitializationData |
 *   WarpingDamageInitializationData |
 *   WeaponDamageInitializationData
 * )} EdDamageRollOptionsInitializationData
 */

/**
 * Element data for damage rolls.
 * @typedef DamageElementData
 * @property {string} [type] The type of element (a key of `MAGIC.elements`).
 * @property {string} [subtype] The subtype of the element (a key of `MAGIC.elementSubtypes`).
 */

/**
 * The system data model for {@link DamageRollOptions}, roll options for damage rolls.
 * @typedef {EdRollOptionsSystemData} _DamageRollOptionsBase
 * {@ignore}
 * @property {string} damageSourceType The type of damage source (a key of
 * `COMBAT.damageSourceConfig`).
 * @property {string} [weaponType] The weapon type (a key of `ITEMS.weaponType`).
 * @property {string|null} [armorType] The type of armor to consider (a key of `ACTORS.armor`).
 * @property {string} [damageType] The type of damage to roll (a key of `COMBAT.damageType`).
 * @property {boolean} [ignoreArmor] Whether to ignore armor when calculating damage.
 * @property {boolean} [naturalArmorOnly] Whether to only consider natural armor.
 * @property {DocumentUuid} [sourceUuid] The UUID of the source item/actor that caused the damage.
 * @property {DocumentUuid} [replacementAbilityUuid] The UUID of an ability that will replace the
 * attribute step used for the base damage step.
 * @property {DocumentUuid[]} [increaseAbilityUuids] UUIDs of abilities that increase the damage
 * step.
 * @property {DamageElementData} [element] The element and subtype of the damage.
 */

/**
 * @typedef {_DamageRollOptionsBase} DamageRollOptionsSystemData
 */

// endregion

// region Half-Magic Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} HalfMagicRollOptionsInitializationData
 * @property {string} attribute The attribute to use for the roll.
 * @property {object} [discipline] The discipline for which to roll half-magic.
 * @property {DocumentUuid} [disciplineUuid] The UUID of the discipline for which to roll
 * half-magic.
 */

/**
 * The system data model for {@link HalfMagicRollOptions}, roll options for half-magic rolls.
 * @typedef {EdRollOptionsSystemData} _HalfMagicRollOptionsBase
 * {@ignore}
 * @property {string} attribute The attribute to use for the roll.
 * @property {DocumentUuid} disciplineUuid The UUID of the discipline for which to roll
 * half-magic (embedded Item).
 */

/**
 * @typedef {_HalfMagicRollOptionsBase} HalfMagicRollOptionsSystemData
 */

// endregion

// region Horror Mark Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} EdHorrorMarkRollOptionsInitializationData
 * @property {object} caster The actor that is casting the horror mark.
 * @property {object} [horror] The horror that is trying to mark the target.
 * @property {object} [spell] The spell that is causing the horror mark, if applicable.
 */

/**
 * The system data model for {@link HorrorMarkRollOptions}, roll options for horror mark rolls.
 * @typedef {EdRollOptionsSystemData} _HorrorMarkRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid} casterUuid The UUID of the actor casting the horror mark.
 * @property {string} [astralSpacePollution] The astral space pollution level (a key of
 * `MAGIC.astralSpacePollution`).
 * @property {DocumentUuid} [horrorUuid] The UUID of the horror trying to mark the target.
 * @property {DocumentUuid} [spellUuid] The UUID of the spell causing the horror mark.
 */

/**
 * @typedef {_HorrorMarkRollOptionsBase} HorrorMarkRollOptionsSystemData
 */

// endregion

// region Initiative Roll Options

/**
 * The system data model for {@link InitiativeRollOptions}, roll options for initiative rolls.
 * @typedef {EdRollOptionsSystemData} _InitiativeRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid|null} replacementEffect The UUID of an item that replaces the basic
 * DEX attribute step (embedded Item).
 * @property {Set<DocumentUuid>} increaseAbilities UUIDs of items that add steps to the
 * initiative roll (embedded Items).
 */

/**
 * @typedef {_InitiativeRollOptionsBase} InitiativeRollOptionsSystemData
 */

// endregion

// region Jump Up Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} JumpUpRollOptionsInitializationData
 * @property {object} [actor] The actor jumping up.
 * @property {object} [jumpUpAbility] The jump up ability used for the test.
 */

/**
 * The system data model for {@link JumpUpRollOptions}, roll options for jump-up tests.
 * @typedef {EdRollOptionsSystemData} _JumpUpRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid} jumpUpAbilityUuid The UUID of the jump-up ability used for the test
 * (embedded Item).
 */

/**
 * @typedef {_JumpUpRollOptionsBase} JumpUpRollOptionsSystemData
 */

// endregion

// region Knockdown Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} EdKnockdownRollOptionsInitializationData
 * @property {object|null} [knockdownAbility] The knockdown ability item.
 * @property {object} [actor] The actor making the knockdown test.
 * @property {number} damageTaken The damage taken that triggered the knockdown test.
 */

/**
 * The system data model for {@link KnockdownRollOptions}, roll options for knockdown tests.
 * @typedef {EdRollOptionsSystemData} _KnockdownRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid|null} knockdownAbilityUuid The UUID of the knockdown ability item
 * (embedded Item).
 */

/**
 * @typedef {_KnockdownRollOptionsBase} KnockdownRollOptionsSystemData
 */

// endregion

// region Recovery Roll Options

/**
 * Initial damage state passed into a recovery roll.
 * @typedef RecoveryInitialDamageData
 * @property {number} standard Standard damage before the recovery roll.
 * @property {number} stun     Stun damage before the recovery roll.
 */

/**
 * @typedef {EdRollOptionsInitializationData} RecoveryRollOptionsInitializationData
 * @property {string} recoveryMode The recovery mode (a key of `WORKFLOWS.recoveryModes`).
 * @property {RecoveryInitialDamageData} initialDamage The damage values before the recovery
 * roll.
 * @property {number} initialWounds The number of wounds before the recovery roll.
 * @property {boolean} [ignoreWounds=false] Whether to ignore penalties from wounds during the
 * recovery roll.
 * @property {object} [actor] The actor performing the recovery roll.
 */

/**
 * The system data model for {@link RecoveryRollOptions}, roll options for recovery rolls.
 * @typedef {EdRollOptionsSystemData} _RecoveryRollOptionsBase
 * {@ignore}
 * @property {string} recoveryMode The recovery mode (a key of `WORKFLOWS.recoveryModes`).
 * @property {RecoveryInitialDamageData} initialDamage The damage values before the recovery
 * roll.
 * @property {number} initialWounds The number of wounds before the recovery roll.
 * @property {boolean} ignoreWounds Whether to ignore penalties from wounds.
 */

/**
 * @typedef {_RecoveryRollOptionsBase} RecoveryRollOptionsSystemData
 */

// endregion

// region Spellcasting Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} EdSpellcastingRollOptionsInitializationData
 * @property {object} [spell] The spell being cast.
 * @property {object} [spellcastingAbility] The ability used for spellcasting.
 * @property {object} [grimoire] The grimoire item, if a grimoire is used to cast the spell.
 */

/**
 * The system data model for {@link SpellcastingRollOptions}, roll options for spellcasting.
 * @typedef {EdRollOptionsSystemData} _SpellcastingRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid} spellUuid The UUID of the spell being cast.
 * @property {DocumentUuid} spellcastingAbilityUuid The UUID of the ability used for
 * spellcasting (embedded Item).
 */

/**
 * @typedef {_SpellcastingRollOptionsBase} SpellcastingRollOptionsSystemData
 */

// endregion

// region Spell Effect Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} EdSpellEffectRollOptionsInitializationData
 * @property {object} [spell] The spell causing the effect.
 * @property {object} [willforce] The willforce ability of the spell's caster, if used for the
 * effect.
 * @property {object} [caster] The actor casting the spell.
 */

/**
 * The system data model for {@link SpellEffectRollOptions}, roll options for non-damage spell
 * effects.
 * @typedef {EdRollOptionsSystemData} _SpellEffectRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid} spellUuid The UUID of the spell causing the effect.
 * @property {DocumentUuid|null} willforceUuid The UUID of the willforce ability of the spell's
 * caster, if used for the effect.
 */

/**
 * @typedef {_SpellEffectRollOptionsBase} SpellEffectRollOptionsSystemData
 */

// endregion

// region Warping Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} EdWarpingRollOptionsInitializationData
 * @property {object} [caster] The actor casting the spell.
 * @property {object} [spell] The spell being cast.
 */

/**
 * The system data model for {@link WarpingRollOptions}, roll options for potential warping
 * effects when casting spells.
 * @typedef {EdRollOptionsSystemData} _WarpingRollOptionsBase
 * {@ignore}
 * @property {string} astralSpacePollution The type of astral space pollution while casting the
 * spell (a key of `MAGIC.astralSpacePollution`).
 * @property {DocumentUuid} casterUuid The UUID of the actor casting the spell.
 * @property {DocumentUuid} spellUuid The UUID of the spell being cast.
 */

/**
 * @typedef {_WarpingRollOptionsBase} WarpingRollOptionsSystemData
 */

// endregion

// region Thread Weaving Roll Options

/**
 * @typedef {EdRollOptionsInitializationData} EdThreadWeavingRollOptionsInitializationData
 * @property {object} [weavingAbility] The ability used for thread weaving.
 * @property {DocumentUuid} [weavingAbilityUuid] The UUID of the ability used for thread weaving.
 * @property {object} [spell] The spell the threads are woven for.
 * @property {DocumentUuid} [spellUuid] The UUID of the spell the threads are woven for.
 * @property {object} [grimoire] The grimoire item, if a grimoire is used to cast the spell.
 * @property {object} [truePattern] The document that holds the true pattern the thread is
 * woven to.
 * @property {DocumentUuid} [truePatternUuid] The UUID of the document that holds the true
 * pattern the thread is woven to.
 * @property {number} [newThreadRank=1] The rank of the new thread being created, if any.
 */

/**
 * Threads-tracking sub-object of a thread weaving roll.
 * @typedef ThreadWeavingThreadsData
 * @property {number} required The number of threads required for the spell.
 * @property {number} extra    The number of extra threads woven.
 */

/**
 * The system data model for {@link ThreadWeavingRollOptions}, roll options for weaving threads
 * to spells and true patterns.
 * @typedef {EdRollOptionsSystemData} _ThreadWeavingRollOptionsBase
 * {@ignore}
 * @property {DocumentUuid} weavingAbilityUuid The UUID of the ability used for thread weaving
 * (embedded Item).
 * @property {DocumentUuid} spellUuid The UUID of the spell the threads are woven for, if any.
 * @property {ThreadWeavingThreadsData|null} threads The number of threads for the spell.
 * @property {number} [newThreadRank] The rank of the new thread being created, if any.
 * @property {DocumentUuid} [truePatternUuid] The UUID of the document that holds the true
 * pattern the thread is woven to.
 */

/**
 * @typedef {_ThreadWeavingRollOptionsBase} ThreadWeavingRollOptionsSystemData
 */

// endregion
