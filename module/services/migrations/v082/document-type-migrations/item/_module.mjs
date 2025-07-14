import ArmorMigration from "./armor.mjs";
import DevotionMigration from "./devotion.mjs";
import DisciplineMigration from "./discipline.mjs";
import EquipmentMigration from "./equipment.mjs";
import KnackMigration from "./knack.mjs";
import MaskMigration from "./mask.mjs";
import MatrixMigration from "./matrix.mjs";
import NamegiverMigration from "./namegiver.mjs";
import PowerMigration from "./power.mjs";
import ReputationMigration from "./reputation.mjs";
import ShieldMigration from "./shield.mjs";
import SkillMigration from "./skill.mjs";
import SpellMigration from "./spell.mjs";
import TalentMigration from "./talent.mjs";
import WeaponMigration from "./weapon.mjs";

export {
  ArmorMigration,
  DevotionMigration,
  DisciplineMigration,
  EquipmentMigration,
  KnackMigration,
  MaskMigration,
  MatrixMigration,
  NamegiverMigration,
  PowerMigration,
  ReputationMigration,
  ShieldMigration,
  SkillMigration,
  SpellMigration,
  TalentMigration,
  WeaponMigration,
};

export const typeMigrationConfig = {
  armor:        ArmorMigration,
  devotion:     DevotionMigration,
  discipline:   DisciplineMigration,
  equipment:    EquipmentMigration,
  knack:        KnackMigration,
  mask:         MaskMigration,
  spellmatrix:  MatrixMigration,
  namegiver:    NamegiverMigration,
  attack:       PowerMigration,
  reputation:   ReputationMigration,
  shield:       ShieldMigration,
  skill:        SkillMigration,
  spell:        SpellMigration,
  talent:       TalentMigration,
  weapon:       WeaponMigration,
};