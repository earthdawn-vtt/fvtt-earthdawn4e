export default class ChatMessageEd extends ChatMessage {

  /** @inheritDoc */
  async renderHTML( { canDelete, canClose = false } = {} ) {
    const baseHtml = await super.renderHTML( { canDelete, canClose } );

    if ( typeof this.system.renderHTML === "function" ) return this.system.renderHTML( baseHtml );

    return baseHtml;
  }
}