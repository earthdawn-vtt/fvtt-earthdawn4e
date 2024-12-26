export default class ChatMessageEd extends ChatMessage {

  /** @inheritdoc */
  async getHTML() {
    const baseHtml = await super.getHTML();
    if ( typeof this.system.getHTML === "function" ) {
      return this.system.getHTML( baseHtml );
    }
    return baseHtml;
  }

}