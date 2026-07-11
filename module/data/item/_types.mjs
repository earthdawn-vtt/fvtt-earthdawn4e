/**
 * @import { DocumentId, DocumentUuid } from "../../_types.mjs";
 * @import { AbilityTemplateData, ActionTemplateData, ClassTemplateData, IncreasableAbilityTemplateData, ItemDescriptionTemplateData, KnackTemplateData, LearnableTemplateData, LpIncreaseTemplateData, MatrixTemplateData, PhysicalItemTemplateData, RollableTemplateData, TargetTemplateData } from "./templates/_types.mjs";
 * @import { armor, attributes, defenses } from "../../config/actors.mjs";
 * @import { MovementData } from "../actor/templates/_types.mjs";
 * @import { damageType } from "../../config/combat.mjs";
 * @import { ammunitionType, weaponSubType, weaponType, weaponWieldingType } from "../../config/items.mjs";
 * @import { talentCategory, skillTypes } from "../../config/legend.mjs";
 * @import { elements, elementSubtypes, spellcastingTypes, spellEffectTypes, spellKeywords, threadTypes } from "../../config/magic.mjs";
 * @import { curseType, poisonActivation } from "../../config/items.mjs";
 * @import { AreaMetricData, DurationMetricData, MetricData, RangeMetricData } from "../common/metrics.mjs";
 */

// region Physical Gear

// region Armor

/**
 * Sub-schema for the physical / mystical armor rating of an armor item.
 * @typedef ArmorRatingData
 * @property {number} armor The base armor rating.
 * @property {number} forgeBonus Additional forge bonus applied to this armor rating.
 */

/**
 * Piecemeal-armor configuration.
 * @typedef ArmorPiecemealData
 * @property {boolean} isPiecemeal Whether the armor is piecemeal armor.
 * @property {number} size Piecemeal armor size; must be 0-3.
 */

/**
 * Additional data for armor items, on top of the physical-item and item-description templates.
 * @typedef _ArmorData
 * {@ignore}
 * @property {ArmorRatingData} physical Physical armor rating and forge bonus.
 * @property {ArmorRatingData} mystical Mystical armor rating and forge bonus.
 * @property {number} initiativePenalty Initiative penalty inflicted by wearing this armor.
 * @property {boolean} isLiving Whether this is living armor.
 * @property {ArmorPiecemealData} piecemeal Piecemeal armor configuration.
 */

/**
 * The system data model for `armor` items.
 * @typedef {PhysicalItemTemplateData & ItemDescriptionTemplateData & _ArmorData} ArmorSystemData
 * {@interface}
 */

// endregion

// region Shield

/**
 * Defense bonus sub-schema for shield items.
 * @typedef ShieldDefenseBonusData
 * @property {number} physical Bonus applied to the physical defense.
 * @property {number} mystical Bonus applied to the mystical defense.
 */

/**
 * Additional data for shield items, on top of the physical-item and item-description templates.
 * @typedef _ShieldData
 * {@ignore}
 * @property {ShieldDefenseBonusData} defenseBonus Defense bonuses granted by this shield.
 * @property {number} initiativePenalty Initiative penalty inflicted by using this shield.
 * @property {number} shatterThreshold Damage threshold that causes the shield to shatter.
 * @property {boolean} shattered Whether the shield is currently shattered.
 * @property {boolean} isLiving Whether this is a living shield.
 * @property {boolean} bowUsage Whether this shield can be used together with a bow.
 */

/**
 * The system data model for `shield` items.
 * @typedef {PhysicalItemTemplateData & ItemDescriptionTemplateData & _ShieldData} ShieldSystemData
 * {@interface}
 */

// endregion

// region Weapon

/**
 * Damage sub-schema for weapon items.
 * @typedef WeaponDamageData
 * @property {attributes} attribute The 3-letter attribute abbreviation used as the base for damage (e.g. "str").
 * @property {number} baseStep The weapon's basic damage step.
 * @property {damageType} type The damage type inflicted.
 */

/**
 * Range sub-schema for weapon items.
 * @typedef WeaponRangeData
 * @property {number} shortMin Minimum distance for short range.
 * @property {number} shortMax Maximum distance for short range.
 * @property {number} longMin Minimum distance for long range.
 * @property {number} longMax Maximum distance for long range.
 */

/**
 * Ammunition sub-schema for weapon items.
 * @typedef WeaponAmmunitionData
 * @property {ammunitionType|null} type The ammunition type this weapon consumes.
 */

/**
 * Additional data for weapon items, on top of the physical-item, item-description, and rollable templates.
 * @typedef _WeaponData
 * {@ignore}
 * @property {weaponType|null} weaponType The general weapon type (e.g. "melee", "ranged").
 * @property {weaponSubType} weaponSubType The specific weapon subtype (e.g. "bow", "sword").
 * @property {weaponWieldingType} wieldingType The default wielding type (e.g. "mainHand", "offHand", "twoHands").
 * @property {WeaponDamageData} damage Damage configuration.
 * @property {number} size Weapon size, 1-7.
 * @property {number} strengthMinimum Minimum strength value to be able to use the weapon.
 * @property {number} dexterityMinimum Minimum dexterity value to be able to use the weapon.
 * @property {WeaponRangeData} range Range configuration.
 * @property {WeaponAmmunitionData} ammunition Ammunition configuration.
 * @property {number} forgeBonus Forged damage bonus.
 * @property {armor|null} armorType Armor type the weapon damage is applied against (e.g. "physical", "mystical").
 */

/**
 * The system data model for `weapon` items.
 * @typedef {PhysicalItemTemplateData & ItemDescriptionTemplateData & RollableTemplateData & _WeaponData} WeaponSystemData
 * {@interface}
 */

// endregion

// region Equipment

/**
 * Ammunition sub-schema for equipment items.
 * @typedef EquipmentAmmunitionData
 * @property {ammunitionType|null} type The ammunition type this equipment provides (see `ITEMS.ammunitionType`).
 */

/**
 * Additional data for equipment items, on top of the physical-item and item-description templates.
 * @typedef _EquipmentData
 * {@ignore}
 * @property {boolean} consumable Whether this item is consumed on use.
 * @property {EquipmentAmmunitionData} ammunition Ammunition data when this equipment represents ammunition.
 * @property {number} bundleSize Number of units per bundle (e.g., arrows in a quiver).
 * @property {DocumentUuid|null} equipmentMacro UUID of an optional macro to run when this equipment is used.
 */

/**
 * The system data model for `equipment` items.
 * @typedef {PhysicalItemTemplateData & ItemDescriptionTemplateData & _EquipmentData} EquipmentSystemData
 * {@interface}
 */

// endregion

// region Ship Weapon

/**
 * Range sub-schema for ship weapon items.
 * @typedef ShipWeaponRangeData
 * @property {number} short Short range in appropriate units.
 * @property {number} long Long range in appropriate units.
 */

/**
 * Additional data for ship weapon items, on top of the item-description template.
 * @typedef _ShipWeaponData
 * {@ignore}
 * @property {number} firePowerPoints Fire power of the weapon.
 * @property {number} crewWeapon Required crew to handle the weapon.
 * @property {ShipWeaponRangeData} range Range configuration.
 * @property {number} salvoCost Ammunition/resource cost per salvo.
 * @property {number} characterDamage Damage this weapon inflicts on a sentient being.
 */

/**
 * The system data model for `shipWeapon` items.
 * @typedef {ItemDescriptionTemplateData & _ShipWeaponData} ShipWeaponSystemData
 * {@interface}
 */

// endregion

// endregion

// region Classes

// region Discipline

/**
 * Additional data for discipline items, on top of the class and item-description templates.
 * @typedef _DisciplineData
 * {@ignore}
 * @property {number} durability The discipline's durability value.
 * @property {number} order The identifier for the position among the actor's disciplines (1 = first discipline).
 */

/**
 * The system data model for `discipline` items.
 * @typedef {ClassTemplateData & ItemDescriptionTemplateData & _DisciplineData} DisciplineSystemData
 * {@interface}
 */

// endregion

// region Path

/**
 * Additional data for path items, on top of the class and item-description templates.
 * @typedef _PathData
 * {@ignore}
 * @property {DocumentId} sourceDisciplineId Sibling item id of the discipline this path belongs to.
 * @property {number} bloodMagicDamage The amount of blood magic damage caused by this path.
 * @property {DocumentId} pathKnackId Sibling item id of the knack ability associated with this path.
 * @property {DocumentId} pathTalentId Sibling item id of the talent associated with this path.
 */

/**
 * The system data model for `path` items.
 * @typedef {ClassTemplateData & ItemDescriptionTemplateData & _PathData} PathSystemData
 * {@interface}
 */

// endregion

// region Questor

/**
 * Additional data for questor items, on top of the class and item-description templates.
 * @typedef _QuestorData
 * {@ignore}
 * @property {DocumentId|null} questorDevotionId Sibling item id of the corresponding devotion of this passion.
 */

/**
 * The system data model for `questor` items.
 * @typedef {ClassTemplateData & ItemDescriptionTemplateData & _QuestorData} QuestorSystemData
 * {@interface}
 */

// endregion

// endregion

// region Abilities

// region Devotion

/**
 * Additional data for devotion items, on top of the increasable-ability and item-description templates.
 * @typedef _DevotionData
 * {@ignore}
 * @property {boolean} devotionRequired Whether a devotion point needs to be spent to use this devotion.
 * @property {number} durability The devotion's durability value.
 */

/**
 * The system data model for `devotion` items.
 * @typedef {IncreasableAbilityTemplateData & ItemDescriptionTemplateData & _DevotionData} DevotionSystemData
 * {@interface}
 */

// endregion

// region Talent

/**
 * Knacks associated with a talent.
 * @typedef TalentKnacksData
 * @property {Set<DocumentUuid>} available UUIDs of world/compendium knack items that can be learned from this talent.
 * @property {Set<DocumentId>} learned Sibling item ids of knacks (ability, karma, or maneuver) already learned from this talent.
 */

/**
 * Additional data for talent items, on top of the increasable-ability, item-description, and matrix templates.
 * @typedef _TalentData
 * {@ignore}
 * @property {talentCategory} talentCategory The talent's category (e.g. "discipline", "free", "optional").
 * @property {TalentKnacksData} knacks Available and learned knacks derived from this talent.
 */

/**
 * The system data model for `talent` items.
 * @typedef {IncreasableAbilityTemplateData & ItemDescriptionTemplateData & MatrixTemplateData & _TalentData} TalentSystemData
 * {@interface}
 */

// endregion

// region Skill

/**
 * Additional data for skill items, on top of the increasable-ability and item-description templates.
 * @typedef _SkillData
 * {@ignore}
 * @property {skillTypes} skillType The skill's type (e.g. "general", "artisan", "knowledge").
 */

/**
 * The system data model for `skill` items.
 * @typedef {IncreasableAbilityTemplateData & ItemDescriptionTemplateData & _SkillData} SkillSystemData
 * {@interface}
 */

// endregion

// region Special Ability

/**
 * The system data model for `specialAbility` items. Adds no fields beyond the item-description template.
 * @typedef {ItemDescriptionTemplateData} SpecialAbilitySystemData
 * {@interface}
 */

// endregion

// region Power

/**
 * Damage sub-schema for power items.
 * @typedef PowerDamageData
 * @property {damageType} type The damage type inflicted (e.g. "standard", "fire").
 * @property {armor|null} armorType Armor type the damage is applied against.
 * @property {boolean} ignoreArmor Whether the damage ignores armor entirely.
 */

/**
 * Element sub-schema for power items.
 * @typedef PowerElementData
 * @property {elements|null} type The element type (e.g. "fire", "water").
 * @property {string|null} subtype The element subtype flattened from {@link elementSubtypes}.
 */

/**
 * Additional data for power items, on top of the action, item-description, and targeting templates.
 * @typedef _PowerData
 * {@ignore}
 * @property {number} powerStep The base step used for the power's action roll.
 * @property {number|null} damageStep The base step used for the power's damage roll, if any.
 * @property {armor|null} armorType Armor type the power's action targets.
 * @property {PowerDamageData} damage Damage configuration.
 * @property {PowerElementData|null} element Elemental configuration.
 */

/**
 * The system data model for `power` items.
 * @typedef {ActionTemplateData & ItemDescriptionTemplateData & TargetTemplateData & _PowerData} PowerSystemData
 * {@interface}
 */

// endregion

// region Maneuver

/**
 * Additional data for maneuver items, on top of the item-description template.
 * @typedef _ManeuverData
 * {@ignore}
 * @property {number} extraSuccesses The number of extra successes required to trigger the maneuver.
 */

/**
 * The system data model for `maneuver` items.
 * @typedef {ItemDescriptionTemplateData & _ManeuverData} ManeuverSystemData
 * {@interface}
 */

// endregion

// endregion

// region Knacks

// region Knack Ability

/**
 * Additional data for knack ability items, on top of the ability, knack, and item-description templates.
 * @typedef _KnackAbilityData
 * {@ignore}
 * @property {boolean} standardEffect Whether the knack triggers the effects of the source ability.
 */

/**
 * The system data model for `knackAbility` items.
 * @typedef {AbilityTemplateData & KnackTemplateData & ItemDescriptionTemplateData & _KnackAbilityData} KnackAbilitySystemData
 * {@interface}
 */

// endregion

// region Knack Karma

/**
 * The system data model for `knackKarma` items. Adds no fields beyond the knack and item-description templates.
 * @typedef {KnackTemplateData & ItemDescriptionTemplateData} KnackKarmaSystemData
 * {@interface}
 */

// endregion

// region Knack Maneuver

/**
 * The system data model for `knackManeuver` items. Adds no fields beyond the maneuver, knack, and item-description
 * templates.
 * @typedef {ManeuverSystemData & KnackTemplateData} KnackManeuverSystemData
 * {@interface}
 */

// endregion

// region Spell Knack

/**
 * Additional data for spell knack items, on top of the spell, knack, and item-description templates.
 * @typedef _SpellKnackData
 * {@ignore}
 * @property {boolean} bloodMagic Whether the spell's strain counts as blood magic damage.
 * @property {boolean} linkable Whether the spell knack can be linked with other knacks on the same casting.
 * @property {number} strain Additional strain cost applied when the knack is used.
 */

/**
 * The system data model for `spellKnack` items.
 * @typedef {SpellSystemData & KnackTemplateData & ItemDescriptionTemplateData & _SpellKnackData} SpellKnackSystemData
 * {@interface}
 */

// endregion

// endregion

// region Namegiver

/**
 * A single min/max size window for a namegiver's weapon-size preference.
 * @typedef NamegiverWeaponSizeRangeData
 * @property {number} min Minimum weapon size the namegiver can wield in this configuration.
 * @property {number} max Maximum weapon size the namegiver can wield in this configuration.
 */

/**
 * Weapon-size ranges the namegiver can wield with one or two hands.
 * @typedef NamegiverWeaponSizeData
 * @property {NamegiverWeaponSizeRangeData} oneHanded Weapon size range for one-handed use.
 * @property {NamegiverWeaponSizeRangeData} twoHanded Weapon size range for two-handed use.
 */

/**
 * Additional data for namegiver items, on top of the item-description template.
 * @typedef _NamegiverData
 * {@ignore}
 * @property {Record<attributes, number>} attributeValues Base attribute values granted by this namegiver, keyed by
 * 3-letter attribute abbreviation.
 * @property {number} karmaModifier Karma modifier granted by this namegiver.
 * @property {MovementData} movement Base movement rates provided by this namegiver.
 * @property {number} weightMultiplier Multiplier applied to items tailored by this namegiver.
 * @property {boolean} tailAttack Whether this namegiver has a tail attack.
 * @property {boolean} livingArmorOnly Whether this namegiver may only wear living armor.
 * @property {NamegiverWeaponSizeData} weaponSize Weapon size ranges for one-handed and two-handed use.
 * @property {Set<DocumentUuid>} abilities UUIDs of abilities granted by this namegiver.
 */

/**
 * The system data model for `namegiver` items.
 * @typedef {ItemDescriptionTemplateData & _NamegiverData} NamegiverSystemData
 * {@interface}
 */

// endregion

// region Magic

// region Spell

/**
 * Weaving and reattuning difficulty numbers for a spell.
 * @typedef SpellDifficultyData
 * @property {number} reattune The difficulty to reattune the spell to a matrix on the fly.
 * @property {number} weaving The difficulty of the thread weaving tests for this spell.
 */

/**
 * Thread information for a spell.
 * @typedef SpellThreadsData
 * @property {number} required Number of threads required to cast the spell.
 * @property {number} woven Number of threads currently woven for casting.
 * @property {MetricData[]} extra The effects of the chosen extra threads, if any.
 */

/**
 * Damage sub-schema for a spell's effect details.
 * @typedef SpellEffectDamageData
 * @property {attributes} attribute The attribute used to compute the damage step.
 * @property {number} stepModifier Modifier added to the damage step.
 * @property {boolean} addCircle Whether the caster's circle in the corresponding discipline is added to the damage step.
 * @property {damageType} damageType The damage type inflicted by the spell.
 * @property {armor|null} armorType Armor type the damage is applied against, or `null` to ignore armor.
 */

/**
 * Effect sub-schema for a spell's effect details.
 * @typedef SpellEffectEffectData
 * @property {attributes} attribute The attribute used to compute the effect step.
 * @property {number} stepModifier Modifier added to the effect step.
 * @property {boolean} addCircle Whether the caster's circle in the corresponding discipline is added to the effect step.
 */

/**
 * Macro sub-schema for a spell's effect details.
 * @typedef SpellEffectMacroData
 * @property {DocumentUuid|null} macroUuid UUID of the macro to run when the spell effect resolves.
 */

/**
 * Special sub-schema for a spell's effect details.
 * @typedef SpellEffectSpecialData
 * @property {string} description Free-form description for the special effect.
 */

/**
 * Detail sub-schemas for spell effects. Only the sub-schema matching {@link SpellEffectData.type} is meaningful.
 * @typedef SpellEffectDetailsData
 * @property {SpellEffectDamageData} damage Damage effect details.
 * @property {SpellEffectEffectData} effect Non-damage effect details.
 * @property {SpellEffectMacroData} macro Macro effect details.
 * @property {SpellEffectSpecialData} special Special/free-form effect details.
 */

/**
 * Effect configuration for a spell.
 * @typedef SpellEffectData
 * @property {spellEffectTypes} type The kind of effect this spell has.
 * @property {SpellEffectDetailsData} details Details for each effect type.
 */

/**
 * Element configuration for a spell.
 * @typedef SpellElementData
 * @property {elements|null} type The element type of the spell.
 * @property {string|null} subtype The element subtype flattened from {@link elementSubtypes}.
 */

/**
 * Additional data for spell items, on top of the item-description, learnable, and targeting templates.
 * @typedef _SpellData
 * {@ignore}
 * @property {spellcastingTypes} spellcastingType The type of spellcasting used by this spell.
 * @property {number} level The spell's circle / level.
 * @property {SpellDifficultyData} spellDifficulty Weaving and reattuning difficulty values.
 * @property {SpellThreadsData} threads Thread information for the spell.
 * @property {SpellEffectData} effect Effect configuration.
 * @property {Set<spellKeywords>} keywords Keywords describing spell properties.
 * @property {SpellElementData|null} element Element configuration.
 * @property {DurationMetricData} duration The spell's duration (embedded metric).
 * @property {RangeMetricData} range The spell's range (embedded metric).
 * @property {AreaMetricData} area The spell's area of effect (embedded metric).
 * @property {MetricData|null} extraSuccess The effect granted when casting the spell with extra successes.
 * @property {Record<string, MetricData>|null} extraThreads Additional effects granted when casting the spell with
 * extra threads.
 * @property {boolean} isWeaving Whether the spell is currently being woven.
 */

/**
 * The system data model for `spell` items.
 * @typedef {ItemDescriptionTemplateData & LearnableTemplateData & TargetTemplateData & _SpellData} SpellSystemData
 * {@interface}
 */

// endregion

// region Binding Secret

/**
 * The system data model for `bindingSecret` items. Adds no fields beyond the spell and item-description templates.
 * @typedef {SpellSystemData & ItemDescriptionTemplateData} BindingSecretSystemData
 * {@interface}
 */

// endregion

// region Thread

/**
 * Additional data for thread items, on top of the item-description and lp-increase templates.
 * @typedef _ThreadData
 * {@ignore}
 * @property {DocumentUuid|null} wovenToUuid UUID of the item this thread is woven to, if any.
 * @property {number} level The rank of this thread.
 * @property {threadTypes|null} threadType The type of thread (e.g., to a thread item or a group pattern).
 */

/**
 * The system data model for `thread` items.
 * @typedef {ItemDescriptionTemplateData & LpIncreaseTemplateData & _ThreadData} ThreadSystemData
 * {@interface}
 */

// endregion

// region Curse / Horror Mark

/**
 * Additional data for curse and horror mark items, on top of the item-description template.
 * @typedef _CurseHorrorMarkData
 * {@ignore}
 * @property {number} step The curse's step.
 * @property {curseType} type The type of the curse (e.g. "minor", "major").
 * @property {boolean} active Whether the curse is currently active.
 * @property {boolean} detected Whether the curse has been detected by its target.
 * @property {DocumentId|null} source Sibling item id of the source of the curse.
 * @property {DocumentId|null} target Foreign document id of the actor targeted by the curse.
 */

/**
 * The system data model for `curseMark` items.
 * @typedef {ItemDescriptionTemplateData & _CurseHorrorMarkData} CurseHorrorMarkSystemData
 * {@interface}
 */

// endregion

// endregion

// region Mask

/**
 * Attribute step modifiers granted by a mask, keyed by 3-letter attribute abbreviation.
 * @typedef MaskAttributeStepData
 * @property {number} step Step modification for the attribute.
 */

/**
 * Defense value modifier for a mask.
 * @typedef MaskDefenseValueData
 * @property {number} value Modifier to the defense.
 */

/**
 * Armor value modifier for a mask.
 * @typedef MaskArmorValueData
 * @property {number} value Modifier to the armor rating.
 */

/**
 * Health modifiers granted by a mask.
 * @typedef MaskHealthData
 * @property {number} death Modifier to the death threshold.
 * @property {number} unconscious Modifier to the unconscious threshold.
 * @property {number} woundThreshold Modifier to the wound threshold.
 */

/**
 * Recovery tests resource modifier for a mask.
 * @typedef MaskRecoveryData
 * @property {number} value Modifier to the recovery tests resource.
 */

/**
 * Grouped defense, armor, health, and recovery modifiers granted by a mask.
 * @typedef MaskCharacteristicsData
 * @property {Record<defenses, MaskDefenseValueData>} defenses Defense modifiers keyed by defense type.
 * @property {Record<armor, MaskArmorValueData>} armor Armor modifiers keyed by armor type.
 * @property {MaskHealthData} health Health-related modifiers.
 * @property {MaskRecoveryData} recoveryTestsResource Recovery tests resource modifier.
 */

/**
 * Challenge configuration for a mask.
 * @typedef MaskChallengeData
 * @property {number} rate Modifier to the challenge rating.
 */

/**
 * A power entry granted by a mask.
 * @typedef MaskPowerData
 * @property {DocumentUuid} uuid UUID of the power item.
 * @property {number} step Step at which the power is used when granted by the mask.
 */

/**
 * Additional data for mask items, on top of the item-description template.
 * @typedef _MaskData
 * {@ignore}
 * @property {Record<attributes, MaskAttributeStepData>} attributes Attribute step modifiers granted by the mask.
 * @property {MovementData} movement Movement rate modifications granted by the mask.
 * @property {MaskCharacteristicsData} characteristics Defense, armor, health, and recovery modifiers.
 * @property {number} initiative Initiative modifier.
 * @property {number} damageStep Modifier to damage steps.
 * @property {number} attackStep Modifier to attack steps.
 * @property {number} actions Modifier to the number of actions per round.
 * @property {number} knockDownStep Modifier to the knockdown step.
 * @property {MaskChallengeData} challenge Challenge rating modifiers.
 * @property {Record<number, MaskPowerData>} powers Powers granted by the mask, keyed by index.
 * @property {Set<DocumentUuid>} maneuvers UUIDs of maneuvers granted by the mask.
 */

/**
 * The system data model for `mask` items.
 * @typedef {ItemDescriptionTemplateData & _MaskData} MaskSystemData
 * {@interface}
 */

// endregion

// region Poison / Disease

/**
 * Effect step values for a poison or disease.
 * @typedef PoisonDiseaseEffectData
 * @property {number} damageStep Damage step of the effect.
 * @property {number} paralysisStep Paralysis step of the effect.
 * @property {number} debilitationStep Debilitation step of the effect.
 */

/**
 * Interval configuration for a poison or disease.
 * @typedef PoisonDiseaseIntervalData
 * @property {number} totalEffects Total number of effect ticks.
 * @property {number} timeInBetween Time between effect ticks, in configured units.
 */

/**
 * Additional data for poison and disease items, on top of the item-description template.
 * @typedef _PoisonDiseaseData
 * {@ignore}
 * @property {PoisonDiseaseEffectData} effect Effect steps for the poison/disease.
 * @property {PoisonDiseaseIntervalData} interval Interval configuration.
 * @property {number} onsetTime Time until the poison/disease becomes effective.
 * @property {number} duration Duration of the poison/disease.
 * @property {poisonActivation} activation How the poison/disease is activated (e.g. "wound", "contact").
 * @property {boolean} death Whether the poison/disease can be lethal.
 */

/**
 * The system data model for `poisonDisease` items.
 * @typedef {ItemDescriptionTemplateData & _PoisonDiseaseData} PoisonDiseaseSystemData
 * {@interface}
 */

// endregion

