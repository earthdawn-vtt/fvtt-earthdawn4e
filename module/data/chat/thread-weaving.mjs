import BaseMessageData from "./base-message.mjs";
import { systemTypes } from "../../constants/constants.mjs";

export default class ThreadWeavingMessageData extends BaseMessageData {

  // region Schema

  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {} );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.ThreadWeavingMessage",
  ];

  static DEFAULT_OPTIONS = {
    actions: {
      castSpell:   this._onCastSpell,
    },
  };

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: systemTypes.ChatMessage.threadWeaving,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Properties

  /**
   * The Actor that is rolling the thread weaving.
   * @type {ActorEd|null}
   */
  get caster() {
    return fromUuidSync( this.roll.options.rollingActorUuid );
  }

  /**
   * The spell being cast during the thread weaving.
   * @type {ItemEd|null}
   */
  get spell() {
    return fromUuidSync( this.roll.options.spellUuid );
  }

  // endregion

  // region Event Handlers

  static async _onCastSpell( event, button ) {
    event.preventDefault();

    await this.caster.castSpell( this.spell );
  }

  // endregion

}