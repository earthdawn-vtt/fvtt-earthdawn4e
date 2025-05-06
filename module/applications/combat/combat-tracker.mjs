import { ED4E } from "../../../earthdawn4e.mjs";

export default class CombatTrackerEd extends foundry.applications.sidebar.tabs.CombatTracker {

  /** @inheritDoc */
  _getEntryContextOptions() {
    const getCombatant = li => this.viewed.combatants.get( li.dataset.combatantId );
    return [
      ...super._getEntryContextOptions(),
      {
        name:      "COMBAT.CombatantShowStartRoundPrompt",
        icon:      `<i class="fa-solid ${ED4E.icons.configure}"></i>`,
        condition: li => game.user.isGM || getCombatant( li ).actor === game.user.character,
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