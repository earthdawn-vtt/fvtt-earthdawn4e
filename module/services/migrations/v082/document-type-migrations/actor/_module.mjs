import CharacterMigration from "./character.mjs";
import NoneCharacterMigration from "./none-character.mjs";

export {
  CharacterMigration,
  NoneCharacterMigration,
};


export const typeMigrationConfig = {
  character: CharacterMigration,
  pc:        CharacterMigration,
  npc:       NoneCharacterMigration,
  creature:  NoneCharacterMigration,
};