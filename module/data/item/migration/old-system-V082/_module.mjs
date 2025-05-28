import AttributeMigration from "./attribute.mjs";
import ActionMigration from "./action.mjs";
import DescriptionMigration from "./description.mjs";
import DifficultyMigration from "./difficulty.mjs";
import LevelMigration from "./level.mjs";
import TierMigration from "./tier.mjs";

export {
  AttributeMigration,
  ActionMigration,
  DescriptionMigration,
  DifficultyMigration,
  LevelMigration,
  TierMigration,
};

// export const typeMigrationConfig = {
//   armor:        AttributeMigration,
//   devotion:     DevotionMigration,
//   discipline:   DisciplineMigration,
//   equipment:    EquipmentMigration,
//   knack:        KnackMigration,
//   mask:         MaskMigration,
//   spellmatrix:  MatrixMigration,
//   namegiver:    NamegiverMigration,
//   attack:        PowerMigration,
//   shield:       ShieldMigration,
//   skill:        SkillMigration,
//   spell:        SpellMigration,
//   talent:       TalentMigration,
//   weapon:       WeaponMigration,
// };