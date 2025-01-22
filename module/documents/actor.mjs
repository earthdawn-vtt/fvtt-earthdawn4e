/* eslint-disable complexity */
import EdRollOptions from "../data/roll/common.mjs";
import ED4E from "../config.mjs";
import RollPrompt from "../applications/global/roll-prompt.mjs";
import DocumentCreateDialog from "../applications/global/document-creation.mjs";

import LegendPointHistory from "../applications/advancement/lp-history.mjs";
import LpEarningTransactionData from "../data/advancement/lp-earning-transaction.mjs";
import LpSpendingTransactionData from "../data/advancement/lp-spending-transaction.mjs";
import LpTrackingData from "../data/advancement/lp-tracking.mjs";
import { sum } from "../utils.mjs";
import PromptFactory from "../applications/global/prompt-factory.mjs";
import ClassTemplate from "../data/item/templates/class.mjs";
import DamageRollOptions from "../data/roll/damage.mjs";
import AttackRollOptions from "../data/roll/attack.mjs";
import { getSetting } from "../settings.mjs";

const futils = foundry.utils;

/**
 * Extend the base Actor class to implement additional system-specific logic.
 * @augments {Actor}
 */
export default class ActorEd extends Actor {

  _promptFactory = PromptFactory.fromDocument( this );

  /**
   * The class items if this actor has any (has to be of type "character" or "npc" for this).
   * @type {[ItemEd]}
   */
  get classes() {
    return this.items.filter( item => item.system instanceof ClassTemplate );
  }

  /**
   * @description                       Returns all ammunitoin items of the given actor
   * @param {string} type               The type of ammunition to get
   * @returns {ItemEd[]}                An array of ammunition items
   * @userFunction                      UF_PhysicalItems-getAmmo
   */
  getAmmo ( type ) {
    return this.itemTypes.equipment.filter( item => item.system.ammunition.type === type );
  }

  /**
   * The actor's currently available legend points.
   * @type {number}
   */
  get currentLp() {
    return this.system.lp.current;
  }

  /**
   * The actor's currently available money in silver.
   * @type {number}
   */
  get currentSilver() {
    return 1000;
  }

  /**
   * Returns the discipline items if this actor has any (has to be of type "character" or "npc" for this).
   * @type {Item[]}
   */
  get disciplines() {
    return this.itemTypes.discipline;
  }

  /**
   * Returns the equipped weapons of this actor, if any.
   * @type {ItemEd[]}
   */
  get equippedWeapons() {
    return this.itemTypes["weapon"].filter(
      item => [ "mainHand", "offHand", "twoHands", "tail" ].includes( item.system.itemStatus )
    );
  }

  /**
   * Returns the highest discipline of an actor
   * @type {Item|undefined}
   */ 
  get highestDiscipline() {
    return this.disciplines.reduce( ( highest, discipline ) => {
      if ( !highest || discipline.system.level > highest.system.level ) return discipline;
      return highest;
    }, undefined );
  }

  /**
   * Whether this actor has more than one discipline. Returns `true` if this actor has more than one discipline, `false` otherwise
   * @type {boolean}
   */
  get isMultiDiscipline() {
    return this.disciplines.length > 1;
  }

  /**
   * The lowest circle of all disciplines this actor has.
   * @type {number}
   */
  get minCircle() {
    return Math.min( ...this.disciplines.map( discipline => discipline.system.level ) );
  }

  /**
   * Returns the namegiver item if this actor has one (has to be of type "character" or "npc" for this).
   * @type {Item|undefined}
   */
  get namegiver() {
    return this.items.filter( item => item.type === "namegiver" )[0];
  }

  get reactions() {
    return this.items.filter( item => item.system.rollType === "reaction" );
  }

  /** @inheritDoc */
  static async createDialog( data = {}, { parent = null, pack = null, ...options } = {} ) {
    return DocumentCreateDialog.waitPrompt( data, { documentCls: Actor, parent, pack, options } );
  }

  /**
   * @inheritDoc
   * @userFunction            UF_TokenResources-preCreate
   */
  async _preCreate( data, options, userId ) {
    await super._preCreate( data, options, userId );

    // Configure prototype token settings
    if ( this.type === "character" ) {
      const prototypeToken = {
        sight:       {enabled: true},
        actorLink:   true,
        disposition: 1,   // Friendly
        displayBars: 50,  // Always Display bar 1 and 2
        displayName: 30,  // Display nameplate on hover
        bar1:        {
          attribute: "healthRate"
        },
        bar2: {
          attribute: "karma"
        }
      };

      this.updateSource( { prototypeToken } );
    }
  }

  /**
   * Checks if the actor is wearing any piece of armor that is part of a piecemeal armor set.
   * Piecemeal armor is a type of armor that is made up of several different pieces.
   * Returns true if the actor is wearing at least one piece of piecemeal armor, false otherwise.
   * @type {boolean}
   */
  get wearsPiecemealArmor() {
    return this.itemTypes.armor.some( armor => armor.system.piecemeal.isPiecemeal );
  }

  /**
   * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
   * Returns an array of items that match a given EDID and optionally an item type.
   * @param {string} edid           The SWID of the item(s) which you want to retrieve
   * @param {string} [type]           Optionally, a type name to restrict the search
   * @returns {Item[]|undefined}    An array containing the found items
   */
  getItemsByEdid( edid, type ) {
    const edidFilter = ( item ) => item.system.edid === edid;
    if ( !type ) return this.items.filter( edidFilter );

    const itemTypes = this.itemTypes;
    if ( !Object.hasOwn( itemTypes, type ) ) throw new Error( `Type ${ type } is invalid!` );

    return itemTypes[type].filter( edidFilter );
  }

  /**
   * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
   * Fetch an item that matches a given EDID and optionally an item type.
   * @param {string} edid         The EDID of the item(s) which you want to retrieve
   * @param {string} [type]         Optionally, a type name to restrict the search
   * @returns {Item|undefined}    The matching item, or undefined if none was found.
   */
  getSingleItemByEdid( edid, type ) {
    return this.getItemsByEdid( edid, type )[0];
  }

  /**
   * Perform the karma ritual for this actor to set the current karma points to maximum.
   * Only to be used for namegivers with a discipline.
   */
  karmaRitual() {
    this.update( { "system.karma.value": this.system.karma.max } );
  }

  /**
   * @param {('standard'|'blood'|'any')} [type] The type of wounds that is to be checked.
   * @returns {boolean} True if there is a positive amount of wounds of the given type marked on this actor, false otherwise.
   */
  hasWounds( type = "any" ) {
    const hasStandardWounds = this.system.characteristics.health.wounds > 0;
    const hasBloodWounds = this.system.characteristics.health.bloodMagic.wounds > 0;
    switch ( type ) {
      case "standard":
        return hasStandardWounds;
      case "blood":
        return hasBloodWounds;
      case "any":
        return hasStandardWounds || hasBloodWounds;
      default:
        return undefined;
    }
  }

  /**
   * @param {('standard'|'lethal'|'stun'|'blood'|'any')} [type] The type of damage that is to be checked. Standard
   * damage is any of either lethal or stun damage.
   * @returns {boolean} True if there is a positive amount of damage of the given type marked on this actor, false otherwise.
   */
  hasDamage( type = "any" ) {
    const hasLethalDamage = this.system.characteristics.health.damage.standard > 0;
    const hasStunDamage = this.system.characteristics.health.damage.stun > 0;
    const hasBloodDamage = this.system.characteristics.health.bloodMagic.damage > 0;
    switch ( type ) {
      case "standard":
        return hasLethalDamage || hasStunDamage;
      case "lethal":
        return hasLethalDamage;
      case "stun":
        return hasStunDamage;
      case "blood":
        return hasBloodDamage;
      case "any":
        return hasLethalDamage || hasStunDamage || hasBloodDamage;
      default:
        return undefined;
    }
  }


  /**
   * Expand Item Cards by clicking on the name span
   */
  expandItemCards() {
    const itemDescriptionDocument = document.getElementsByClassName( "card__description" );
    const currentItemElement = itemDescriptionDocument.nextElementSibling;
    currentItemElement.classList.toggle( "d-none" );
  }

  /**
   * Triggers a prompt for updating the Legend Point (LP) history of the actor.
   * Updates the LPTrackingData of the actor based on the input from the prompt.
   * @returns {Promise<Actor>} A Promise that resolves to the updated Actor instance.
   * @userFunction            UF_LpTracking-legendPointHistory
   * @see ../../documentation/User Functions/UF_LpTracking-legendPointHistory.md
   */
  async legendPointHistory() {
    // let history = await getLegendPointHistoryData( actor );
    const lpUpdateData = await LegendPointHistory.waitPrompt(
      new LpTrackingData( this.system.lp.toObject() ),
      { actor: this }
    );
    return this.update( { system: { lp: lpUpdateData } } );
  }


  /* -------------------------------------------- */
  /*                   Rolls                      */
  /* -------------------------------------------- */

  /**
   * Roll a generic attribute test. Uses {@link RollPrompt} for further input data.
   * @param {string} attributeId            The 3-letter id for the attribute (e.g. "per").
   * @param {object} edRollOptionsData      Any {@link EdRollOptions} that will be overwritten with the provided values.
   * @param {object} options                Any additional options for the {@link EdRoll}.
   * @returns {Promise<EdRoll>}             The processed Roll.
   */
  async rollAttribute( attributeId, edRollOptionsData = {}, options = {} ) {
    const attributeStep = this.system.attributes[attributeId].step;
    const step = { base: attributeStep };
    const chatFlavor = game.i18n.format( "ED.Chat.Flavor.rollAttribute", {
      sourceActor: this.name,
      step:        attributeStep,
      attribute:   `${ game.i18n.localize( ED4E.attributes[attributeId].label ) }`
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
      this
    );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );
    return this.processRoll( roll );
  }

  /**
   * @summary                           Ability rolls are a subset of Action test resembling non-attack actions like Talents, skills etc.
   * @description                       Roll an Ability. use {@link RollPrompt} for further input data.
   * @param {ItemEd} ability            ability must be of type AbilityTemplate & TargetingTemplate
   * @param {object} edRollOptionsData  Any {@link EdRollOptions} that will be overwritten with the provided values..
   * @param {object} options            Any additional options for the {@link EdRoll}.
   * @returns {Promise<EdRoll>}         The processed Roll.
   */
  async rollAbility( ability, edRollOptionsData = {}, options = {} ) {
    const attributeStep = this.system.attributes[ability.system.attribute].step;
    const abilityStep = attributeStep + ability.system.level;
    const difficulty = ability.system.getDifficulty();
    if ( difficulty === undefined || difficulty === null ) {
      throw new TypeError( "ability is not part of Targeting Template, please call your Administrator!" );
    }
    const difficultyFinal = { base: difficulty };
    const devotionRequired = !!ability.system.devotionRequired;
    const strain = { base: ability.system.strain };
    const chatFlavor = game.i18n.format( "ED.Chat.Flavor.rollAbility", {
      sourceActor: this.name,
      ability:     ability.name,
      step:        abilityStep
    } );
    const abilityFinalStep = { base: abilityStep };

    const edRollOptions = EdRollOptions.fromActor(
      {
        testType:         "action",
        rollType:         "ability",
        strain:           strain,
        target:           difficultyFinal,
        step:             abilityFinalStep,
        devotionRequired: devotionRequired,
        chatFlavor:       chatFlavor
      },
      this
    );
    edRollOptions.updateSource( edRollOptionsData );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );
    return this.processRoll( roll );
  }

  /**
   * @summary                     Equipment rolls are a subset of Action test resembling non-attack actions like Talents, skills etc.
   * @description                 Roll an Equipment item. use {@link RollPrompt} for further input data.
   * @param {ItemEd} equipment    Equipment must be of type EquipmentTemplate & TargetingTemplate
   * @param {object} options      Any additional options for the {@link EdRoll}.
   * @userFunction                UF_PhysicalItems-rollEquipment
   */
  async rollEquipment( equipment, options = {} ) {
    const arbitraryStep = equipment.system.usableItem.arbitraryStep;
    const difficulty = equipment.system.getDifficulty();
    if ( !difficulty ) {
      ui.notifications.error( game.i18n.localize( "X.ability is not part of Targeting Template, please call your Administrator!" ) );

      return;
    }

    const difficultyFinal = { base: difficulty };
    const chatFlavor = game.i18n.format( "ED.Chat.Flavor.rollEquipment", {
      sourceActor: this.name,
      equipment:   equipment.name,
      step:        arbitraryStep
    } );
    const edRollOptions = EdRollOptions.fromActor(
      {
        testType:         "action",
        rollType:         "equipment",
        strain:           0,
        target:           difficultyFinal,
        step:             arbitraryStep,
        devotionRequired: false,
        chatFlavor:       chatFlavor
      },
      this
    );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );
    this.processRoll( roll );
  }

  /**
   * @description                     The sequence that is rotaded
   * @param {object}    itemId        Id of the item to rotate the status of
   * @param {boolean}   backwards     Whether to rotate the status backwards
   * @returns {Promise<ItemEd[]>}       The updated items
   * @userFunction                    UF_PhysicalItems-rotateItemStatus
   */
  async rotateItemStatus( itemId, backwards = false ) {
    const item = this.items.get( itemId );
    const nextStatus = backwards ? item.system.previousItemStatus : item.system.nextItemStatus;
    return this._updateItemStates( item, nextStatus );
  }

  async rollRecovery( recoveryMode, options = {} ) {

    const { attributes, characteristics, globalBonuses } = this.system;

    let recoveryStep = attributes.tou.step;
    const recoveryFinalStep = {
      base:      recoveryStep,
      modifiers: {},
    };
    if ( globalBonuses.allRecoveryEffects.value > 0 ) recoveryFinalStep.modifiers["localize: Global Recovery Bonus"] = globalBonuses.allRecoveryEffects.value;

    const { stun: stunDamage, total: totalDamage } = characteristics.health.damage;
    const currentWounds = characteristics.health.wounds;
    const newWounds = Math.max( currentWounds - 1, 0 );

    const recoveryTestPerDay = characteristics.recoveryTestsResource.max;
    const availableRecoveryTestResource = characteristics.recoveryTestsResource.value;

    const woundsPath = "system.characteristics.health.wounds";
    const recoveryTestAvailablePath = "system.characteristics.recoveryTestsResource.value";
    const recoveryStunAvailablePath = "system.characteristics.recoveryTestsResource.stunRecoveryAvailable";

    switch ( recoveryMode ) {

      case "recovery":
        if ( availableRecoveryTestResource < 1 ) {
          ui.notifications.warn( "LocalizeLabel: Not enough recovery tests available." );
          return;
        } else if ( totalDamage === 0 ) {
          ui.notifications.warn( "LocalizeLabel: No Injuries, no recovery needed" );
          return;
        }
        break;

      case "nightRest":
        if ( totalDamage === 0 ) {
          const updateData = {
            [recoveryStunAvailablePath]: true,
            [recoveryTestAvailablePath]: currentWounds === 0 ? recoveryTestPerDay : recoveryTestPerDay - 1
          };
          if ( currentWounds > 0 ) updateData[woundsPath] = newWounds;
          this.update( updateData );
          return;
        }
        break;

      case "recoverStun":
        if ( availableRecoveryTestResource < 1 ) {
          ui.notifications.warn( "Localize: Not enough recovery tests available." );
          return;
        }
        if ( stunDamage === 0 ) {
          ui.notifications.warn( "Localize: You don'T have Stun damage" );
          return;
        }
        // TODO: won't be visible in the prompt until modifiers input is implemented
        recoveryFinalStep.modifiers["localize: Wil for Stun Recovery"] = this.system.attributes.wil.step;
        break;

      default:
        console.warn( "ED4E | ActorEd.rollRecovery: No recovery type found" );
        return;
    }

    let chatFlavor = game.i18n.format( "ED.Chat.Flavor.rollRecovery", {
      sourceActor: this.name,
      step:        recoveryStep
    } );
    const edRollOptions = EdRollOptions.fromActor(
      {
        testType:         "effect",
        rollType:         "recovery",
        rollSubType:      recoveryMode,
        strain:           0,
        target:           undefined,
        step:             recoveryFinalStep,
        devotionRequired: false,
        chatFlavor:       chatFlavor
      },
      this
    );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );
    this.processRoll( roll );
  }

  async rollUnarmedDamage( rollOptionsData = {} ) {
    const roll = await RollPrompt.waitPrompt(
      DamageRollOptions.fromActor(
        {
          step:             {
            base:      this.system.attributes.str.step,
            modifiers: {},
          },
          extraDice:        {},
          strain:           {
            base:      0,
            modifiers: {},
          },
          chatFlavor:       game.i18n.format( "TODO.ED.Chat.Flavor.rollUnarmedDamage", {} ),
          testType:         "effect",
          rollType:         "damage",
          weaponUuid:       null,
          damageAbilities:  new Set( [] ),
          armorType:        "physical",
          damageType:       "standard",
          ...rollOptionsData,
        },
        this,
      ),
      {
        rollData: this,
      }
    );

    return this.processRoll( roll );
  }


  /* -------------------------------------------- */
  /*            Damage & Combat                   */
  /* -------------------------------------------- */

  /**
   * @summary                       Take the given amount of strain as damage.
   * @param createChatMessage
   * @param {number} strain         The amount of strain damage take
   * @userFunction                  UF_Actor-takeStrain
   */
  takeStrain( strain, createChatMessage ) {
    if ( !strain ) return;
    this.takeDamage( strain, true, "standard", undefined, true, undefined, createChatMessage );
  }

  /**
   * Only for actors of type Sentient (character, npc, creature, spirits, horror, dragon). Take the given amount of
   * damage according to the parameters.
   * @param {number} amount                                     The unaltered amount of damage this actor should take.
   * @param {boolean} isStrain                                  Whether this damage is strain or not.
   * @param {("standard"|"stun")} damageType                    The type of damage. One of either 'standard' or 'stun'.
   * @param {("physical"|"mystical")} [armorType]               The type of armor that protects from this damage, one of either
   *                                                            'physical', 'mystical', or 'none'.
   * @param {boolean} [ignoreArmor]                             Whether armor should be ignored when applying this damage.
   * @param {EdRoll|undefined} [damageRoll]                     The roll that caused this damage or undefined if not caused by one.
   * @param {string} createChatMessage                          The ability name in case of a non rollable ability, or undefined
   * @returns {{damageTaken: number, knockdownTest: boolean}}
   *                                                            An object containing:
   *                                                            - `damageTaken`: the actual amount of damage this actor has taken after armor
   *                                                            - `knockdownTest`: whether a knockdown test should be made.
   */
  // eslint-disable-next-line max-params
  takeDamage( amount, isStrain, damageType = "standard", armorType, ignoreArmor, damageRoll, createChatMessage ) {
    const { armor, health } = this.system.characteristics;
    const finalAmount = amount - ( ignoreArmor || !armorType ? 0 : armor[armorType].value );
    const newDamage = health.damage[damageType] + finalAmount;

    const updates = { [`system.characteristics.health.damage.${ damageType }`]: newDamage };

    if ( finalAmount > health.woundThreshold ) {
      switch ( damageType ) {
        case "standard":
          updates["system.characteristics.health.wounds"] = health.wounds + 1;
          break;
        case "stun":
          updates["system.condition.harried"] = true;
          break;
        // Add more cases here for other damage types
      }
    }

    this.update( updates );
    let chatFlavor;
    if ( createChatMessage === undefined ) {
      chatFlavor = game.i18n.format( "ED.Chat.Flavor.takeDamage", {
        actor:   this.name,
        amount:  finalAmount,
      } );
    } else {
      chatFlavor = game.i18n.format( "ED.Chat.Flavor.takeStrainDamage", {
        ability: createChatMessage ? createChatMessage : "",
        actor:   this.name,
        amount:  finalAmount,
      } );
    }
    let messageData = {
      user:    game.user._id,
      speaker: ChatMessage.getSpeaker( { actor: this.actor } ),
      content: chatFlavor
    };
    if ( ( !damageRoll && isStrain === false ) || createChatMessage !== false ) {
      ChatMessage.create( messageData );
    }

    const knockdownTest = !this.system.condition.knockedDown && finalAmount >= health.woundThreshold + 5;
    if ( knockdownTest ) this.knockdownTest( finalAmount );

    return {
      damageTaken:       finalAmount,
      knockdownTest,
    };
  }

  async attack( attackType ) {
    return this[`${attackType}Attack`]();
  }

  async weaponAttack() {
    let weapon = this.itemTypes.weapon.find( item => [ "mainHand", "offHand", "twoHands" ].includes( item.system.itemStatus ) );
    if ( !weapon ) weapon = this.drawWeapon();
    if ( !weapon ) {
      ui.notifications.warn( "TODO.ED.Localize: No weapon available." );
      return;
    }

    const rollOptions = AttackRollOptions.fromActor(
      {
        ...( await this._getCommonAttackRollData() ),
        weaponType: weapon.system.weaponType,
        weaponUuid: weapon.uuid,
        chatFlavor: game.i18n.format( "TODO.ED.Chat.Flavor.weaponAttack", {} ),
      },
      this,
    );

    const roll = await RollPrompt.waitPrompt(
      rollOptions,
      { rollData: this },
    );
    return this.processRoll( roll );
  }

  async unarmedAttack() {
    const rollOptions = AttackRollOptions.fromActor(
      {
        ...( await this._getCommonAttackRollData() ),
        weaponType: "unarmed",
        weaponUuid: null,
        chatFlavor: game.i18n.format( "TODO.ED.Chat.Flavor.unarmedAttack", {} ),
      },
      this,
    );

    const roll = await RollPrompt.waitPrompt(
      rollOptions,
      { rollData: this },
    );
    return this.processRoll( roll );
  }

  async tailAttack() {
    let rollOptionsData = {};

    const unarmed_ability = this.getSingleItemByEdid( getSetting( "edidUnarmedCombat" ) );
    if ( unarmed_ability ) rollOptionsData = unarmed_ability.system.baseRollOptions;

    const weapon = this.itemTypes.weapon.find( item => item.system.itemStatus === "tail" );

    rollOptionsData = foundry.utils.mergeObject( rollOptionsData, await this._getCommonAttackRollData() );
    const rollOptions = AttackRollOptions.fromActor(
      {
        ...rollOptionsData,
        weaponType: weapon ? "melee" : "unarmed",
        weaponUuid: weapon?.uuid ?? null,
        chatFlavor: game.i18n.format( "TODO.ED.Chat.Flavor.tailAttack", {} ),
      },
      this,
    );

    const roll = await RollPrompt.waitPrompt(
      rollOptions,
      { rollData: this },
    );
    const processedRoll = this.processRoll( roll );

    // TODO: apply the "-2 to all action tests this round" active effect

    return processedRoll;
  }

  /**
   *
   * @returns {ItemEd|undefined} The weapon that was drawn or undefined if no weapon was drawn.
   */
  async drawWeapon() {
    const weapon = await fromUuid( await this._promptFactory.getPrompt( "drawWeapon" ) );
    if ( weapon ) await weapon.update( { "system.itemStatus": weapon.system.wieldingType } );
    return weapon;
  }

  async switchWeapon( equippedWeapon ) {
    ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.switchWeapon" ) );
    if ( equippedWeapon ) await this._updateItemStates( equippedWeapon, "carried" );
    else this.itemTypes.weapon.forEach( weapon => this._updateItemStates( weapon, "carried" ) );
    return this.drawWeapon();
  }

  async _getCommonAttackRollData() {
    const targetTokens = game.user.targets;
    const maxDifficulty = Math.max( ...[ ...targetTokens ].map(
      token => token.actor.system.characteristics.defenses.physical.value )
    );

    return {
      step:       {
        base:      this.system.attributes.dex.step,
        modifiers: {},
      },
      extraDice:  {},
      target:     {
        base:      maxDifficulty,
        modifiers: {},
        public:    false,
        tokens:    targetTokens.map( token => token.document.uuid ),
      },
      strain:     {
        base:      0,
        modifiers: {},
      },
      testType:   "action",
      rollType:   "attack",
    };
  }

  async knockdownTest( damageTaken, options = {} ) {
    if ( this.system.condition.knockedDown === true ) {
      ui.notifications.warn( "Localize: You are already knocked down." );
      return;
    }
    const { attributes, characteristics } = this.system;
    let devotionRequired = false;
    let strain = 0;
    let knockdownStep = attributes.str.step;

    const knockdownAbility = await fromUuid(
      await this.getPrompt( "knockDown" )
    );

    if ( knockdownAbility ) {
      const { attribute, level, devotionRequired: devotion, strain: abilityStrain } = knockdownAbility.system;
      knockdownStep = ( attributes[attribute]?.step || knockdownStep ) + level;
      devotionRequired = !!devotion;
      strain = { base: abilityStrain };
    }

    const difficultyFinal = {
      base: Math.max( damageTaken - characteristics.health.woundThreshold, 0 ),
    };
    const chatFlavor = game.i18n.format( "ED.Chat.Flavor.knockdownTest", {
      sourceActor: this.name,
      step:        knockdownStep
    } );

    const knockdownStepFinal = {
      base:      knockdownStep,
      modifiers: {
        "localize: Global Knockdown Bonus": this.system.singleBonuses.knockdownEffects.value,
      }
    };
    const edRollOptions = EdRollOptions.fromActor(
      {
        testType:         "action",
        rollType:         "knockdown",
        strain:           strain,
        target:           difficultyFinal,
        step:             knockdownStepFinal,
        devotionRequired: devotionRequired,
        chatFlavor:       chatFlavor
      },
      this
    );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );

    this.processRoll( roll );
  }

  async jumpUp( options = {} ) {
    if ( !this.system.condition.knockedDown ) {
      ui.notifications.warn( "LocalizeLabel: You are not knocked down.", { localize: true } );
      return;
    }
    const { attributes } = this.system;
    let devotionRequired = false;
    let strain = 2;
    let jumpUpStep = attributes.dex.step;

    const selectedAbility = await fromUuid(
      await this.getPrompt( "jumpUp" )
    );

    if ( selectedAbility ) {
      const { attribute, level, devotionRequired: devotion, strain: abilityStrain } = selectedAbility.system;
      jumpUpStep = ( attributes[attribute]?.step || jumpUpStep ) + level;
      devotionRequired = !!devotion;
      strain = { base: abilityStrain };
    }

    const chatFlavor = game.i18n.format( "ED.Chat.Flavor.jumpUp", {
      sourceActor: this.name,
      step:        jumpUpStep
    } );

    const difficulty = { base: 6 };
    const jumpUpStepFinal = { base: jumpUpStep };
    const edRollOptions = EdRollOptions.fromActor(
      {
        testType:         "action",
        rollType:         "jumpUp",
        strain:           strain,
        target:           difficulty,
        step:             jumpUpStepFinal,
        devotionRequired: devotionRequired,
        chatFlavor:       chatFlavor
      },
      this
    );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );

    this.processRoll( roll );
  }


  /**
   * Use a resource (karma, devotion) by deducting the amount. This will always happen, even if not enough is available.
   * Look out for the return value to see if that was the case.
   * @param {"karma"|"devotion"|"recovery"} resourceType The type of resource to use. One of either "karma" or "devotion".
   * @param {number} amount                   The amount to use of the resource.
   * @returns {boolean}                       Returns `true` if the full amount was deducted (enough available), 'false'
   *                                          otherwise.
   */
  #useResource( resourceType, amount ) {
    const available = this.system[resourceType].value;
    this.update( { [`system.${ resourceType }.value`]: ( available - amount ) } );
    return amount <= available;
  }

  /**
   * Evaluate a Roll and process its data in this actor. This includes (if applicable):
   * <ul>
   *     <li>taking strain damage</li>
   *     <li>reducing resources (karma, devotion)</li>
   *     <li>recover from damage</li>
   * </ul>
   * @param {EdRoll} roll The prepared Roll.
   * @returns {EdRoll}    The processed Roll.
   */
  async processRoll( roll ) {
    if ( !roll ) {
      // No roll available, do nothing.
      return;
    }

    // Check if this uses karma or strain at all
    this.takeDamage( roll.totalStrain, true, "standard", undefined, true );

    const { karma, devotion } = roll.options;
    const resourcesUsedSuccessfully = this.#useResource( "karma", karma.pointsUsed ) && this.#useResource( "devotion", devotion.pointsUsed );

    if ( !resourcesUsedSuccessfully ) {
      ui.notifications.warn( "Localize: Not enough karma,devotion or recovery. Used all that was available." );
    }

    const rollTypeProcessors = {
      "recovery":  () => this.#processRecoveryResult( roll ),
      "knockdown": () => this.#processKnockdownResult( roll ),
      "jumpUp":    () => this.#processJumpUpResult( roll )
    };

    const processRollType = rollTypeProcessors[roll.options.rollType];

    if ( processRollType ) {
      await processRollType();
    } else {
      await roll.toMessage();
    }

    return roll;
  }

  async #processJumpUpResult( roll ) {
    await roll.evaluate();

    if ( roll._total && roll.isSuccess ) {
      this.update( { "system.condition.knockedDown": false } );
    }

    roll.toMessage();
  }

  async #processKnockdownResult( roll ) {
    await roll.evaluate();
    if ( !roll._total ) {
      return;
    } else {
      if ( roll.isSuccess === false ) {
        this.update( { "system.condition.knockedDown": true } );
      }
    }
    roll.toMessage();
  }

  /**
   * Process the result of a recovery roll. This will reduce the damage taken by the amount rolled.
   * @param {EdRoll} roll The roll to process.
   * @returns {Promise<ChatMessage | object>} The created ChatMessage or the data for it.
   */
  async #processRecoveryResult( roll ) {
    await roll.evaluate();

    if ( !roll._total ) {
      return;
    }

    const { characteristics } = this.system;
    const { health, recoveryTestsResource } = characteristics;
    const { damage, wounds } = health;
    const { stun, standard, total } = damage;

    const rollTotal = roll._total;
    const healingRate = Math.max( rollTotal - wounds, 1 );
    const newWounds = Math.max( wounds - 1, 0 );
    const newPhysicalDamage = Math.max( standard - healingRate, 0 );
    const newStunDamage = Math.max( stun - healingRate, 0 );

    const recoveryTestPerDay = recoveryTestsResource.max;
    const recoveryTestsCurrent = recoveryTestsResource.value;

    const updatePaths = {
      wounds:                "system.characteristics.health.wounds",
      standardDamage:        "system.characteristics.health.damage.standard",
      stunDamage:            "system.characteristics.health.damage.stun",
      recoveryTestAvailable: "system.characteristics.recoveryTestsResource.value",
      stunRecoveryAvailable: "system.characteristics.recoveryTestsResource.stunRecoveryAvailable"
    };

    const updateData = {};

    switch ( roll.options.rollSubType ) {
      case "recovery": 
        updateData[updatePaths.standardDamage] = newPhysicalDamage;
        updateData[updatePaths.stunDamage] = newStunDamage;
        updateData[updatePaths.stunRecoveryAvailable] = true;
        updateData[updatePaths.recoveryTestAvailable] = recoveryTestsCurrent - 1;
        break;
      case "nightRest":
        if ( wounds > 0 && total === 0 ) { 
          updateData[updatePaths.wounds] = newWounds;
        } else if ( total > 0 ) {
          updateData[updatePaths.standardDamage] = newPhysicalDamage;
          updateData[updatePaths.stunDamage] = newStunDamage;
        }
        updateData[updatePaths.stunRecoveryAvailable] = true;
        updateData[updatePaths.recoveryTestAvailable] = recoveryTestPerDay - ( wounds > 0 || total > 0 ? 1 : 0 );
        break;
      case "recoverStun":
        updateData[updatePaths.stunDamage] = newStunDamage;
        updateData[updatePaths.stunRecoveryAvailable] = false;
        updateData[updatePaths.recoveryTestAvailable] = recoveryTestsCurrent - 1;
        break;
      default:
        ui.notifications.warn( "Localize: No recovery type found." );
        return;
    }

    this.update( updateData );
    return roll.toMessage();
  }

  _applyBaseEffects( baseCharacteristics ) {
    let overrides = {};
    // Organize non-disabled effects by their application priority
    // baseCharacteristics is list of attributes that need to have Effects applied before Derived Characteristics are calculated
    const changes = this.effects.reduce( ( changes, e ) => {
      if ( e.changes.length < 1 ) {
        return changes;
      }
      if ( e.disabled || e.isSuppressed || !baseCharacteristics.includes( e.changes[0].key ) ) {
        return changes;
      }

      return changes.concat(
        e.changes.map( ( c ) => {
          // eslint-disable-next-line no-param-reassign
          c = futils.duplicate( c );
          c.effect = e;
          c.priority = c.priority ?? c.mode * 10;
          return c;
        } )
      );
    }, [] );

    changes.sort( ( a, b ) => a.priority - b.priority );

    // Apply all changes
    for ( let change of changes ) {
      const result = change.effect.apply( this, change );
      if ( result !== null ) overrides[change.key] = result[change.key];
    }

    // Expand the set of final overrides
    this.overrides = futils.expandObject( { ...futils.flattenObject( this.overrides ), ...overrides } );
  }

  async _enableHTMLEnrichment() {
    let enrichment = {};
    enrichment["system.description.value"] = await TextEditor.enrichHTML( this.system.description.value, {
      async:   true,
      secrets: this.isOwner
    } );
    return futils.expandObject( enrichment );
  }

  async _enableHTMLEnrichmentEmbeddedItems() {
    for ( const item of this.items ) {
      item.system.description.value = futils.expandObject( await TextEditor.enrichHTML( item.system.description.value, {
        async:   true,
        secrets: this.isOwner
      } )
      );
    }
  }


  /**
   * 
   * @param {object}    itemToUpdate    The item to update
   * @param {string}    nextStatus      The next status of the item
   * @returns {Promise<ItemEd[]>}       The updated items
   * @userFunction                      UF_PhysicalItems-updateItemStates
   */
  async _updateItemStates( itemToUpdate, nextStatus ) {
    const updates = [];
    const enforceLivingArmor = game.settings.get( "ed4e", "enforceLivingArmor" );
    const originalItemUpdate = { _id: itemToUpdate.id, "system.itemStatus": nextStatus };
    const equippedWeapons = this.itemTypes.weapon.filter(
      weapon => [ "mainHand", "offHand", "twoHands" ].includes( weapon.system.itemStatus )
    );
    const addUnequipItemUpdate = ( itemType, statuses ) => {
      this.itemTypes[itemType].filter(
        item => statuses.includes( item.system.itemStatus )
      ).forEach(
        item => updates.push( { _id: item.id, "system.itemStatus": "carried" } )
      );
    };

    switch ( itemToUpdate.type ) {
      case "armor":
        if ( nextStatus === "equipped" ) {
          // check if namegiver item allows only living armor/shields
          if ( this.namegiver?.system.livingArmorOnly && itemToUpdate.system.isLiving === false && enforceLivingArmor === true ) {
            ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.livingArmorOnly" ) );
            break;
          }
          if ( itemToUpdate.system.piecemeal?.isPiecemeal ) {
            if ( !this.wearsPiecemealArmor ) {
              addUnequipItemUpdate( "armor", [ "equipped" ] );
            } else {
              // A complete set of piecemeal armor can have up to 5 size points. Armor pieces come in three sizes and
              // cost a corresponding number of points: large (3), medium (2), and small (1). A set of piecemeal armor
              // cannot have more than one size of a particular type.
              const equippedArmor = this.itemTypes.armor.filter( armor => armor.system.itemStatus === "equipped" );
              const sameSizePiece = equippedArmor.find( armor => armor.system.piecemeal.size === itemToUpdate.system.piecemeal.size );
              if ( sameSizePiece ) {
                updates.push( { _id: sameSizePiece.id, "system.itemStatus": "carried" } );
              } else {
                // Check if the total size of the equipped armor pieces and the size of the item to update exceeds the
                // maximum allowed size for a piecemeal armor set (5 size points). If it does, break the operation to
                // prevent equipping the item.
                // eslint-disable-next-line max-depth
                if (
                  sum( equippedArmor.map( armor => armor.system.piecemeal.size ) )
                    + itemToUpdate.system.piecemeal.size > 5
                ) {
                  ui.notifications.warn( game.i18n.localize( "ED4E.Notifications.Warn.piecemealArmorSizeExceeded" ) );
                  break;
                }
              }
              const equippedNonPiecemealArmor = this.itemTypes.armor.find( armor => armor.system.itemStatus === "equipped" && !armor.system.piecemeal?.isPiecemeal );
              if ( equippedNonPiecemealArmor ) {
                updates.push( { _id: equippedNonPiecemealArmor.id, "system.itemStatus": "carried" } );
              }
            }
          } else {
            // Unequip other armor
            if ( nextStatus === "equipped" ) addUnequipItemUpdate( "armor", [ "equipped" ] );
          }
        }
        updates.push( originalItemUpdate );
        break;
      case "weapon":

        switch ( nextStatus ) {
          case "twoHands": {
            const equippedShield = this.itemTypes.shield.find( shield => shield.system.itemStatus === "equipped" );
            addUnequipItemUpdate( "weapon", [ "mainHand", "offHand", "twoHands" ] );
            if ( !( itemToUpdate.system.isTwoHandedRanged && equippedShield?.system?.bowUsage ) ) addUnequipItemUpdate( "shield", [ "equipped" ] );
            break;
          }
          case "mainHand":
          case "offHand": {
            addUnequipItemUpdate( "weapon", [ nextStatus, "twoHands" ] );
            break;
          }
          case "tail": {
            addUnequipItemUpdate( "weapon", [ "tail" ] );
            break;
          }
        }

        updates.push( originalItemUpdate );
        break;
      case "shield":
        if ( nextStatus === "equipped" ) {
          // check if namegiver item allows only living armor/shields
          if ( this.namegiver?.system.livingArmorOnly && itemToUpdate.system.isLiving === false && enforceLivingArmor === true  ) {
            ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.livingArmorOnly" ) );
            break;
          }
          // Unequip other shields
          addUnequipItemUpdate( "shield", [ "equipped" ] );
          // If there's a bow and the shield allows it, no need to unequip the weapon
          const bowAllowed = equippedWeapons[0]?.system.isTwoHandedRanged && itemToUpdate.system.bowUsage;
          // If there's a two-handed weapon or two one-handed weapons, unequip one
          const unequipSomeWeapon = equippedWeapons.some( weapon => weapon.system.itemStatus === "twoHands" ) || equippedWeapons.length > 1;
          if ( !bowAllowed && unequipSomeWeapon ) {
            // Prefer to unequip off-hand weapon, if available
            const weaponToUnequip = equippedWeapons.find( weapon => weapon.system.itemStatus === "offHand" ) || equippedWeapons[0];
            updates.push( { _id: weaponToUnequip.id, "system.itemStatus": "carried" } );
          }
        }

        updates.push( originalItemUpdate );
        break;
      case "equipment":
      default:
        updates.push( originalItemUpdate );
        break;
    }
    return this.updateEmbeddedDocuments( "Item", updates );
  }

  /**
   * Retrieves a specific prompt based on the provided prompt type.
   * This method delegates the call to the `_promptFactory` instance's `getPrompt` method,
   * effectively acting as a proxy to access various prompts defined within the factory.
   * @param {( "recovery" | "takeDamage" | "jumpUp" | "knockDown" )} promptType - The type of prompt to retrieve.
   * @returns {Promise<any>} - A promise that resolves to the specific prompt instance or logic
   * associated with the given `promptType`. The exact return type depends on promptType.
   */
  async getPrompt( promptType ) {
    return this._promptFactory.getPrompt( promptType );
  }


  /* -------------------------------------------- */
  /*            Legend Point Tracking             */
  /* -------------------------------------------- */

  /**
   * @description                                 Add a new LP transaction to the actor's system data
   * @param {('earnings'|'spendings')} type       Type of the transaction
   * @param {object} transactionData   Data of the transaction
   * @returns {ActorEd}                           The updated actor data
   * @userFunction                                UF_LPTracking-addLpTransaction
   * @see                             ../../documentation/User Functions/UF_LpTracking-addLpTransaction.md
   */
  async addLpTransaction( type, transactionData ) {
    const oldTransactions = this.system.lp[type];
    const TransactionModel = type === "earnings" ? LpEarningTransactionData : LpSpendingTransactionData;
    const transaction = new TransactionModel( transactionData );

    return this.update( {
      [`system.lp.${type}`]: oldTransactions.concat( [ transaction ] )
    } );
  }

}