import AttackMessageData from "./attack.mjs";
import BaseMessageData from "./base-message.mjs";
import DamageMessageData from "./damage.mjs";

export {
  AttackMessageData,
  BaseMessageData,
  DamageMessageData,
};

export const config = {
  attack: AttackMessageData,
  common:   BaseMessageData,
  damage: DamageMessageData,
};