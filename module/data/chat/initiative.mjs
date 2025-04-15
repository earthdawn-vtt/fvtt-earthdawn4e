import BaseMessageData from "./base-message.mjs";

export default class InitiativeMessageData extends BaseMessageData {

  /** @inheritdoc */
  _onCreate( data, options, userId ) {
    super._onCreate( data, options, userId );
    this.rollingActor?.processRoll( this.roll );
  }

}