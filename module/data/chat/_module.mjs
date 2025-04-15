import AttackMessageData from "./attack.mjs";
import BaseMessageData from "./base-message.mjs";
import DamageMessageData from "./damage.mjs";
import InitiativeMessageData from "./initiative.mjs";

export {
  AttackMessageData,
  BaseMessageData,
  DamageMessageData,
  InitiativeMessageData,
};

export const config = {
  attack:     AttackMessageData,
  common:     BaseMessageData,
  damage:     DamageMessageData,
  initiative: InitiativeMessageData,
};