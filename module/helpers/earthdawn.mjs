/**
 * Calculate the armor value for the given attribute value.
 * @param { number } attributeValue Willpower value for mystical armor
 * @returns { number } The respective armor value
 */
export function getArmorValueFromAttribute( attributeValue ) {
  return attributeValue <= 0 ? 0 : Math.floor( attributeValue / 5 );
}

/**
 * Calculate the attribute step for the given attribute value.
 * @param { number } attributeValue The value of the attribute to look up the step for
 * @returns { number } The step for the given value
 */
export function getAttributeStepFromValue( attributeValue ) {
  return attributeValue <= 0 ? 0 : Math.ceil( attributeValue / 3 ) + 1;
}

/**
 * Calculate the defense value for the given attribute value.
 * @param { number } attributeValue Dexterity-, Perception- or Charisma value
 * @returns { number } The respective defense value
 */
export function getDefenseValueFromAttribute( attributeValue ) {
  return attributeValue <= 0 ? 0 : Math.ceil( attributeValue / 2 ) + 1;
}