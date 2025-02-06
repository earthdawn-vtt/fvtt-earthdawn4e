import ED4E from "./config.mjs";

import EdIdField from "./data/fields/edid-field.mjs";

/**
 * Get an ed4e setting from the system settings.
 * @param {string} settingKey   The key of the setting to get.
 * @returns {*}                 The value of the setting.
 */
export function getSetting( settingKey ) {
  return game.settings.get( "ed4e", settingKey );
}

/**
 * Set an ed4e setting in the system settings
 * @param {string} settingKey  The key of the setting to set.
 * @param {*} value            The value to set the setting to.
 * @param {object} [options]   Any additional options to pass to the setting.
 *                             See {@link https://foundryvtt.com/api/classes/client.ClientSettings.html#set}
 * @returns {*}                The assigned value of the setting.
 */
export function setSetting( settingKey, value, options={} ) {
  return game.settings.set( "ed4e", settingKey, value, options );
}

/**
 * Get all available ed-ids from the system settings.
 * @returns {string[]} - A list of all available ed-ids.
 */
export function getEdIds() {
  return [
    "edidThreadWeaving",
    "edidSpellcasting",
    "edidPatterncraft",
    "edidLanguageSpeak",
    "edidLanguageRW",
    // "edidKnockDown",
    "edidVersatility",
    // "edidJumpUp",
    "edidQuestorDevotion",
    "edidUnarmedCombat",
    "edidCreatureAttack",
  ].map( id => getSetting( id ) );
}

/**
 * Register all the system's settings.
 */
export default function registerSystemSettings() {

  const fields = foundry.data.fields;

  /* -------------------------------------------------------------------------------- */
  /*                                      ED-IDs                                      */
  /* -------------------------------------------------------------------------------- */

  // edid for thread weaving
  game.settings.register( "ed4e", "edidThreadWeaving", {
    name:    "ED.Settings.Edid.threadWeaving",
    hint:    "ED.Settings.Edid.threadWeavingHint",
    scope:   "world",
    config:  true,
    default: "thread-weaving",
    type:    new EdIdField(),
  } );

  // edid for spellcasting
  game.settings.register( "ed4e", "edidSpellcasting", {
    name:    "ED.Settings.Edid.spellCasting",
    hint:    "ED.Settings.Edid.spellCastingHint",
    scope:   "world",
    config:  true,
    default: "spellcasting",
    type:    new EdIdField(),
  } );

  // edid for patterncraft
  game.settings.register( "ed4e", "edidPatterncraft", {
    name:    "ED.Settings.Edid.patterncraft",
    hint:    "ED.Settings.Edid.patterncraftHint",
    scope:   "world",
    config:  true,
    default: "patterncraft",
    type:    new EdIdField(),
  } );

  // edid for speak language
  game.settings.register( "ed4e", "edidLanguageSpeak", {
    name:    "ED.Settings.Edid.languageSpeak",
    hint:    "ED.Settings.Edid.languageSpeakHint",
    scope:   "world",
    config:  true,
    default: "language-speak",
    type:    new EdIdField(),
  } );

  // edid for read/write language
  game.settings.register( "ed4e", "edidLanguageRW", {
    name:    "ED.Settings.Edid.languageRW",
    hint:    "ED.Settings.Edid.languageRWHint",
    scope:   "world",
    config:  true,
    default: "language-rw",
    type:    new EdIdField(),
  } );

  // edid for knock down
  game.settings.register( "ed4e", "edidKnockDown", {
    name:    "ED.Settings.Edid.knockdown",
    hint:    "ED.Settings.Edid.knockdownHint",
    scope:   "world",
    config:  true,
    default: "knock-down",
  } );

  // edid for versatility
  game.settings.register( "ed4e", "edidVersatility", {
    name:    "ED.Settings.Edid.versatility",
    hint:    "ED.Settings.Edid.versatilityHint",
    scope:   "world",
    config:  true,
    default: "versatility",
    type:    new EdIdField(),
  } );

  // edid for jumping up
  game.settings.register( "ed4e", "edidJumpUp", {
    name:    "ED.Settings.Edid.jumpUp",
    hint:    "ED.Settings.Edid.jumpUpHint",
    scope:   "world",
    config:  true,
    default: "jump-up",
    type:    new EdIdField(),
  } );

  // edid for questor devotion
  game.settings.register( "ed4e", "edidQuestorDevotion", {
    name:    "ED.Settings.Edid.questorDevotion",
    hint:    "ED.Settings.Edid.questorDevotionHint",
    scope:   "world",
    config:  true,
    default: "questor-devotion",
    type:    new EdIdField(),
  } );

  // edid for unarmed combat
  game.settings.register( "ed4e", "edidUnarmedCombat", {
    name:    "ED.Settings.Edid.unarmedCombat",
    hint:    "ED.Settings.Edid.unarmedCombatHint",
    scope:   "world",
    config:  true,
    default: "unarmed-combat",
    type:    new EdIdField(),
  } );

  // edid for creature power used as attack
  game.settings.register( "ed4e", "edidCreatureAttack", {
    name:    "ED.Settings.Edid.creatureAttack",
    hint:    "ED.Settings.Edid.creatureAttackHint",
    scope:   "world",
    config:  true,
    default: "creature-attack",
    type:    new EdIdField(),
  } );

  /* -------------------------------------------------------------------------------- */
  /*                                  STEP TABLES                                     */
  /* -------------------------------------------------------------------------------- */

  /**
   * Step Table used for step to dice conversion
   * @userFunction                chooseStepTable
   */
  game.settings.register( "ed4e", "stepTable", {
    name:    "ED.Settings.StepTable.stepTable",
    hint:    "ED.Settings.StepTable.hint",
    scope:   "world",
    config:  true,
    default: "fourth",
    type:    String,
    choices: {
      classic: "ED.Settings.StepTable.editionClassic",
      first:   "ED.Settings.StepTable.editionfirst",
      third:   "ED.Settings.StepTable.editionThird",
      fourth:  "ED.Settings.StepTable.editionFourth"
    }
  } );

  /* -------------------------------------------------------------------------------- */
  /*                                  OWNED ITEMS                                     */
  /* -------------------------------------------------------------------------------- */

  /**
   * Should Living Armor checked on Namegivers
   * @userFunction                UF_Settings-enforceLivingArmor
   */
  game.settings.register( "ed4e", "enforceLivingArmor", {
    name:    "ED.Settings.Label.enforceLivingArmor",
    hint:    "ED.Settings.Hint.enforceLivingArmor",
    scope:   "world",
    config:  true,
    type:    Boolean,
    default: true,
  } );

  /* -------------------------------------------------------------------------------- */
  /*                              CHARACTER GENERATION                                */
  /* -------------------------------------------------------------------------------- */

  // Legend point settings Header
  // game.settings.register( "ed4e", "charGenHeader", {
  //     name: "ED.Settings.CharGen.charGenHeader",
  //     config: true,
  // } );

  // Auto open char gen on PC document creation
  game.settings.register( "ed4e", "autoOpenCharGen", {
    name:    "ED.Settings.CharGen.autoOpenCharGen",
    hint:    "ED.Settings.CharGen.hintAutoOpenCharGen",
    scope:   "world",
    config:  true,
    type:    Boolean,
    default: true,
  } );

  // Starting attribute points to spend
  game.settings.register( "ed4e", "charGenAttributePoints", {
    name:    "ED.Settings.CharGen.attributePoints",
    hint:    "ED.Settings.CharGen.hintAttributePoints",
    scope:   "world",
    config:  true,
    type:    Number,
    default: 25,
  } );

  // Maximum rank that can be assigned to a talent or skill on character generation
  game.settings.register( "ed4e", "charGenMaxRank", {
    name:    "ED.Settings.CharGen.maxRanks",
    hint:    "ED.Settings.CharGen.hintMaxRanks",
    scope:   "world",
    config:  true,
    type:    Number,
    default: 3,
  } );

  // Maximum circle for learnable spells at character generation
  game.settings.register( "ed4e", "charGenMaxSpellCircle", {
    name:   "ED.Settings.CharGen.maxSpellCircle",
    hint:   "ED.Settings.CharGen.hintMaxSpellCircle",
    scope:  "world",
    config: true,
    type:   new fields.NumberField( {
      required: true,
      nullable: false,
      min:      1,
      step:     1,
      integer:  true,
      positive: true,
      initial:  2,
    } ),
  } );

  /* -------------------------------------------------------------------------------- */
  /*                                  LP TRACKING                                     */
  /* -------------------------------------------------------------------------------- */

  // Legend point settings Header
  // game.settings.register( "ed4e", "lpTrackingHeader", {
  //     name: "ED.Settings.LpTracking.lpTrackingHeader",
  //     config: true,
  // } );

  // LP Tracking On/Off
  game.settings.register( "ed4e", "lpTrackingUsed", {
    name:    "ED.Settings.LpTracking.lpTrackingUsed",
    hint:    "ED.Settings.LpTracking.hintLpTrackingUsed",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  // LP Tracking Option Attributes
  game.settings.register( "ed4e", "lpTrackingAttributes", {
    name:    "ED.Settings.LpTracking.attributeOptions",
    hint:    "ED.Settings.LpTracking.hintAttributeOption",
    scope:   "world",
    config:  true,
    type:    new fields.StringField( {
      initial:  "spendLp",
      choices:  ED4E.attributeIncreaseRules,
      label:    "ED.Settings.LpTracking.attributeOptions",
      hint:     "ED.Settings.LpTracking.hintAttributeOption",
    } ),
  } );

  // LP Tracking Option Talents
  game.settings.register( "ed4e", "lpTrackingCircleTalentRequirements", {
    name:    "ED.Settings.LpTracking.circleTalentRequirements",
    hint:    "ED.Settings.LpTracking.hintCircleTalentRequirements",
    scope:   "world",
    config:  true,
    default: "disciplineTalents",
    type:    String,
    choices: ED4E.circleTalentRequirements,
  } );

  // LP Tracking Option Skill Training
  game.settings.register( "ed4e", "lpTrackingRemoveSilver", {
    name:    "ED.Settings.LpTracking.removeSilver",
    hint:    "ED.Settings.LpTracking.hintRemoveSilver",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  // LP Tracking Max Rank Talent
  game.settings.register( "ed4e", "lpTrackingMaxRankTalent", {
    name:    "ED.Settings.LpTracking.maxRankTalent",
    hint:    "ED.Settings.LpTracking.hintMaxRankTalent",
    scope:   "world",
    config:  true,
    type:    new fields.NumberField( {
      min:     0,
      step:    1,
      integer: true,
      initial: 15,
    } ),
  } );

  // LP Tracking Max Rank Skill
  game.settings.register( "ed4e", "lpTrackingMaxRankSkill", {
    name:    "ED.Settings.LpTracking.maxRankSkill",
    hint:    "ED.Settings.LpTracking.hintMaxRankSkill",
    scope:   "world",
    config:  true,
    type:    new fields.NumberField( {
      min:     0,
      step:    1,
      integer: true,
      initial: 10,
    } ),
  } );

  // LP Tracking Max Rank Devotion
  game.settings.register( "ed4e", "lpTrackingMaxRankDevotion", {
    name:    "ED.Settings.LpTracking.maxRankDevotion",
    hint:    "ED.Settings.LpTracking.hintMaxRankDevotion",
    scope:   "world",
    config:  true,
    type:    new fields.NumberField( {
      min:     0,
      step:    1,
      integer: true,
      initial: 12,
    } ),
  } );

  // LP Tracking Spell Cost
  game.settings.register( "ed4e", "lpTrackingSpellCost", {
    name:    "ED.Settings.LpTracking.spellCost",
    hint:    "ED.Settings.LpTracking.hintSpellCost",
    scope:   "world",
    config:  true,
    type:    new fields.StringField( {
      required: true,
      nullable: false,
      blank:    false,
      initial:  "noviceTalent",
      choices:  ED4E.spellCostRules,
      label:    "ED.Settings.LpTracking.spellCost",
      hint:     "ED.Settings.LpTracking.hintSpellCost",
    } ),
  } );

  // LP Tracking Use Patterncraft to Learn Spell
  game.settings.register( "ed4e", "lpTrackingLearnSpellUsePatterncraft", {
    name:    "ED.Settings.LpTracking.learnSpellUsePatterncraft",
    hint:    "ED.Settings.LpTracking.hintLearnSpellUsePatterncraft",
    scope:   "world",
    config:  true,
    type:    new fields.BooleanField( {
      required: true,
      nullable: false,
      initial:  true,
      label:    "ED.Settings.LpTracking.learnSpellUsePatterncraft",
      hint:     "ED.Settings.LpTracking.hintLearnSpellUsePatterncraft",
    } ),
  } );

  // LP Tracking Learn Spells on Circle Up
  game.settings.register( "ed4e", "lpTrackingLearnSpellsOnCircleUp", {
    name:    "ED.Settings.LpTracking.learnSpellsOnCircleUp",
    hint:    "ED.Settings.LpTracking.hintLearnSpellsOnCircleUp",
    scope:   "world",
    config:  true,
    type:    new fields.BooleanField( {
      required: true,
      nullable: false,
      initial:  true,
      label:    "ED.Settings.LpTracking.learnSpellsOnCircleUp",
      hint:     "ED.Settings.LpTracking.hintLearnSpellsOnCircleUp",
    } ),
  } );


  /* -------------------------------------------------------------------------------- */
  /*                                  ENCUMBRANCE                                     */
  /* -------------------------------------------------------------------------------- */

  // Encumbrance settings Header
  // game.settings.register( "ed4e", "encumberedHeader", {
  //     name: "ED.Settings.Encumbrance.encumberedHeader",
  //     config: true,
  // } );

  // Encumbrance options
  game.settings.register( "ed4e", "encumbrance", {
    name:    "ED.Settings.Encumbrance.encumbrance",
    hint:    "ED.Settings.Encumbrance.encumbranceHint",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  /* -------------------------------------------------------------------------------- */
  /*                                GAME MECHANICS                                    */
  /* -------------------------------------------------------------------------------- */

  // Game Mechanics settings Header
  /*
  game.settings.register( "ed4e", "loreHeader", {
      name: "ED.Settings.Lore.loreHeader",
      config: true,
  } );
  */

  // Languages
  game.settings.register( "ed4e", "languages", {
    name:   "ED.Settings.Mechanics.languages",
    hint:   "ED.Settings.Mechanics.languagesHint",
    scope:  "world",
    config: true,
    type:   new fields.SetField(
      new fields.StringField( {
        blank: false,
      } ),
      {
        empty:   false,
        initial:  Object.values( ED4E.languages ) ,
      }
    ),
  } );

  // Spellcasting / Thread Weaving Types
  game.settings.register( "ed4e", "spellcastingTypes", {
    name:    "ED.Settings.Mechanics.spellcastingTypes",
    hint:    "ED.Settings.Mechanics.spellcastingTypesHint",
    scope:   "world",
    config:  true,
    default:  Object.values( ED4E.spellcastingTypes ),
    type:    new fields.SetField(
      new fields.StringField( {
        blank: false,
      } ),
      {
        empty:   false,
        initial:  Object.values( ED4E.spellcastingTypes ),
      }
    )
  } );

  // Split Talents
  game.settings.register( "ed4e", "talentsSplit", {
    name:    "ED.Settings.talentsSplit",
    hint:    "ED.Settings.talentsSplitHint",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  // Minimum difficulty for tests
  game.settings.register( "ed4e", "minimumDifficulty", {
    name:    "ED.Settings.GameMechanics.minimumDifficulty",
    hint:    "ED.Settings.GameMechanics.minimumDifficultyHint",
    scope:   "world",
    config:  true,
    default: 2,
    type:    new fields.NumberField( {
      required: true,
      nullable: false,
      min:      0,
      initial:  2,
      step:     1,
      integer:  true,
      label:    "ED.Settings.GameMechanics.minimumDifficulty",
      hint:     "ED.Settings.GameMechanics.minimumDifficultyHint",
    } )
  } );

  /* -------------------------------------------------------------------------------- */
  /*                                  GM Chat Avatar                                     */
  /* -------------------------------------------------------------------------------- */

  // Chat Avatar settings Header
  // game.settings.register( "ed4e", "chatAvatarHeader", {
  //     name: "ED.Settings.Chat.chatAvatarHeader",
  //     config: true,
  // } );

  // Chat Avater Options
  game.settings.register( "ed4e", "chatAvatar", {
    name:    "ED.Settings.Chat.chatAvatar",
    hint:    "ED.Settings.Chat.chatAvatarHint",
    scope:   "world",
    config:  true,
    default: "configuration",
    type:    String,
    choices: {
      configuration: "ED.Settings.Chat.chatAvatarConfiguration",
      selectedToken: "ED.Settings.Chat.chatAvatarToken"
    }
  } );
}