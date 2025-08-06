import AttackMessageData from "./attack.mjs";
import BaseMessageData from "./base-message.mjs";
import DamageMessageData from "./damage.mjs";
import InitiativeMessageData from "./initiative.mjs";
import SpellcastingMessageData from "./spellcasting.mjs";
import ThreadWeavingMessageData from "./thread-weaving.mjs";

export {
  AttackMessageData,
  BaseMessageData,
  DamageMessageData,
  InitiativeMessageData,
  SpellcastingMessageData,
  ThreadWeavingMessageData,
};

export const config = {
  attack:        AttackMessageData,
  common:        BaseMessageData,
  damage:        DamageMessageData,
  initiative:    InitiativeMessageData,
  spellcasting:  SpellcastingMessageData,
  threadWeaving: ThreadWeavingMessageData,
};