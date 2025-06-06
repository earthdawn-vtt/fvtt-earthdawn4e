export default class TokenHUDEd extends foundry.applications.hud.TokenHUD {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      effect: {
        handler: TokenHUDEd.#onToggleEffect,
        buttons: [ 0, 2 ],
      },
    },
  };

  // region Handlers

  /** @inheritDoc */
  static async #onToggleEffect( event, target ) {
    if ( !this.actor ) {
      ui.notifications.warn( "ED.Notifications.Warn.warningEffectNoActor", { localize: true } );
      return;
    }

    const statusId = target.dataset.statusId;
    const { levels, hud } = CONFIG.ED4E.STATUS_CONDITIONS[ statusId ];
    const isLeveled = levels && ( levels > 0 ) && hud;
    const active = isLeveled ? event.button === 0 : undefined;

    await this.actor.toggleStatusEffect( statusId, { active, overlay: event.button === 2 } );
  }

  // endregion

}