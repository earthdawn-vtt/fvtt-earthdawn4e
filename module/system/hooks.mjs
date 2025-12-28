import chat from "../hooks/chat.mjs";
import i18n from "../hooks/i18n.mjs";
import init from "../hooks/init.mjs";
import ready from "../hooks/ready.mjs";
import sidebar from "../hooks/sidebar.mjs";
import socket from "../hooks/socket.mjs";

/**
 *
 */
export default function registerHooks() {
  init();
  ready();
  chat();
  sidebar();
  i18n();
  socket();
}