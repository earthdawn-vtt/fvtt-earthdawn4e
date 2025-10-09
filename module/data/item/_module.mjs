import ArmorData from "./armor.mjs";
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
import NamegiverData from "./namegiver.mjs";
import PathData from "./path.mjs";
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
import WeaponData from "./weapon.mjs";

export {
  ArmorData,
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
  NamegiverData,
  PathData,
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
  WeaponData
};

export {default as AbilityTemplate} from "./templates/ability.mjs";
export {default as ClassTemplate} from "./templates/class.mjs";
export {default as GrimoireTemplate} from "./templates/grimoire.mjs";
export {default as IncreasableAbilityTemplate} from "./templates/increasable-ability.mjs";
export {default as ItemDescriptionTemplate} from "./templates/item-description.mjs";
export {default as KnackTemplate} from "./templates/knack-item.mjs";
export {default as LpIncreaseTemplate} from "./templates/lp-increase.mjs";
export {default as MatrixTemplate} from "./templates/matrix.mjs";
export {default as PhysicalItemTemplate} from "./templates/physical-item.mjs";
export {default as TargetTemplate} from "./templates/targeting.mjs";

export const config = {
  armor:          ArmorData,
  bindingSecret:  BindingSecretData,
  curseMark:      CurseHorrorMarkData,
  devotion:       DevotionData,
  discipline:     DisciplineData,
  effect:         EffectData,
  equipment:      EquipmentData,
  knackAbility:   KnackAbilityData,
  knackKarma:     KnackKarmaData,
  knackManeuver:  KnackManeuverData,
  maneuver:       ManeuverData,
  mask:           MaskData,
  namegiver:      NamegiverData,
  path:           PathData,
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
  weapon:         WeaponData
};
