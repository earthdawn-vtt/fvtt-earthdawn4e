// roll-attribute.mjs

import ED4E from "../../config.mjs";
import EdRollOptions from "../../data/other/roll-options.mjs";

/**
 * Roll a generic attribute test. Uses {@link RollPrompt} for further input data.
 * @param actor
 * @param {string} attributeId            The 3-letter id for the attribute (e.g. "per").
 * @param {object} edRollOptionsData      Any {@link EdRollOptions} that will be overwritten with the provided values.
 * @param {object} options                Any additional options for the {@link EdRoll}.
 * @returns {Promise<EdRoll>}             The processed Roll.
 */
export async function rollAttribute( actor, attributeId ) {
  const attributeStep = actor.system.attributes[attributeId].step;
  const step = { base: attributeStep };
  const chatFlavor = game.i18n.format( "ED.Chat.Flavor.rollAttribute", {
    sourceActor: actor.name,
    step:        attributeStep,
    attribute:   `${game.i18n.localize( ED4E.attributes[attributeId].label )}`
  } );
  const edRollOptions = EdRollOptions.fromActor(
    {
      testType:         "action",
      rollType:         "attribute",
      strain:           0,
      target:           undefined,
      step:             step,
      devotionRequired: false,
      chatFlavor:       chatFlavor
    },
    actor,
  );
  const rollData = {
    edRollOptions
  };
  return rollData;
}