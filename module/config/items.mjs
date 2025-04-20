import { preLocalize } from "../utils.mjs";


// region Curses

/**
 * Denomination options
 * @enum {string}
 */
export const curseType = {
  minor:       "ED.Config.curseType.minor",
  major:       "ED.Config.curseType.major",
  horror:      "ED.Config.curseType.horror"
};
preLocalize( "curseType" );

// endregion


// region Physical Items

/**
 * Availability
 * @enum {string}
 */
export const availability = {
  everyday:       "ED.Config.Availability.everyday",
  average:         "ED.Config.Availability.average",
  unusual:         "ED.Config.Availability.unusual",
  rare:           "ED.Config.Availability.rare",
  veryRare:       "ED.Config.Availability.veryRare",
  unique:         "ED.Config.Availability.unique"
};
preLocalize( "availability" );

/**
 * Denomination options
 * @enum {string}
 */
export const denomination = {
  copper:       "ED.Config.Denomination.copper",
  silver:       "ED.Config.Denomination.silver",
  gold:         "ED.Config.Denomination.gold"
};
preLocalize( "denomination" );

/**
 * The possible states for a physical item that describe in which way they connect to an actor.
 * All equipped and carried items count as owned as well.
 * All equipped items count as carried as well.
 * @enum {string}
 */
export const itemStatus = {
  owned:      "ED.Config.ItemStatus.owned",
  carried:    "ED.Config.ItemStatus.carried",
  equipped:   "ED.Config.ItemStatus.equipped",
  mainHand:   "ED.Config.ItemStatus.mainHand",
  offHand:    "ED.Config.ItemStatus.offHand",
  twoHands:   "ED.Config.ItemStatus.twoHands",
  tail:       "ED.Config.ItemStatus.tail",
};
preLocalize( "itemStatus" );

/**
 * RecoveryProperty
 * @enum {string}
 */
export const recoveryProperty = {
  0:           "ED.Config.RecoveryProperty.noRecovery",
  1:           "ED.Config.RecoveryProperty.arbitrary",
  2:           "ED.Config.RecoveryProperty.arbitraryAndAttribute",
  3:           "ED.Config.RecoveryProperty.arbitraryOptionalAttribute",
  4:           "ED.Config.RecoveryProperty.abilityStep",
  5:           "ED.Config.RecoveryProperty.noHealing",
};
preLocalize( "recoveryProperty" );

// endregion


// region Poisons

/**
 * Activation Types of Poisons and Diseases
 * @enum {string}
 */
export const poisonActivation = {
  contact:        "ED.Config.PoisonActivation.contact",
  ingested:       "ED.Config.PoisonActivation.ingested",
  inhaled:        "ED.Config.PoisonActivation.inhaled",
  injury:         "ED.Config.PoisonActivation.injury",
  wound:          "ED.Config.PoisonActivation.wound",
};
preLocalize( "poisonActivation" );

// endregion


// region Weapons

/**
 * ammunitionType
 * @enum {string}
 */
export const ammunitionType = {
  arrow:           "ED.Config.AmmunitionType.arrow",
  bolt:           "ED.Config.AmmunitionType.bolt",
  needle:         "ED.Config.AmmunitionType.needle",
  stone:           "ED.Config.AmmunitionType.stone",
};
preLocalize( "ammunitionType" );

/**
 * WeaponType
 * @enum {string}
 */
export const weaponType = {
  melee:          {
    label:      "ED.Config.WeaponType.melee",
    ranged:     false,
  },
  missile:        {
    label:      "ED.Config.WeaponType.missile",
    ranged:     true,
  },
  thrown:         {
    label:      "ED.Config.WeaponType.thrown",
    ranged:     true,
  },
  unarmed:        {
    label:      "ED.Config.WeaponType.unarmed",
    ranged:     false,
  },
};
preLocalize( "weaponType", { key: "label" } );

export const weaponSubType = {
  bow: {
    label:      "ED.Config.WeaponSubType.bow",
    weaponType: "missile",
  },
  crossbow: {
    label:      "ED.Config.WeaponSubType.crossbow",
    weaponType: "missile",
  },
};

/**
 * The way a weapon has to be equipped to wield it.
 * @enum {string}
 */
export const weaponWieldingType = {
  mainHand:   "ED.Config.ItemStatus.mainHand",
  offHand:    "ED.Config.ItemStatus.offHand",
  twoHands:   "ED.Config.ItemStatus.twoHands",
  tail:       "ED.Config.ItemStatus.tail",
};
preLocalize( "weaponWieldingType" );

// endregion