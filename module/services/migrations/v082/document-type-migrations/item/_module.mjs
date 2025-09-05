import ArmorMigration from "./armor.mjs";
import DevotionMigration from "./devotion.mjs";
import DisciplineMigration from "./discipline.mjs";
import EquipmentMigration from "./equipment.mjs";
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
import KarmaKnackMigration from "./karma-knack.mjs";
import AbilityKnackMigration from "./ability-knack.mjs";
import SpellKnackMigration from "./spell-knack.mjs";
import ManeuverKnackMigration from "./maneuver-knack.mjs";

export {
  ArmorMigration,
  DevotionMigration,
  DisciplineMigration,
  EquipmentMigration,
  AbilityKnackMigration,
  KarmaKnackMigration,
  SpellKnackMigration,
  ManeuverKnackMigration,
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
  armor:         ArmorMigration,
  devotion:      DevotionMigration,
  discipline:    DisciplineMigration,
  equipment:     EquipmentMigration,
  abilityknack:  AbilityKnackMigration,
  karmaknack:    KarmaKnackMigration,
  spellknack:    SpellKnackMigration,
  maneuverknack: ManeuverKnackMigration,
  mask:          MaskMigration,
  matrix:        MatrixMigration,
  namegiver:     NamegiverMigration,
  attack:        PowerMigration,
  reputation:    ReputationMigration,
  shield:        ShieldMigration,
  skill:         SkillMigration,
  spell:         SpellMigration,
  talent:        TalentMigration,
  weapon:        WeaponMigration,
};