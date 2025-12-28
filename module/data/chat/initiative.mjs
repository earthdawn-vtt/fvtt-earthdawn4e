import BaseMessageData from "./base-message.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

export default class InitiativeMessageData extends BaseMessageData {

  // region Static Properties

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.ChatMessage.initiative,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Life Cycle Events

  /** @inheritdoc */
  _onCreate( data, options, userId ) {
    super._onCreate( data, options, userId );
    this.rollingActor?.processRoll( this.roll, { rollToMessage: false } );
  }

  // endregion

}