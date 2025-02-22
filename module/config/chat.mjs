import { preLocalize } from "../utils.mjs";


/**
 * The available chat commands with their corresponding help text.
 * @enum {string}
 */
export const chatCommands = {
  char:     "X.chatCommandCharHelp no parameters, trigger char gen",
  coin:     "X.chatCommandCoinHelp number plus coinage, pass out coins",
  group:    "X.chatCommandGroupHelp no parameters?, calc CR for group",
  h:        "X.chatCommandHelp optional param 'chatCommand', show general help or for given command",
  help:     "X.chatCommandHelp optional param 'chatCommand', show general help or for given command",
  lp:       "X.chatCommandLpHelp number, award LP points",
  s:        "X.chatCommandSHelp any number of steps separated by whitespace or +, roll the given steps",
};
preLocalize( "chatCommands" );