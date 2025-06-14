import { preLocalize } from "../utils.mjs";

/**
 * The different modes of recovery available in the game.
 * @enum {string}
 */
export const recoveryModes = {
  recovery:    "ED.Config.RecoveryModes.recovery",
  fullRest:    "ED.Config.RecoveryModes.fullRest",
  recoverStun: "ED.Config.RecoveryModes.recoverStun",
};
preLocalize( "recoveryModes" );