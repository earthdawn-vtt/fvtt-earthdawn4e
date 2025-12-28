/**
 *
 */
export default function () {
  Hooks.once( "socketlib.ready", () => {
    ed4e.socketHandler = socketlib.registerSystem( "ed4e" );
    registerSocketListeners();
  } );
}

/**
 * Register socket listeners
 * @param {SocketlibSocket} socket The socket instance
 */
function registerSocketListeners( socket ) {
  ed4e.socketHandler.register( "applyDamage", applyDamage );
  ed4e.socketHandler.register( "assignEffect", assignEffect );
  ed4e.socketHandler.register( "heartbeat", heartbeat );
}

/**
 * @inheritDoc
 */
function applyDamage( actor, damage ) {
  // Apply damage to the actor
  console.log( "Applying damage to actor:", actor, damage );
  ui.notifications.info( "Damage is coming." );
}

/**
 * @inheritDoc
 */
function assignEffect( actor, effect ) {
  // Apply effect to the actor
  console.log( "Applying effect to actor:", actor, effect );
  ui.notifications.info( "Effect is coming." );
}

/**
 * Test heartbeat socket call
 * @param {object} data The data sent with the socket call
 * @returns {object} The response data with the recipient user name
 */
function heartbeat( data ) {
  console.log( "Heartbeat" );
  ui.notifications.info( `Socket Heartbeat\ncurrent user: ${game.user.name}\ncalled by: ${data.caller}` );
  return { recipient: game.user.name };
}

