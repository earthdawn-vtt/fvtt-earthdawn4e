import EdIdField from "./data/fields/edid-field.mjs";
import * as ACTORS from "./config/actors.mjs";
import * as LEGEND from "./config/legend.mjs";
import * as MAGIC from "./config/magic.mjs";
import * as SYSTEM from "./config/system.mjs";
import { SYSTEM_ID } from "./constants/constants.mjs";

const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;


/**
 * Get an ed4e setting from the system settings.
 * @param {string} settingKey   The key of the setting to get.
 * @returns {*}                 The value of the setting.
 */
export function getSetting( settingKey ) {
  return game.settings.get( SYSTEM_ID, settingKey );
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
  return game.settings.set( SYSTEM_ID, settingKey, value, options );
}

/**
 * Get all available ed-ids from the system settings.
 * @returns {string[]} - A list of all available ed-ids.
 */
export function getEdIds() {
  return Object.keys(
    SYSTEM.defaultEdIds
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

  // region ED-IDs

  game.settings.register( SYSTEM_ID, "updateNews", {
    name:    "ED.Settings.Update.updateNewsName",
    hint:    "ED.Settings.Update.updateNewsHint",
    scope:   "user",
    type:    Boolean,
    config:  true,
    default: false
  } );

  Object.entries( SYSTEM.defaultEdIds ).forEach( ( [ name, edid ] ) => {
    game.settings.register( SYSTEM_ID, getEdidSettingKey( name ), {
      name:    `ED.Settings.Edid.${ name }`,
      hint:    `ED.Settings.Edid.${ name }Hint`,
      scope:   "world",
      config:  true,
      default: edid,
      type:    new EdIdField(),
    } );
  } );

  // endregion

  // region Controls

  game.settings.register( SYSTEM_ID, "quickDeleteEmbeddedOnShiftClick", {
    config:  true,
    type:    new BooleanField( {
      initial:  false,
      label:    "ED.Settings.LpTracking.quickDeleteEmbeddedOnShiftClick",
      hint:     "ED.Settings.LpTracking.hintQuickDeleteEmbeddedOnShiftClick",
    } ),
  } );

  // endregion

  // region Owned Items

  // Should Living Armor checked on Namegivers
  game.settings.register( SYSTEM_ID, "enforceLivingArmor", {
    name:    "ED.Settings.Label.enforceLivingArmor",
    hint:    "ED.Settings.Hint.enforceLivingArmor",
    scope:   "world",
    config:  true,
    type:    Boolean,
    default: true,
  } );

  // endregion

  // region Character Generation

  // Auto open char gen on PC document creation
  game.settings.register( SYSTEM_ID, "autoOpenCharGen", {
    name:    "ED.Settings.CharGen.autoOpenCharGen",
    hint:    "ED.Settings.CharGen.hintAutoOpenCharGen",
    scope:   "world",
    config:  true,
    type:    Boolean,
    default: true,
  } );

  // Starting attribute points to spend
  game.settings.register( SYSTEM_ID, "charGenAttributePoints", {
    name:    "ED.Settings.CharGen.attributePoints",
    hint:    "ED.Settings.CharGen.hintAttributePoints",
    scope:   "world",
    config:  true,
    type:    Number,
    default: 25,
  } );

  // Maximum rank that can be assigned to a talent or skill on character generation
  game.settings.register( SYSTEM_ID, "charGenMaxRank", {
    name:    "ED.Settings.CharGen.maxRanks",
    hint:    "ED.Settings.CharGen.hintMaxRanks",
    scope:   "world",
    config:  true,
    type:    Number,
    default: 3,
  } );

  // Maximum circle for learnable spells at character generation
  game.settings.register( SYSTEM_ID, "charGenMaxSpellCircle", {
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

  // endregion

  // region LP Tracking

  // LP Tracking On/Off
  game.settings.register( SYSTEM_ID, "lpTrackingUsed", {
    name:    "ED.Settings.LpTracking.lpTrackingUsed",
    hint:    "ED.Settings.LpTracking.hintLpTrackingUsed",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  // LP Tracking Option Attributes
  game.settings.register( SYSTEM_ID, "lpTrackingAttributes", {
    name:    "ED.Settings.LpTracking.attributeOptions",
    hint:    "ED.Settings.LpTracking.hintAttributeOption",
    scope:   "world",
    config:  true,
    type:    new StringField( {
      initial:  "spendLp",
      choices:  LEGEND.attributeIncreaseRules,
      label:    "ED.Settings.LpTracking.attributeOptions",
      hint:     "ED.Settings.LpTracking.hintAttributeOption",
    } ),
  } );

  // LP Tracking Option Talents
  game.settings.register( SYSTEM_ID, "lpTrackingCircleTalentRequirements", {
    name:    "ED.Settings.LpTracking.circleTalentRequirements",
    hint:    "ED.Settings.LpTracking.hintCircleTalentRequirements",
    scope:   "world",
    config:  true,
    default: "disciplineTalents",
    type:    String,
    choices: LEGEND.circleTalentRequirements,
  } );

  // LP Tracking Option Skill Training
  game.settings.register( SYSTEM_ID, "lpTrackingRemoveSilver", {
    name:    "ED.Settings.LpTracking.removeSilver",
    hint:    "ED.Settings.LpTracking.hintRemoveSilver",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  // LP Tracking Max Rank Talent
  game.settings.register( SYSTEM_ID, "lpTrackingMaxRankTalent", {
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
  game.settings.register( SYSTEM_ID, "lpTrackingMaxRankSkill", {
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
  game.settings.register( SYSTEM_ID, "lpTrackingMaxRankDevotion", {
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
  game.settings.register( SYSTEM_ID, "lpTrackingSpellCost", {
    name:    "ED.Settings.LpTracking.spellCost",
    hint:    "ED.Settings.LpTracking.hintSpellCost",
    scope:   "world",
    config:  true,
    type:    new StringField( {
      required: true,
      nullable: false,
      blank:    false,
      initial:  "noviceTalent",
      choices:  LEGEND.spellCostRules,
      label:    "ED.Settings.LpTracking.spellCost",
      hint:     "ED.Settings.LpTracking.hintSpellCost",
    } ),
  } );

  // LP Tracking Use Patterncraft to Learn Spell
  game.settings.register( SYSTEM_ID, "lpTrackingLearnSpellUsePatterncraft", {
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
  game.settings.register( SYSTEM_ID, "lpTrackingLearnSpellsOnCircleUp", {
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

  // endregion

  // region Game Mechanics

  // Step Table used for step-to-dice conversion
  game.settings.register( SYSTEM_ID, "stepTable", {
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

  // Encumbrance options
  game.settings.register( SYSTEM_ID, "encumbrance", {
    name:    "ED.Settings.Encumbrance.encumbrance",
    hint:    "ED.Settings.Encumbrance.encumbranceHint",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  // Languages
  game.settings.register( SYSTEM_ID, "languages", {
    name:           "ED.Settings.GameMechanics.languages",
    hint:           "ED.Settings.GameMechanics.languagesHint",
    scope:          "world",
    config:         true,
    requiresReload: true,
    type:           new SetField(
      new StringField( {
        blank: false,
      } ),
      {
        empty:   false,
        initial:  Object.values( ACTORS.languages ) ,
      }
    ),
  } );

  // Spellcasting / Thread Weaving Types
  game.settings.register( SYSTEM_ID, "spellcastingTypes", {
    name:    "ED.Settings.GameMechanics.spellcastingTypes",
    hint:    "ED.Settings.GameMechanics.spellcastingTypesHint",
    scope:   "world",
    config:  true,
    default:  Object.values( MAGIC.spellcastingTypes ),
    type:    new SetField(
      new StringField( {
        blank: false,
      } ),
      {
        empty:   false,
        initial:  Object.values( MAGIC.spellcastingTypes ),
      }
    )
  } );

  // Split Talents
  game.settings.register( SYSTEM_ID, "talentsSplit", {
    name:    "ED.Settings.talentsSplit",
    hint:    "ED.Settings.talentsSplitHint",
    scope:   "world",
    config:  true,
    default: true,
    type:    Boolean
  } );

  // Minimum difficulty for tests
  game.settings.register( SYSTEM_ID, "minimumDifficulty", {
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

  // Strain cost for jump up tests
  game.settings.register( SYSTEM_ID, "jumpUpStrainCost", {
    scope:   "world",
    config:  true,
    type:    new NumberField( {
      required: true,
      nullable: false,
      min:      0,
      initial:  2,
      step:     1,
      integer:  true,
      label:    "ED.Settings.GameMechanics.jumpUpStrainCost",
      hint:     "ED.Settings.GameMechanics.jumpUpStrainCostHint",
    } ),
  } );

  // Base difficulty for jump up tests
  game.settings.register( SYSTEM_ID, "jumpUpBaseDifficulty", {
    scope:   "world",
    config:  true,
    type:    new NumberField( {
      required: true,
      nullable: false,
      min:      1,
      initial:  6,
      step:     1,
      integer:  true,
      label:    "ED.Settings.GameMechanics.jumpUpBaseDifficulty",
      hint:     "ED.Settings.GameMechanics.jumpUpBaseDifficultyHint",
    } ),
  } );

  // endregion

  // region Chat

  // Chat Avatar Options
  game.settings.register( SYSTEM_ID, "chatAvatar", {
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

  // endregion

  // region Debug

  game.settings.register( SYSTEM_ID, "debugMode", {
    config: true,
    scope:  "user",
    type:   new BooleanField( {
      label:    "ED.Settings.Label.debugMode",
      hint:     "ED.Settings.Hint.debugMode",
    } ),
  } );

  // endregion

}