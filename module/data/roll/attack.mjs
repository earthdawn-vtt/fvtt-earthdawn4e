import ED4E from "../../config/_module.mjs";
import EdRollOptions from "./common.mjs";

/**
 * Roll options for attack rolls.
 * @augments { EdRollOptions }
 * @property { string } weaponType The type of the weapon used for the attack.
 * Should be one of the keys in {@link module:config~ITEMS~weaponType}.
 * @property { string } weaponUuid The UUID of the weapon used for the attack.
 * This should be an embedded item UUID, i.e. `Actor.<actorId>.Item.<itemId>`.
 */
export default class AttackRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.AttackRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "action";

  /** @inheritdoc */
  static ROLL_TYPE = "attack";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allActions",
    "allAttacks",
    ...super.GLOBAL_MODIFIERS,
  ];

  // endregion

  // region Static Methods

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      weaponType:        new fields.StringField( {
        choices: ED4E.weaponType,
      } ),
      weaponUuid:        new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  /**
   * @inheritdoc
   * @returns { AttackRollOptions } A new instance of AttackRollOptions.
   */
  static fromData( data, options = {} ) {
    return /** @type { AttackRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @returns { AttackRollOptions } A new instance of AttackRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { AttackRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.targets = await Promise.all( this.target.tokens.map( tokens => fromUuid( tokens ) ) );
    newContext.reactionsByTarget = await this._getDefendantReactions();
    newContext.maneuvers = await this._getManeuvers();

    newContext.weaponType = this.weaponType;
    newContext.combatIcons = {
      "melee":   "systems/ed4e/assets/icons/broadsword.svg",
      "unarmed": "systems/ed4e/assets/icons/fist-smashing.svg",
    };

    return newContext;
  }

  async _getDefendantReactions() {
    const reactionsByTarget = {};
    for ( const targetedTokenUuid of this.target.tokens ) {
      const targetedActor = ( await fromUuid( targetedTokenUuid ) ).actor;
      if ( targetedActor ) {
        const reactions = targetedActor.items.filter(
          item => (
            item.system.rollType === "reaction" )
            && ( item.system.rollTypeDetails?.reaction?.defenseType === "physical"
            )
        );
        if ( reactions ) reactionsByTarget[targetedActor.name] = reactions;
      }
    }
    return reactionsByTarget;
  }

  async _getManeuvers() {
    const actor = await fromUuid( this.rollingActorUuid );
    return actor.itemTypes.knackManeuver;
    // TODO: this needs to be filtered by available number of successes in the ChatMessage "getHTML" method, we don't have a possibly modifier number of successes anywhere else than in the ChatMessages DataModel
  }
}