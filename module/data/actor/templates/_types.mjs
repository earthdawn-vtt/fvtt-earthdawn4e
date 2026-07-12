/**
 * @import { BaseValueProperty, DescriptionData, StepMaxValueProperty, StepProperty, ValueProperty, ValuePropertyWithMax } from "../../_types.mjs";
 * @import { armor, attributes, defense } from "../../../config/actors.mjs";
 * @import { DocumentId, DocumentUuid } from "../../../_types.mjs";
 */

/**
 * The speeds for each movement type.
 * @typedef MovementData
 * @property {number} walk The actor's walking speed.
 * @property {number} fly The actor's flying speed.
 * @property {number} swim The actor's swimming speed.
 * @property {number} burrow The actor's burrowing speed.
 * @property {number} climb The actor's climbing speed.
 */

/**
 * @typedef ActorDescriptionData
 * @property {DescriptionData} description The actor's description.
 */

/**
 * @typedef _CommonData
 * {@ignore}
 * @property {Record<string, ValueProperty>} globalModifiers
 * @property {Record<string, ValueProperty>} singleModifiers
 * @property {Set<DocumentUuid>} favorites
 * @property {DocumentId} manualOverrideEffectId
 * @property {TruePatternData} truePattern
 */

/**
 * @typedef {_CommonData & ActorDescriptionTemplate} CommonTemplateData
 * {@interface}
 */

/**
 * The identifiers used for actor attributes.
 * @typedef {keyof typeof attributes} AttributeId
 * @see {@link attributes}
 */

/**
 * The common data for an attribute, independent of an actor type.
 * @typedef AttributeCommonValueData
 * @property {number} step The step to roll for the attribute.
 */

/**
 * The actor's attributes, keyed by attribute type.
 * @typedef {Record<AttributeId, number>} AttributeCommonData
 * {@interface}
 * @property {AttributeCommonValueData} str Strength attribute data.
 * @property {AttributeCommonValueData} dex Dexterity attribute data.
 * @property {AttributeCommonValueData} tou Toughness attribute data.
 * @property {AttributeCommonValueData} per Perception attribute data.
 * @property {AttributeCommonValueData} wil Willpower attribute data.
 * @property {AttributeCommonValueData} cha Charisma attribute data.
 */

/**
 * The identifiers used for defense mappings.
 * @typedef { keyof typeof defense } DefenseId
 * @see {@link defense}
 */

/**
 * The actor's defenses, keyed by defense type.
 * @typedef {Record<DefenseId, BaseValueProperty>} DefensesData
 */

/**
 * The identifiers used for armor mappings.
 * @typedef { keyof typeof armor } ArmorId
 * @see {@link armor}
 */

/**
 * The actor's armor, keyed by armor type.
 * @typedef {Record<ArmorId, BaseValueProperty>} ArmorData
 */

/**
 * The actor's blood magic damage and wounds.
 * @typedef BloodMagicData
 * @property {number} damage The actor's blood magic damage.
 * @property {number} wounds The number of blood magic wounds.
 */

/**
 * The actor's current damage.
 * @typedef DamageData
 * @property {number} standard The current amount of the actor's standard (lethal) damage.
 * @property {number} stun The current amount of the actor's stun damage.
 * @property {number} total The current amount of the actor's total damage (standard + stun).
 */

/**
 * The actor's health, including death, unconscious, wounds, blood magic, and damage.
 * @typedef HealthData
 * @property {number} death The actor's death rating.
 * @property {number} unconscious The actor's unconsciousness rating.
 * @property {number} woundThreshold The actor's wound threshold.
 * @property {BloodMagicData} bloodMagic The actor's blood magic damage and wounds.
 * @property {DamageData} damage The actor's current damage.
 * @property {number} wounds The amount of wounds the actor has.
 * @property {number} maxWounds The maximum amount of wounds the actor can have if mob rules are used.
 */

/**
 * The actor's recovery tests, representing a resource.
 * @typedef {ValuePropertyWithMax & StepProperty} RecoveryTestResourceData
 * {@interface}
 * @property {boolean} stunRecoveryAvailable Whether the actor can currently recover from stun damage.
 */

/**
 * The actor's characteristics, like defense, armor, and health ratings, recovery tests and movement.
 * @typedef CharacteristicsData
 * @property {DefensesData} defenses The actor's defenses.
 * @property {ArmorData} armor The actor's armor.
 * @property {HealthData} health The actor's health.
 * @property {RecoveryTestResourceData} recoveryTestsResource The actor's recovery tests treated as a resource.
 * @property {MovementData} movement The actor's movement.
 */

/**
 * @typedef {"notEncumbered" | "light" | "heavy" | "tooHeavy" } EncumbranceStatus
 */

/**
 * @typedef EncumbranceData
 * @property {number} value The current load / weight carried by the actor.
 * @property {number} max The maximum weight the actor can carry.
 * @property {number} bonus A bonus value to strength value for determining max capacity.
 * @property {EncumbranceStatus} status The current encumbrance status.
 */

/**
 * @typedef _KarmaData
 * {@ignore}
 * @property {boolean} useAlways Always use a point of karma when making a test.
 * @property {number} freeAttributePoints The number of unspent attribute points from character creation. Is added
 * directly to the max available karma points.
 */

/**
 * @typedef {_KarmaData & StepMaxValueProperty} KarmaData
 * {@interface}
 */

/**
 * @typedef RelationData
 * {@ignore}
 * @privateRemarks
 * This will be completed when the relation system is implemented.
 */

/**
 * Additional data for sentient actors.
 * @typedef _SentientData
 * {@ignore}
 * @property {AttributeCommonData} attributes The actor's attributes.
 * @property {ValuePropertyWithMax} healthRate The actor's health rate for use
 * of modules and token bars.
 * @property {CharacteristicsData} characteristics The actor's characteristics, like defense, armor, and health
 * ratings, recovery tests and movement.
 * @property {DocumentId} concentrationSource The id of the document on whose effect the actor
 * is currently concentrating.
 * @property {StepMaxValueProperty} devotion The actor's devotion resource and devotion dice step.
 * @property {EncumbranceData} encumbrance The actor's encumbrance.
 * @property {number} initiative The actor's step for initiative rolls.
 * @property {number} jumpUpStep The actor's step for jump up tests.
 * @property {KarmaData} karma The actor's karma resource, karma dice step and info about whether to always use.
 * @property {number} knockdownStep The actor's step for knockdown tests.
 */

/**
 * @typedef {CommonTemplateData & _SentientData} SentientTemplateData
 * {@interface}
 */

/**
 * The languages the actor can speak and read and write.
 * The available languages are defined in the game's system settings.
 * @typedef LanguagesData
 * @property {Set<string>} speak The languages the actor can speak.
 * @property {Set<string>} readWrite The languages the actor can read and write.
 */

/**
 * @typedef _NamegiverData
 * {@ignore}
 * @property {LanguagesData} languages The languages the actor can speak and read and write.
 */

/**
 * @typedef {_NamegiverData & SentientTemplateData} NamegiverTemplateData
 * {@interface}
 */

/**
 * @typedef ChallengeData
 * @property {number} rate This is a rough guideline to the creature’s power level.
 */

/**
 * @typedef NoneCharacterData
 * @property {boolean} isMob Whether to treat the actor with the mob rules.
 * @property {ChallengeData} challenge Information on the creature's challenge.
 * @property {number} actions The number of Standard actions the creature may make each round.
 */