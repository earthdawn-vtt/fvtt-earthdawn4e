import EdRollOptions from "./common.mjs";
import { createContentAnchor } from "../../utils.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import * as ITEMS from "../../config/items.mjs";
import * as EFFECTS from "../../config/effects.mjs";

/**
 * @typedef { object } EdAttackRollOptionsInitializationData
 * @augments { EdRollOptionsInitializationData }
 * @property { ItemEd } [weapon] The weapon used for the attack.
 * Can be omitted if `weaponUuid` is provided.
 * @property { string } [weaponUuid] The UUID of the weapon used for the attack.
 * Must be an embedded Item. Can be omitted if `weapon` is provided.
 * @property { ItemEd } [attackAbility] The ability used for the attack.
 * Can be omitted if `attackAbilityUuid` is provided.
 * @property { string } [attackAbilityUuid] The UUID of the ability used for the attack.
 * Must be an embedded Item. Can be omitted if `attackAbility` is provided.
 * @property { ActorEd } [attacker] The actor performing the attack.
 * Can be omitted if `rollingActorUuid` is provided.
 * @property { string } [rollingActorUuid] The UUID of the actor performing the attack.
 * Can be omitted if `attacker` is provided.
 */

/**
 * Roll options for attack rolls.
 * @augments { EdRollOptions }
 * @property { string } weaponType The type of the weapon used for the attack.
 * Should be one of the keys in {@link module:config~ITEMS~weaponType}.
 * @property { string|null } weaponUuid The UUID of the weapon used for the attack.
 * Must be an embedded Item. Null if no weapon is used.
 * @property { string|null } attackAbilityUuid The UUID of the ability used for the attack.
 * Must be an embedded Item. Null if no ability is used.
 */
export default class AttackRollOptions extends EdRollOptions {

  // region Schema

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      weaponType:        new fields.StringField( {
        choices: ITEMS.weaponType,
      } ),
      weaponUuid:        new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
      attackAbilityUuid: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  // endregion

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

  /**
   * @inheritdoc
   * @param { EdAttackRollOptionsInitializationData & Partial<AttackRollOptions> } data The data to initialize the roll options with.
   * @returns { AttackRollOptions } A new instance of AttackRollOptions.
   */
  static fromData( data, options = {} ) {
    if ( data.weapon && !data.weaponUuid ) data.weaponUuid = data.weapon.uuid;
    if ( data.attackAbility && !data.attackAbilityUuid ) data.attackAbilityUuid = data.attackAbility.uuid;
    if ( !data.weaponType ) {
      const weapon = data.weapon ?? fromUuidSync( data.weaponUuid );
      data.weaponType = weapon?.system.weaponType ?? "unarmed";
    }

    return /** @type { AttackRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @param { EdAttackRollOptionsInitializationData & Partial<AttackRollOptions> } data The data to initialize the roll options with.
   * @returns { AttackRollOptions } A new instance of AttackRollOptions.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { AttackRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  static _prepareStepData( data ) {
    if ( data.step ) return data.step;

    const attackAbility = data.attackAbility ?? fromUuidSync( data.attackAbilityUuid );
    const attacker = data.attacker ?? fromUuidSync( data.rollingActorUuid );
    const weapon = data.weapon ?? fromUuidSync( data.weaponUuid );

    const globalModifierKey = ITEMS.weaponTypeModifier[ weapon.system.weaponType ].attack;
    return {
      base:      attackAbility?.system.rankFinal ?? attacker.system.attributes.dex.step,
      modifiers: {
        [ EFFECTS.globalBonuses[globalModifierKey].label ]: attacker.system.globalBonuses[ globalModifierKey ].value,
      },
    };
  }

  /** @inheritDoc */
  static _prepareStrainData( data ) {
    if ( data.strain ) return data.strain;

    const attackAbility = data.attackAbility ?? fromUuidSync( data.attackAbilityUuid );

    return {
      base:      attackAbility?.system.strain ?? 0,
      modifiers: {},
    };
  }

  /** @inheritDoc */
  static _prepareTargetDifficulty( data ) {
    if ( data.target ) return data.target;

    const targetTokens = game.user.targets;
    const maxDifficulty = Math.max( ...[ ...targetTokens ].map(
      token => token.actor.system.characteristics.defenses.physical.value
    ) );

    return {
      base:      maxDifficulty,
      modifiers: {},
      public:    false,
      tokens:    targetTokens.map( token => token.document.uuid ),
    };
  }

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.attackAbility = await fromUuid( this.attackAbilityUuid );
    newContext.attackAbilityContentAnchor = newContext.attackAbility
      ? createContentAnchor( newContext.attackAbility ).outerHTML
      : undefined;
    newContext.weapon = await fromUuid( this.weaponUuid );
    newContext.weaponContentAnchor = newContext.weapon
      ? createContentAnchor( newContext.weapon ).outerHTML
      : undefined;

    newContext.targets = await Promise.all( this.target.tokens.map( tokens => fromUuid( tokens ) ) );
    newContext.reactionsByTarget = await this._getDefendantItems( "", "reaction" );
    newContext.maneuversByTarget = await this._getDefendantItems( SYSTEM_TYPES.Item.maneuver, "" );
    newContext.maneuvers = await this._getManeuvers();

    newContext.weaponType = this.weaponType;
    newContext.combatIcons = {
      "melee":   "systems/ed4e/assets/icons/broadsword.svg",
      "unarmed": "systems/ed4e/assets/icons/fist-smashing.svg",
    };

    newContext.randomId = foundry.utils.randomID();

    return newContext;
  }

  /**
   * Get the items with the given roll type for all targeted actors.
   * @param {string} itemType The type of the items to get.
   * @param {string} rollType The roll type of the items to get.
   * @returns {Promise<{}>} A mapping of target actor names to their items with the given roll type.
   */
  async _getDefendantItems( itemType = "", rollType = "" ) {
    const reactionsByTarget = {};
    for ( const targetedTokenUuid of this.target.tokens ) {
      const targetedActor = ( await fromUuid( targetedTokenUuid ) ).actor;
      if ( targetedActor ) {
        const reactions = targetedActor.items.filter(
          item => ( !itemType || item.type === itemType )
            && ( !rollType || item.system.rollType === rollType )
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

  // endregion
}