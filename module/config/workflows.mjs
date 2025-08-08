import { preLocalize } from "../utils.mjs";

/**
 * The different modes of recovery available in the game.
 * @enum {string}
 */
export const recoveryModes = {
  recovery:    "ED.Config.RecoveryModes.recovery",
  fullRest:    "ED.Config.RecoveryModes.fullRest",
  recoverStun: "ED.Config.RecoveryModes.recoverStun",
};
preLocalize( "recoveryModes" );

export const substituteModes = {
  dex: {
    avoidBlow: {
      label:    "ED.Config.SubstituteModes.avoidBlow",
      rollType: "ability", // usually this would be a reaction, but that should be handled in the reaction workflow
    },
    meleeWeapons: {
      label:      "ED.Config.SubstituteModes.meleeWeapons",
      rollType:   "attack",
      attackType: "weapon",
    },
    missileWeapons: {
      label:      "ED.Config.SubstituteModes.missileWeapons",
      rollType:   "attack",
      attackType: "weapon",
    },
    throwingWeapons: {
      label:      "ED.Config.SubstituteModes.throwingWeapons",
      rollType:   "attack",
      attackType: "weapon",
    },
    unarmedCombat: {
      label:      "ED.Config.SubstituteModes.unarmedCombat",
      rollType:   "attack",
      attackType: "unarmed",
    },
  },
  str: {
    climbing: {
      label:    "ED.Config.SubstituteModes.climbing",
      rollType: "ability",
    }
  },
  tou: {
    swimming: {
      label:    "ED.Config.SubstituteModes.swimming",
      rollType: "ability",
    },
  },
  per: {
    awareness: {
      label:    "ED.Config.SubstituteModes.awareness",
      rollType: "ability",
    },
    research: {
      label:    "ED.Config.SubstituteModes.research",
      rollType: "ability",
    },
    tracking: {
      label:    "ED.Config.SubstituteModes.tracking",
      rollType: "ability",
    },
    wildernessSurvival: {
      label:    "ED.Config.SubstituteModes.wildernessSurvival",
      rollType: "ability",
    },
  },
  wil: {
    resistTaunt: {
      label:    "ED.Config.SubstituteModes.resistTaunt",
      rollType: "ability", // usually this would be a reaction, but that should be handled in the reaction workflow
    },
  },
  cha: {
    handleAnimal: {
      label:    "ED.Config.SubstituteModes.handleAnimal",
      rollType: "ability",
    },
    bribery: {
      label:    "ED.Config.SubstituteModes.bribery",
      rollType: "ability",
    },
    conversation: {
      label:    "ED.Config.SubstituteModes.conversation",
      rollType: "ability",
    },
    distract: {
      label:    "ED.Config.SubstituteModes.distract",
      rollType: "ability",
    },
    etiquette: {
      label:    "ED.Config.SubstituteModes.etiquette",
      rollType: "ability",
    },
    flirting: {
      label:    "ED.Config.SubstituteModes.flirting",
      rollType: "ability",
    },
    haggle: {
      label:    "ED.Config.SubstituteModes.haggle",
      rollType: "ability",
    },
    seduction: {
      label:    "ED.Config.SubstituteModes.seduction",
      rollType: "ability",
    },
    sloughBlame: {
      label:    "ED.Config.SubstituteModes.sloughBlame",
      rollType: "ability",
    },
  },
};