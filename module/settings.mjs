import EdIdField from "./data/fields/edid-field.mjs";
import * as ACTORS from "./config/actors.mjs";
import * as CHAT from "./config/chat.mjs";
import * as LEGEND from "./config/legend.mjs";
import * as MAGIC from "./config/magic.mjs";
import * as ROLLS from "./config/rolls.mjs";
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

  // region News

  game.settings.register( SYSTEM_ID, "hideUpdateNews", {
    config:  true,
    scope:   "user",
    type:    new BooleanField( {
      label:   "ED.Settings.Update.hideUpdateNewsName",
      hint:    "ED.Settings.Update.hideUpdateNewsHint",
    } ),
  } );

  // endregion

  // region ED-IDs

  Object.entries( SYSTEM.defaultEdIds ).forEach( ( [ name, edid ] ) => {
    game.settings.register( SYSTEM_ID, getEdidSettingKey( name ), {
      config:  true,
      scope:   "world",
      type:    new EdIdField( {
        initial:  edid,
        label:   `ED.Settings.Edid.${ name }`,
        hint:    `ED.Settings.Edid.${ name }Hint`,
      } ),
    } );
  } );

  // endregion

  // region Controls

  game.settings.register( SYSTEM_ID, "quickDeleteEmbeddedOnShiftClick", {
    config:  true,
    scope:   "world",
    type:    new BooleanField( {
      initial:  false,
      label:    "ED.Settings.LpTracking.quickDeleteEmbeddedOnShiftClick",
      hint:     "ED.Settings.LpTracking.hintQuickDeleteEmbeddedOnShiftClick",
    } ),
  } );

  // endregion

  // region Owned Items

  game.settings.register( SYSTEM_ID, "enforceLivingArmor", {
    config:  true,
    scope:   "world",
    type:    new BooleanField( {
      initial: true,
      label:   "ED.Settings.Label.enforceLivingArmor",
      hint:    "ED.Settings.Hint.enforceLivingArmor",
    } ),
  } );

  // endregion

  // region Character Generation

  // Auto-open char gen on PC document creation
  game.settings.register( SYSTEM_ID, "autoOpenCharGen", {
    config:  true,
    scope:   "world",
    type:    new BooleanField( {
      initial: true,
      label:   "ED.Settings.CharGen.autoOpenCharGen",
      hint:    "ED.Settings.CharGen.hintAutoOpenCharGen",
    } ),
  } );

  // Starting attribute points to spend
  game.settings.register( SYSTEM_ID, "charGenAttributePoints", {
    config:  true,
    scope:   "world",
    type:    new NumberField( {
      initial: 25,
      min:     0,
      step:    1,
      label:   "ED.Settings.CharGen.attributePoints",
      hint:    "ED.Settings.CharGen.hintAttributePoints",
    } ),
  } );

  // Maximum rank that can be assigned to a talent or skill on character generation
  game.settings.register( SYSTEM_ID, "charGenMaxRank", {
    config:  true,
    scope:   "world",
    type:    new NumberField( {
      initial:  3,
      min:      1,
      step:     1,
      label:   "ED.Settings.CharGen.maxRanks",
      hint:    "ED.Settings.CharGen.hintMaxRanks",
    } ),
  } );

  // Maximum circle for learnable spells at character generation
  game.settings.register( SYSTEM_ID, "charGenMaxSpellCircle", {
    config: true,
    scope:  "world",
    type:   new NumberField( {
      required: true,
      nullable: false,
      initial:  2,
      min:      1,
      step:     1,
      integer:  true,
      positive: true,
      label:    "ED.Settings.CharGen.maxSpellCircle",
      hint:     "ED.Settings.CharGen.hintMaxSpellCircle",
    } ),
  } );

  // endregion

  // region LP Tracking

  // LP Tracking On/Off
  game.settings.register( SYSTEM_ID, "lpTrackingUsed", {
    config:  true,
    scope:   "world",
    type:    new BooleanField( {
      initial: true,
      label:   "ED.Settings.LpTracking.lpTrackingUsed",
      hint:    "ED.Settings.LpTracking.hintLpTrackingUsed",
    } ),
  } );

  // LP Tracking Option Attributes
  game.settings.register( SYSTEM_ID, "lpTrackingAttributes", {
    config:  true,
    scope:   "world",
    type:    new StringField( {
      choices:  LEGEND.attributeIncreaseRules,
      initial:  "spendLp",
      label:    "ED.Settings.LpTracking.attributeOptions",
      hint:     "ED.Settings.LpTracking.hintAttributeOption",
    } ),
  } );

  // LP Tracking Option Talents
  game.settings.register( SYSTEM_ID, "lpTrackingCircleTalentRequirements", {
    scope:   "world",
    config:  true,
    type:    new StringField( {
      choices: LEGEND.circleTalentRequirements,
      initial: "disciplineTalents",
      label:   "ED.Settings.LpTracking.circleTalentRequirements",
      hint:    "ED.Settings.LpTracking.hintCircleTalentRequirements",
    } ),
  } );

  // LP Tracking Option Skill Training
  game.settings.register( SYSTEM_ID, "lpTrackingRemoveSilver", {
    config:  true,
    scope:   "world",
    type:    new BooleanField( {
      initial: true,
      label:   "ED.Settings.LpTracking.removeSilver",
      hint:    "ED.Settings.LpTracking.hintRemoveSilver",
    } ),
  } );

  // LP Tracking Max Rank Talent
  game.settings.register( SYSTEM_ID, "lpTrackingMaxRankTalent", {
    config:  true,
    scope:   "world",
    type:    new NumberField( {
      initial: 15,
      min:     0,
      step:    1,
      integer: true,
      label:   "ED.Settings.LpTracking.maxRankTalent",
      hint:    "ED.Settings.LpTracking.hintMaxRankTalent",
    } ),
  } );

  // LP Tracking Max Rank Skill
  game.settings.register( SYSTEM_ID, "lpTrackingMaxRankSkill", {
    config:  true,
    scope:   "world",
    type:    new NumberField( {
      initial: 10,
      min:     0,
      step:    1,
      integer: true,
      label:    "ED.Settings.LpTracking.maxRankSkill",
      hint:    "ED.Settings.LpTracking.hintMaxRankSkill",
    } ),
  } );

  // LP Tracking Max Rank Devotion
  game.settings.register( SYSTEM_ID, "lpTrackingMaxRankDevotion", {
    config:  true,
    scope:   "world",
    type:    new NumberField( {
      min:     0,
      step:    1,
      integer: true,
      initial: 12,
      label:   "ED.Settings.LpTracking.maxRankDevotion",
      hint:    "ED.Settings.LpTracking.hintMaxRankDevotion",
    } ),
  } );

  // LP Tracking Spell Cost
  game.settings.register( SYSTEM_ID, "lpTrackingSpellCost", {
    config:  true,
    scope:   "world",
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
    config:  true,
    scope:   "world",
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
    config:  true,
    scope:   "world",
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
    config:  true,
    scope:   "world",
    type:    new StringField( {
      initial: "fourth",
      choices: ROLLS.stepTables,
      label:   "ED.Settings.StepTable.stepTable",
      hint:    "ED.Settings.StepTable.hint",
    } ),
  } );

  // Encumbrance options
  game.settings.register( SYSTEM_ID, "encumbrance", {
    config:  true,
    scope:   "world",
    type:    new BooleanField( {
      initial: true,
      label:   "ED.Settings.Encumbrance.encumbrance",
      hint:    "ED.Settings.Encumbrance.encumbranceHint",
    } ),
  } );

  // Languages
  game.settings.register( SYSTEM_ID, "languages", {
    config:         true,
    scope:          "world",
    requiresReload: true,
    type:           new SetField(
      new StringField( {
        blank: false,
      } ),
      {
        empty:   false,
        initial:  Object.values( ACTORS.languages ) ,
        label:          "ED.Settings.GameMechanics.languages",
        hint:           "ED.Settings.GameMechanics.languagesHint",
      }
    ),
  } );

  // Spellcasting / Thread Weaving Types
  game.settings.register( SYSTEM_ID, "spellcastingTypes", {
    config:  true,
    scope:   "world",
    type:    new SetField(
      new StringField( {
        blank: false,
      } ),
      {
        empty:   false,
        initial:  Object.values( MAGIC.spellcastingTypes ),
        name:    "ED.Settings.GameMechanics.spellcastingTypes",
        hint:    "ED.Settings.GameMechanics.spellcastingTypesHint",
      }
    )
  } );

  // Split Talents
  game.settings.register( SYSTEM_ID, "talentsSplit", {
    config:  true,
    scope:   "world",
    default: true,
    type:    new BooleanField( {
      initial: true,
      label:   "ED.Settings.talentsSplit",
      hint:    "ED.Settings.talentsSplitHint",
    } ),
  } );

  // Minimum difficulty for tests
  game.settings.register( SYSTEM_ID, "minimumDifficulty", {
    config:  true,
    scope:   "world",
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
    config:  true,
    scope:   "world",
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
    config:  true,
    scope:   "world",
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
    config:  true,
    scope:   "world",
    type:    new StringField( {
      initial:  "configuration",
      choices: CHAT.chatAvatarSettings,
      label:   "ED.Settings.Chat.chatAvatar",
      hint:    "ED.Settings.Chat.chatAvatarHint",
    } ),

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