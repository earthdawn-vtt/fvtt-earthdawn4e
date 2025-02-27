import { preLocalize } from "../utils.mjs";

export const statusEffects = [
  {
    id:    "aggressive",
    label: "ED.ActiveEffect.Status.aggressive",
    icon:  "systems/ed4e/assets/icons/enraged.svg",
  },
  {
    id:    "blindness",
    label: "ED.ActiveEffect.Status.blindness",
    icon:  "icons/svg/blind.svg",
  },
  {
    id:    "blindsided",
    label: "ED.ActiveEffect.Status.blindsided",
    icon:  "systems/ed4e/assets/icons/backstab.svg",
  },
  {
    id:    "cover",
    label: "ED.ActiveEffect.Status.cover",
    icon:  "systems/ed4e/assets/icons/broken-wall.svg",
  },
  {
    id:    "darkness",
    label: "ED.ActiveEffect.Status.darkness",
    icon:  "systems/ed4e/assets/icons/fog.svg",
  },
  {
    id:    "dazzled",
    label: "ED.ActiveEffect.Status.dazzled",
    icon:  "systems/ed4e/assets/icons/laser-sparks.svg",
  },
  {
    id:    "dead",
    label: "ED.ActiveEffect.Status.dead",
    icon:  "icons/svg/skull.svg",
  },
  {
    id:    "defensive",
    label: "ED.ActiveEffect.Status.defensive",
    icon:  "systems/ed4e/assets/icons/surrounded-shield.svg",
  },
  {
    id:    "grappled",
    label: "ED.ActiveEffect.Status.grappled",
    icon:  "systems/ed4e/assets/icons/grab.svg",
  },
  {
    id:    "harried",
    label: "ED.ActiveEffect.Status.harried",
    icon:  "systems/ed4e/assets/icons/meeple-army.svg",
  },
  {
    id:    "impaired",
    label: "ED.ActiveEffect.Status.impaired",
    icon:  "systems/ed4e/assets/icons/achilles-heel.svg",
  },
  {
    id:    "knockedDown",
    label: "ED.ActiveEffect.Status.knockedDown",
    icon:  "icons/svg/falling.svg",
  },
  {
    id:    "overwhelmed",
    label: "ED.ActiveEffect.Status.overwhelmed",
    icon:  "systems/ed4e/assets/icons/dozen.svg",
  },
  {
    id:    "surprised",
    label: "ED.ActiveEffect.Status.surprised",
    icon:  "systems/ed4e/assets/icons/surprised.svg",
  },
  {
    id:    "unconscious",
    label: "ED.ActiveEffect.Status.unconscious",
    icon:  "systems/ed4e/assets/icons/dead-head.svg",
  },
];
preLocalize( "statusEffects", { key: "label" } );

export const specialStatusEffects = {
  BLIND:     "blindness",
  BURROW:    "burrow",
  DEFEATED:  "dead",
  FLY:       "fly",
  HOVER:     "hover",
  INVISIBLE: "invisible",
};