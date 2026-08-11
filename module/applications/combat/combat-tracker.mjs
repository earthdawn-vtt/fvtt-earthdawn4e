import * as SYSTEM from "../../config/system.mjs";

/**
 * @inheritDoc
 */
export default class CombatTrackerEd extends foundry.applications.sidebar.tabs.CombatTracker {

  /** @inheritDoc */
  _getEntryContextOptions() {
    const getCombatant = li => this.viewed.combatants.get( li.dataset.combatantId );
    return [
      ...super._getEntryContextOptions(),
      {
        name:      "COMBAT.CombatantShowStartRoundPrompt",
        icon:      `<i class="fa-solid ${SYSTEM.icons.eye}"></i>`,
        condition: li => ( game.user.isGM || getCombatant( li ).actor === game.user.character ) && getCombatant( li ).system.savePromptSettings,
        callback:  li => {
          const combatant = getCombatant( li );
          if ( !combatant ) return;
          combatant.update( {
            "system.savePromptSettings": !combatant.system.savePromptSettings,
          } );
        },
      },
      {
        name:      "COMBAT.CombatantHideStartRoundPrompt",
        icon:      `<i class="fa-solid ${SYSTEM.icons.eyeSlash}"></i>`,
        condition: li => ( game.user.isGM || getCombatant( li ).actor === game.user.character ) && !getCombatant( li ).system.savePromptSettings,
        callback:  li => {
          const combatant = getCombatant( li );
          if ( !combatant ) return;
          combatant.update( {
            "system.savePromptSettings": !combatant.system.savePromptSettings,
          } );
        },
      },
    ];
  }

}