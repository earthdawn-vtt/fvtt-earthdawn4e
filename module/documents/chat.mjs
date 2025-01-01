export default class ChatMessageEd extends ChatMessage {

  /** @inheritdoc */
  async getHTML() {
    const baseHtml = await super.getHTML();

    // the return type of getHTML is jQuery, so we need to convert it to a HTMLElement
    // this behavior is going to change to HTMLElement in the future
    if ( baseHtml.length !== 1 ) throw new Error( "The base HTML element must be a single element" );
    if ( typeof this.system.getHTML === "function" ) return $( await this.system.getHTML( baseHtml[0] ) );

    return baseHtml;
  }

}