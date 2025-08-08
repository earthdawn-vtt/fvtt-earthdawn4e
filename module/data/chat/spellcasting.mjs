import BaseMessageData from "./base-message.mjs";
import { CHAT } from "../../config/_module.mjs";
import { createContentAnchor } from "../../utils.mjs";

export default class SpellcastingMessageData extends BaseMessageData {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.SpellcastingMessage",
  ];

  static DEFAULT_OPTIONS = {
    actions: {
      rollDamage:  this._onRollDamage,
      runMacro:    this._onRunMacro,
      showSpecial: this._onShowSpecial,
    },
  };

  // endregion

  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {} );
  }

  // region Properties

  /**
   * The spell being cast during the thread weaving.
   * @type {ItemEd|null}
   */
  get spell() {
    return fromUuidSync( this.roll.options.spellUuid );
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {SpellcastingMessageData}
   */
  static async _onRollDamage( event, button ) {}

  /**
   * @type {ApplicationClickAction}
   * @this {SpellcastingMessageData}
   */
  static async _onRunMacro( event, button ) {}

  /**
   * @type {ApplicationClickAction}
   * @this {SpellcastingMessageData}
   */
  static async _onShowSpecial( event, button ) {
    event.preventDefault();

    const spell = this.spell;

    const specialDescription = spell?.system.effect?.details?.special?.description
      ?? game.i18n.localize( "ED.Chat.Flavor.spellNoSpecialDescription" );
    const content = `<div class="flavor-text text--center">
      ${ createContentAnchor( spell ).outerHTML }
      <p>${ specialDescription }</p>
      ${ this.scrollToSourceLink}
    </div>`;

    const message = await CONFIG.ChatMessage.documentClass.create( {
      type:    "common",
      content,
      speaker: ChatMessage.getSpeaker( { actor: this.caster } ),
    } );
    await message.setFlag( game.system.id, CHAT.flags.sourceMessageUuid, this.parent.uuid );
  }

  // endregion

}