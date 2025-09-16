import ED4E from "./config/_module.mjs";

import EdIdField from "./data/fields/edid-field.mjs";

const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;


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
  return Object.keys(
    ED4E.defaultEdIds
  ).map(
    edid => getDefaultEdid( edid )
  );
}

/**
 * Get the default edid from settings for a given key.
 * @param {string} defaultKey - The key of the default edid to retrieve, as defined in {@link SYSTEM.defaultEdIds}.
 * @returns {string} The default edid associated with the provided key.
 */
export function getDefaultEdid( defaultKey ) {
  return getSetting(
    getEdidSettingKey( defaultKey )
  );
}

/**
 * Generates a formatted EDID setting key based on the provided EDID name.
 * @param {string} edidName - The name of the EDID to be formatted into a key.
 * @returns {string} The formatted EDID setting key.
 */
export function getEdidSettingKey( edidName ) {
  return `edid${ edidName.capitalize() }`;
}

/**
 * Register all the system's settings.
 */
export default function registerSystemSettings() {

  /* -------------------------------------------------------------------------------- */
  /*                             Update & Migration                                   */
  /* -------------------------------------------------------------------------------- */

  game.settings.register( "ed4e", "updateNews", {
    name:    "ED.Settings.Update.updateNews.label",
    hint:    "ED.Settings.Update.updateNews.hint",
    scope:   "user",
    type:    Boolean,
    config:  true,
    default: false
  } );

  game.settings.register( "ed4e", "migrationReport", {
    name:    "ED.Settings.Update.migrationReport.label",
    hint:    "ED.Settings.Update.migrationReport.hint",
    scope:   "user",
    type:    Boolean,
    config:  true,
    default: true
  } );

  /* -------------------------------------------------------------------------------- */
  /*                                      ED-IDs                                      */
  /* -------------------------------------------------------------------------------- */

  Object.entries( ED4E.defaultEdIds ).forEach( ( [ name, edid ] ) => {
    game.settings.register( "ed4e", getEdidSettingKey( name ), {
      name:    `ED.Settings.Edid.${ name }`,
      hint:    `ED.Settings.Edid.${ name }Hint`,
      scope:   "world",
      config:  true,
      default: edid,
      type:    new EdIdField(),
    } );
  } );


  // region CONTROLS

  game.settings.register( "ed4e", "quickDeleteEmbeddedOnShiftClick", {
    config:  true,
    type:    new BooleanField( {
      initial:  false,
      label:    "ED.Settings.LpTracking.quickDeleteEmbeddedOnShiftClick",
      hint:     "ED.Settings.LpTracking.hintQuickDeleteEmbeddedOnShiftClick",
    } ),
  } );

  // endregion

  /* -------------------------------------------------------------------------------- */
  /*                                  STEP TABLES                                     */
  /* -------------------------------------------------------------------------------- */

  // Step Table used for step to dice conversion
  game.settings.register( "ed4e", "stepTable", {
    name:    "ED.Settings.StepTable.stepTable",
    hint:    "ED.Settings.StepTable.hint",
    scope:   "world",
    config:  true,
    default: "fourth",
    type:    String,
    choices: {
      classic: "ED.Settings.StepTable.editionClassic",
      first:   "ED.Settings.StepTable.editionFirst",
      third:   "ED.Settings.StepTable.editionThird",
      fourth:  "ED.Settings.StepTable.editionFourth"
    }
  } );

  /* -------------------------------------------------------------------------------- */
  /*                                  OWNED ITEMS                                     */
  /* -------------------------------------------------------------------------------- */

  // Should Living Armor checked on Namegivers
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
    type:   new NumberField( {
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
    type:    new StringField( {
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
    type:    new NumberField( {
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
    type:    new NumberField( {
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
    type:    new NumberField( {
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
    type:    new StringField( {
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
    type:    new BooleanField( {
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
    type:    new BooleanField( {
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

  // Languages
  game.settings.register( "ed4e", "languages", {
    name:   "ED.Settings.GameMechanics.languages",
    hint:   "ED.Settings.GameMechanics.languagesHint",
    scope:  "world",
    config: true,
    type:   new SetField(
      new StringField( {
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
    name:    "ED.Settings.GameMechanics.spellcastingTypes",
    hint:    "ED.Settings.GameMechanics.spellcastingTypesHint",
    scope:   "world",
    config:  true,
    default:  Object.values( ED4E.spellcastingTypes ),
    type:    new SetField(
      new StringField( {
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
    type:    new NumberField( {
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

  // Chat Avatar Options
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