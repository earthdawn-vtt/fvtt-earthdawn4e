import BaseMessageData from "./base-message.mjs";
import { CHAT } from "../../config/_module.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

export default class SpellcastingMessageData extends BaseMessageData {

  // region Schema

  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {} );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.SpellcastingMessage",
  ];

  static DEFAULT_OPTIONS = {
    actions: {
      rollDamage:  this._onRollDamage,
      rollEffect:  this._onRollEffect,
      runMacro:    this._onRunMacro,
      showSpecial: this._onShowSpecial,
    },
  };

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.ChatMessage.spellcasting,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Properties

  // endregion

  // region Getters

  /**
   * Get the actor that casts the spell from the roll options.
   * @returns {Promise<ActorEd|null>} The spellcaster, or null if it cannot be found.
   */
  async getCaster() {
    return fromUuid( this.roll.options.rollingActorUuid );
  }

  /**
   * Get the spell being cast from the roll options.
   * @returns {Promise<ItemEd|null>} The spell being cast, or null if it cannot be found.
   */
  async getSpell() {
    return fromUuid( this.roll.options.spellUuid );
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {SpellcastingMessageData}
   */
  static async _onRollDamage( event, button ) {
    event.preventDefault();

    const spell = await this.getSpell();
    await spell.system.rollDamage();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {SpellcastingMessageData}
   */
  static async _onRollEffect( event, button ) {
    event.preventDefault();

    const spell = await this.getSpell();
    await spell.system.rollEffect();
  }

  /**
   * @type {ApplicationClickAction}
   * @this {SpellcastingMessageData}
   */
  static async _onRunMacro( event, button ) {
    event.preventDefault();

    const actor = await fromUuid( this.roll.options.rollingActorUuid );
    const spell = await this.getSpell();
    spell.system.runMacro( {
      event,
      actor,
      spell,
    } );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {SpellcastingMessageData}
   */
  static async _onShowSpecial( event, button ) {
    event.preventDefault();

    const spell = await this.getSpell();

    const specialDescription = spell?.system.effect?.details?.special?.description
      || spell?.system.description?.value
      || game.i18n.localize( "ED.Chat.Flavor.spellNoSpecialDescription" );
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