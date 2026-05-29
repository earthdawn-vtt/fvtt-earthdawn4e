import { SYSTEM_ID } from "../constants/constants.mjs";
import * as SYSTEM from "../config/system.mjs";
import GameMechanicsSettingsConfig from "../applications/settings/game-mechanics-settings.mjs";
import EdidSettingsConfig from "../applications/settings/edid-settings.mjs";
import CharacterGenerationSettingsConfig from "../applications/settings/character-generation-settings.mjs";
import LpTrackingSettingsConfig from "../applications/settings/lp-tracking-settings.mjs";
import EdIdField from "../data/fields/edid-field.mjs";
import * as LEGEND from "../config/legend.mjs";
import * as ROLLS from "../config/rolls.mjs";
import * as ACTORS from "../config/actors.mjs";
import * as MAGIC from "../config/magic.mjs";
import * as CHAT from "../config/chat.mjs";
import { getEdidSettingKey } from "../helpers/settings.mjs";


const { BooleanField, NumberField, SetField, StringField } = foundry.data.fields;

// region Setting Data

/**
 * @typedef {
 *   SettingSubMenuConfig | {
 *     key: string;
 *     submenu: boolean;
 *   }
 * } SystemSettingGroupConfig
 * @property {string} key The key of the setting group/menu
 * @property {boolean} submenu Whether this group should have its own submenu in the settings config
 */

/**
 * @typedef {SettingConfig & {
 *   group: string;
 *   key: string;
 * }} SystemSettingConfig
 * @property {string} group The group of the setting for which a sub-menu is created
 * @property {string} key The key of the setting
 */

/**
 *
 * @type {SystemSettingGroupConfig[]}
 */
export const settingGroups = [
  {
    key:        "gameMechanics",
    submenu:    true,
    hint:       "ED.Settings.Groups.GameMechanics.hint",
    icon:       `fa-solid ${ SYSTEM.icons.configure }`,
    label:      "ED.Settings.Groups.GameMechanics.label",
    name:       "ED.Settings.Groups.GameMechanics.name",
    restricted: true,
    type:       GameMechanicsSettingsConfig
  },
  {
    key:     "updates",
    submenu: false,
    hint:    "ED.Settings.Groups.Updates.hint",
    label:   "ED.Settings.Groups.Updates.label",
    name:    "ED.Settings.Groups.Updates.name"
  },
  {
    key:        "edid",
    submenu:    true,
    hint:       "ED.Settings.Groups.Edid.hint",
    icon:       `fa-solid ${ SYSTEM.icons.configure }`,
    label:      "ED.Settings.Groups.Edid.label",
    name:       "ED.Settings.Groups.Edid.name",
    restricted: false,
    type:       EdidSettingsConfig
  },
  {
    key:     "controls",
    submenu: false,
    hint:    "ED.Settings.Groups.Controls.hint",
    label:   "ED.Settings.Groups.Controls.label",
    name:    "ED.Settings.Groups.Controls.name"
  },
  {
    key:        "characterGeneration",
    submenu:    true,
    hint:       "ED.Settings.Groups.CharGen.hint",
    icon:       `fa-solid ${ SYSTEM.icons.character }`,
    label:      "ED.Settings.Groups.CharGen.label",
    name:       "ED.Settings.Groups.CharGen.name",
    restricted: false,
    type:       CharacterGenerationSettingsConfig
  },
  {
    key:        "lpTracking",
    submenu:    true,
    hint:       "ED.Settings.Groups.LpTracking.hint",
    icon:       `fa-solid ${ SYSTEM.icons.lpTracking }`,
    label:      "ED.Settings.Groups.LpTracking.label",
    name:       "ED.Settings.Groups.LpTracking.name",
    restricted: true,
    type:       LpTrackingSettingsConfig
  },
  {
    key:     "chat",
    submenu: false,
    hint:    "ED.Settings.Groups.Chat.hint",
    label:   "ED.Settings.Groups.Chat.label",
    name:    "ED.Settings.Groups.Chat.name"
  },
  {
    key:     "debug",
    submenu: false,
    hint:    "ED.Settings.Groups.Debug.hint",
    label:   "ED.Settings.Groups.Debug.label",
    name:    "ED.Settings.Groups.Debug.name"
  }
];

/**
 * The {@link settingGroups} indexed by their group/menu key.
 * @type {Record<string, SystemSettingGroupConfig>}
 */
export const settingGroupsByKey = Object.fromEntries(
  settingGroups.map( group => [ group.key, group ] )
);

/**
 * The data for all settings associated with the system.
 * @type {SystemSettingConfig[]}
 */
export const systemSettings = [

  // region Updates

  {
    group:  settingGroupsByKey.updates.key,
    key:    "hideUpdateNews",
    config: true,
    scope:  "user",
    type:   new BooleanField( {
      label: "ED.Settings.Update.hideUpdateNewsName",
      hint:  "ED.Settings.Update.hideUpdateNewsHint"
    } )
  },

  // endregion

  // region ED-IDs

  ...Object.entries( SYSTEM.defaultEdIds ).map( ( [ name, edid ] ) => {
    return {
      group:  settingGroupsByKey.edid.key,
      key:    getEdidSettingKey( name ),
      config: false,
      scope:  "world",
      type:   new EdIdField( {
        initial: edid,
        label:   `ED.Settings.Edid.${ name }`,
        hint:    `ED.Settings.Edid.${ name }Hint`
      } )
    };
  } ),

  // endregion

  // region Controls

  {
    group:  settingGroupsByKey.controls.key,
    key:    "quickDeleteEmbeddedOnShiftClick",
    config: true,
    scope:  "world",
    type:   new BooleanField( {
      initial: false,
      label:   "ED.Settings.LpTracking.quickDeleteEmbeddedOnShiftClick",
      hint:    "ED.Settings.LpTracking.hintQuickDeleteEmbeddedOnShiftClick"
    } )
  },

  // endregion

  // region Character Generation

  // Auto-open char gen on PC document creation
  {
    group:  settingGroupsByKey.characterGeneration.key,
    key:    "autoOpenCharGen",
    config: false,
    scope:  "world",
    type:   new BooleanField( {
      initial: true,
      label:   "ED.Settings.CharGen.autoOpenCharGen",
      hint:    "ED.Settings.CharGen.hintAutoOpenCharGen"
    } )
  },

  // Starting attribute points to spend
  {
    group:  settingGroupsByKey.characterGeneration.key,
    key:    "charGenAttributePoints",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      initial: 25,
      min:     0,
      step:    1,
      label:   "ED.Settings.CharGen.attributePoints",
      hint:    "ED.Settings.CharGen.hintAttributePoints"
    } )
  },

  // Maximum rank that can be assigned to a talent or skill on character generation
  {
    group:  settingGroupsByKey.characterGeneration.key,
    key:    "charGenMaxRank",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      initial: 3,
      min:     1,
      step:    1,
      label:   "ED.Settings.CharGen.maxRanks",
      hint:    "ED.Settings.CharGen.hintMaxRanks"
    } )
  },

  // Maximum circle for learnable spells at character generation
  {
    group:  settingGroupsByKey.characterGeneration.key,
    key:    "charGenMaxSpellCircle",
    config: false,
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
      hint:     "ED.Settings.CharGen.hintMaxSpellCircle"
    } )
  },

  // endregion

  // region LP Tracking

  // LP Tracking On/Off
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingUsed",
    config: false,
    scope:  "world",
    type:   new BooleanField( {
      initial: true,
      label:   "ED.Settings.LpTracking.lpTrackingUsed",
      hint:    "ED.Settings.LpTracking.hintLpTrackingUsed"
    } )
  },

  // LP Tracking Option Attributes
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingAttributes",
    config: false,
    scope:  "world",
    type:   new StringField( {
      choices: LEGEND.attributeIncreaseRules,
      initial: "spendLp",
      label:   "ED.Settings.LpTracking.attributeOptions",
      hint:    "ED.Settings.LpTracking.hintAttributeOption"
    } )
  },

  // LP Tracking Option Talents
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingCircleTalentRequirements",
    scope:  "world",
    config: false,
    type:   new StringField( {
      choices: LEGEND.circleTalentRequirements,
      initial: "disciplineTalents",
      label:   "ED.Settings.LpTracking.circleTalentRequirements",
      hint:    "ED.Settings.LpTracking.hintCircleTalentRequirements"
    } )
  },

  // LP Tracking Option Skill Training
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingRemoveSilver",
    config: false,
    scope:  "world",
    type:   new BooleanField( {
      initial: true,
      label:   "ED.Settings.LpTracking.removeSilver",
      hint:    "ED.Settings.LpTracking.hintRemoveSilver"
    } )
  },

  // LP Tracking Max Rank Talent
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingMaxRankTalent",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      initial: 15,
      min:     0,
      step:    1,
      integer: true,
      label:   "ED.Settings.LpTracking.maxRankTalent",
      hint:    "ED.Settings.LpTracking.hintMaxRankTalent"
    } )
  },

  // LP Tracking Max Rank Skill
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingMaxRankSkill",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      initial: 10,
      min:     0,
      step:    1,
      integer: true,
      label:   "ED.Settings.LpTracking.maxRankSkill",
      hint:    "ED.Settings.LpTracking.hintMaxRankSkill"
    } )
  },

  // LP Tracking Max Rank Devotion
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingMaxRankDevotion",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      min:     0,
      step:    1,
      integer: true,
      initial: 12,
      label:   "ED.Settings.LpTracking.maxRankDevotion",
      hint:    "ED.Settings.LpTracking.hintMaxRankDevotion"
    } )
  },

  // LP Tracking Spell Cost
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingSpellCost",
    config: false,
    scope:  "world",
    type:   new StringField( {
      required: true,
      nullable: false,
      blank:    false,
      initial:  "noviceTalent",
      choices:  LEGEND.spellCostRules,
      label:    "ED.Settings.LpTracking.spellCost",
      hint:     "ED.Settings.LpTracking.hintSpellCost"
    } )
  },

  // LP Tracking Use Patterncraft to Learn Spell
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingLearnSpellUsePatterncraft",
    config: false,
    scope:  "world",
    type:   new BooleanField( {
      required: true,
      nullable: false,
      initial:  true,
      label:    "ED.Settings.LpTracking.learnSpellUsePatterncraft",
      hint:     "ED.Settings.LpTracking.hintLearnSpellUsePatterncraft"
    } )
  },

  // LP Tracking Learn Spells on Circle Up
  {
    group:  settingGroupsByKey.lpTracking.key,
    key:    "lpTrackingLearnSpellsOnCircleUp",
    config: false,
    scope:  "world",
    type:   new BooleanField( {
      required: true,
      nullable: false,
      initial:  true,
      label:    "ED.Settings.LpTracking.learnSpellsOnCircleUp",
      hint:     "ED.Settings.LpTracking.hintLearnSpellsOnCircleUp"
    } )
  },

  // endregion

  // region Game Mechanics

  // Step Table used for step-to-dice conversion
  {
    group:  settingGroupsByKey.gameMechanics.key,
    key:    "stepTable",
    config: false,
    scope:  "world",
    type:   new StringField( {
      initial: "fourth",
      choices: ROLLS.stepTables,
      label:   "ED.Settings.StepTable.stepTable",
      hint:    "ED.Settings.StepTable.hint"
    } )
  },

  // Encumbrance options
  {
    group:  settingGroupsByKey.gameMechanics.key,
    key:    "encumbrance",
    config: false,
    scope:  "world",
    type:   new BooleanField( {
      initial: true,
      label:   "ED.Settings.Encumbrance.encumbrance",
      hint:    "ED.Settings.Encumbrance.encumbranceHint"
    } )
  },

  // Languages
  {
    group:          settingGroupsByKey.gameMechanics.key,
    key:            "languages",
    config:         false,
    scope:          "world",
    requiresReload: true,
    type:           new SetField(
      new StringField( {
        blank: false
      } ),
      {
        empty:   false,
        initial: Object.values( ACTORS.languages ),
        label:   "ED.Settings.GameMechanics.languages",
        hint:    "ED.Settings.GameMechanics.languagesHint"
      }
    )
  },

  // Spellcasting / Thread Weaving Types
  {
    group:  settingGroupsByKey.gameMechanics.key,
    key:    "spellcastingTypes",
    config: false,
    scope:  "world",
    type:   new SetField(
      new StringField( {
        blank: false
      } ),
      {
        empty:   false,
        initial: Object.values( MAGIC.spellcastingTypes ),
        name:    "ED.Settings.GameMechanics.spellcastingTypes",
        hint:    "ED.Settings.GameMechanics.spellcastingTypesHint"
      }
    )
  },

  // Split Talents
  {
    group:   settingGroupsByKey.gameMechanics.key,
    key:     "talentsSplit",
    config:  false,
    scope:   "world",
    default: true,
    type:    new BooleanField( {
      initial: true,
      label:   "ED.Settings.talentsSplit",
      hint:    "ED.Settings.talentsSplitHint"
    } )
  },

  // Minimum difficulty for tests
  {
    group:  settingGroupsByKey.gameMechanics.key,
    key:    "minimumDifficulty",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      required: true,
      nullable: false,
      min:      0,
      initial:  2,
      step:     1,
      integer:  true,
      label:    "ED.Settings.GameMechanics.minimumDifficulty",
      hint:     "ED.Settings.GameMechanics.minimumDifficultyHint"
    } )
  },

  // Strain cost for jump up tests
  {
    group:  settingGroupsByKey.gameMechanics.key,
    key:    "jumpUpStrainCost",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      required: true,
      nullable: false,
      min:      0,
      initial:  2,
      step:     1,
      integer:  true,
      label:    "ED.Settings.GameMechanics.jumpUpStrainCost",
      hint:     "ED.Settings.GameMechanics.jumpUpStrainCostHint"
    } )
  },

  // Base difficulty for jump up tests
  {
    group:  settingGroupsByKey.gameMechanics.key,
    key:    "jumpUpBaseDifficulty",
    config: false,
    scope:  "world",
    type:   new NumberField( {
      required: true,
      nullable: false,
      min:      1,
      initial:  6,
      step:     1,
      integer:  true,
      label:    "ED.Settings.GameMechanics.jumpUpBaseDifficulty",
      hint:     "ED.Settings.GameMechanics.jumpUpBaseDifficultyHint"
    } )
  },

  // Enforce Living Armor
  {
    group:  settingGroupsByKey.gameMechanics.key,
    key:    "enforceLivingArmor",
    config: false,
    scope:  "world",
    type:   new BooleanField( {
      initial: true,
      label:   "ED.Settings.Label.enforceLivingArmor",
      hint:    "ED.Settings.Hint.enforceLivingArmor"
    } )
  },

  // endregion

  // region Chat

  // Chat Avatar Options
  {
    group:  settingGroupsByKey.chat.key,
    key:    "chatAvatar",
    config: true,
    scope:  "world",
    type:   new StringField( {
      initial: "configuration",
      choices: CHAT.chatAvatarSettings,
      label:   "ED.Settings.Chat.chatAvatar",
      hint:    "ED.Settings.Chat.chatAvatarHint"
    } )

  },

  // endregion

  // region Debug

  {
    group:  settingGroupsByKey.debug.key,
    key:    "debugMode",
    config: true,
    scope:  "user",
    type:   new BooleanField( {
      label: "ED.Settings.Label.debugMode",
      hint:  "ED.Settings.Hint.debugMode"
    } )
  }

  // endregion

];

/**
 * The {@link systemSettings} indexed by the setting key.
 * @type {Record<string, SystemSettingConfig>}
 */
export const systemSettingsByKey = Object.fromEntries(
  systemSettings.map( setting => [ setting.key, setting ] )
);

/**
 * The {@link systemSettings} indexed by the setting group.
 * @type {Record<string, SystemSettingConfig[]>}
 */
export const groupedSystemSettings = systemSettings.reduce( ( acc, setting ) => {
  if ( !acc[setting.group] ) acc[setting.group] = [];
  acc[setting.group].push( setting );
  return acc;
}, {} );

// endregion

/**
 * Register all the system's settings.
 */
export default function registerSystemSettings() {

  for ( const systemSetting of systemSettings ) {
    game.settings.register( SYSTEM_ID, systemSetting.key, systemSetting );
  }

  for ( const [ group, groupConfig ] of Object.entries( settingGroupsByKey ) ) {
    if ( !groupConfig.submenu ) continue;
    game.settings.registerMenu(
      SYSTEM_ID,
      group,
      groupConfig
    );
  }

}