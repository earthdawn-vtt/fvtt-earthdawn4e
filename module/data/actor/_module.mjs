import CreatureData from "./creature.mjs";
import DragonData from "./dragon.mjs";
import GroupData from "./group.mjs";
import HorrorData from "./horror.mjs";
import LootData from "./loot.mjs";
import NpcData from "./npc.mjs";
import PcData from "./pc.mjs";
import SpiritData from "./spirit.mjs";
import TrapData from "./trap.mjs";
import VehicleData from "./vehicle.mjs";

export {
  CreatureData,
  DragonData,
  GroupData,
  HorrorData,
  LootData,
  NpcData,
  PcData,
  SpiritData,
  TrapData,
  VehicleData
};
export {default as CommonTemplate} from "./templates/common.mjs";
export {default as SentientTemplate} from "./templates/sentient.mjs";
export {default as NamegiverTemplate} from "./templates/namegiver.mjs";
export {default as NoneCharacterTemplate} from "./templates/none-character.mjs";

export const config = {
  creature:  CreatureData,
  dragon:    DragonData,
  group:     GroupData,
  horror:    HorrorData,
  loot:      LootData,
  npc:       NpcData,
  character: PcData,
  spirit:    SpiritData,
  trap:      TrapData,
  vehicle:   VehicleData
};