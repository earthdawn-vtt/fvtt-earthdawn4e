import { highlightElement } from "../utils.mjs";

export default class ChatMessageEd extends ChatMessage {

  /**
   * Scrolls the chat log to the message with the given ID.
   * If the message is found, it will be scrolled into view and optionally highlighted.
   * @param {string} messageId - The ID of the message to scroll to (not UUID!).
   * @param {boolean} [highlight] - Whether to highlight the message after scrolling.
   */
  scrollToMessage( messageId, highlight = true ) {
    const messageElement = document.querySelector(
      `.chat-log [data-message-id="${ messageId }"]`
    );

    if ( messageElement ) {
      messageElement.scrollIntoView();
      if ( highlight ) highlightElement( messageElement, );
    }
    else {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.couldNotScrollToSourceMessage" )
      );
    }
  }

}