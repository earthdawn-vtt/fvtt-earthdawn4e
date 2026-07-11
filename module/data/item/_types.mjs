/**
 * @import { DocumentId, DocumentUuid } from "../../_types.mjs";
 * @import { ActionTemplateData, ClassTemplateData, IncreasableAbilityTemplateData, ItemDescriptionTemplateData, MatrixTemplateData, PhysicalItemTemplateData, RollableTemplateData, TargetTemplateData } from "./templates/_types.mjs";
 * @import { armor, attributes } from "../../config/actors.mjs";
 * @import { damageType } from "../../config/combat.mjs";
 * @import { ammunitionType, weaponSubType, weaponType, weaponWieldingType } from "../../config/items.mjs";
 * @import { talentCategory, skillTypes } from "../../config/legend.mjs";
 * @import { elements, elementSubtypes } from "../../config/magic.mjs";
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