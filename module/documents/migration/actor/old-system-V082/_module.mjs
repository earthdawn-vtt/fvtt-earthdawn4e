import CharacterMigration from "./character.mjs";
import NoneCharacterMigration from "./none-character.mjs";
import EvaluateKnackMigration from "./evaluate-knacks.mjs";

export {
  CharacterMigration,
  NoneCharacterMigration,
  EvaluateKnackMigration,
};


export const typeMigrationConfig = {
  pc:       CharacterMigration,
  npc:      NoneCharacterMigration,
  creature: NoneCharacterMigration,
};