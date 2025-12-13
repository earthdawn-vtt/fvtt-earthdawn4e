import { preLocalize } from "../utils.mjs";


/**
 * The available chat commands with their corresponding help text.
 * @enum {string}
 */
export const chatCommands = {
  char:     "ED.Chat.Commands.char",
  coin:     "ED.Chat.Commands.coin",
  group:    "ED.Chat.Commands.group",
  h:        "ED.Chat.Commands.help",
  help:     "ED.Chat.Commands.help",
  import:   "ED.Chat.Commands.import",
  lp:       "ED.Chat.Commands.lp",
  r:        "ED.Chat.Commands.r",
  roll:     "ED.Chat.Commands.roll",
  s:        "ED.Chat.Commands.s",
};
preLocalize( "chatCommands" );

/**
 * The available chat flags for messages.
 * @enum {string}
 */
export const flags = {
  sourceMessageUuid: "sourceMessageUuid",
};