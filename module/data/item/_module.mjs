import ArmorData from "./armor.mjs";
import AttackData from "./attack.mjs";
import BindingSecretData from "./binding-secrets.mjs";
import CurseHorrorMarkData from "./curse-horror-mark.mjs";
import DevotionData from "./devotion.mjs";
import DisciplineData from "./discipline.mjs";
import EffectData from "./effect.mjs";
import EquipmentData from "./equipment.mjs";
import KnackAbilityData from "./knack-ability.mjs";
import KnackKarmaData from "./knack-karma.mjs";
import KnackManeuverData from "./knack-maneuver.mjs";
import ManeuverData from "./maneuver.mjs";
import MaskData from "./mask.mjs";
import MatrixData from "./matrices.mjs";
import NamegiverData from "./namegiver.mjs";
import PathData from "./path.mjs";
import PatternData from "./pattern.mjs";
import PoisonDiseaseData from "./poison-disease.mjs";
import PowerData from "./power.mjs";
import QuestorData from "./questor.mjs";
import ShieldData from "./shield.mjs";
import ShipWeaponData from "./ship-weapon.mjs";
import SkillData from "./skill.mjs";
import SpecialAbilityData from "./special-ability.mjs";
import SpellKnackData from "./spell-knacks.mjs";
import SpellData from "./spell.mjs";
import TalentData from "./talent.mjs";
import ThreadData from "./thread.mjs";
import WeaponData from "./weapon.mjs";

export {
  ArmorData,
  AttackData,
  BindingSecretData,
  CurseHorrorMarkData,
  DevotionData,
  DisciplineData,
  EffectData,
  EquipmentData,
  KnackAbilityData,
  KnackKarmaData,
  KnackManeuverData,
  ManeuverData,
  MaskData,
  MatrixData,
  NamegiverData,
  PathData,
  PatternData,
  PoisonDiseaseData,
  PowerData,
  QuestorData,
  ShieldData,
  ShipWeaponData,
  SkillData,
  SpecialAbilityData,
  SpellKnackData,
  SpellData,
  TalentData,
  ThreadData,
  WeaponData
};

export {default as AbilityTemplate} from "./templates/ability.mjs";
export {default as ClassTemplate} from "./templates/class.mjs";
export {default as ItemDescriptionTemplate} from "./templates/item-description.mjs";
export {default as KnackTemplate} from "./templates/knack-item.mjs";
export {default as LpIncreaseTemplate} from "./templates/lp-increase.mjs";
export {default as NoneNamegiverPowerData} from "./templates/none-namegiver-power.mjs";
export {default as PhysicalItemTemplate} from "./templates/physical-item.mjs";
export {default as TargetTemplate} from "./templates/targeting.mjs";

export const config = {
  armor:          ArmorData,
  attack:         AttackData,
  bindingSecret:  BindingSecretData,
  cursemark:      CurseHorrorMarkData,
  devotion:       DevotionData,
  discipline:     DisciplineData,
  effect:         EffectData,
  equipment:      EquipmentData,
  knackAbility:   KnackAbilityData,
  knackKarma:     KnackKarmaData,
  knackManeuver:  KnackManeuverData,
  maneuver:       ManeuverData,
  mask:           MaskData,
  matrix:         MatrixData,
  namegiver:      NamegiverData,
  path:           PathData,
  pattern:        PatternData,
  poisonDisease:  PoisonDiseaseData,
  power:          PowerData,
  questor:        QuestorData,
  shield:         ShieldData,
  shipWeapon:     ShipWeaponData,
  skill:          SkillData,
  specialAbility: SpecialAbilityData,
  spellKnack:     SpellKnackData,
  spell:          SpellData,
  talent:         TalentData,
  thread:         ThreadData,
  weapon:         WeaponData
};
