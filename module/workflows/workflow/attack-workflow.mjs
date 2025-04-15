import ActorWorkflow from "./actor-workflow.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import { getSetting } from "../../settings.mjs";
import AttackRollOptions from "../../data/roll/attack.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";

/**
 * @typedef {object} AttackWorkflowOptions
 * @property {"tail"|"unarmed"|"weapon"} [attackType="unarmed"] The type of attack being performed.
 */

export default class AttackWorkflow extends ActorWorkflow {

  /**
   * The ability used for the attack.
   * @type {ItemEd|undefined}
   */
  _ability;

  /**
   * The type of attack being performed.
   * @type {"tail"|"unarmed"|"weapon"}
   */
  _attackType;

  /**
   * The roll object that is created for the attack.
   * @type {EdRoll}
   */
  _roll;

  /**
   * The options that are passed to the roll object.
   * @type {EdRollOptions}
   */
  _rollOptions;

  /**
   * The weapon being used for the attack.
   * @type {ItemEd|undefined}
   */
  _weapon;

  /**
   * @param {foundry.documents.Actor} attacker - The actor that is performing the attack.
   * @param {WorkflowOptions&AttackWorkflowOptions} options - The options for the attack workflow.
   */
  constructor( attacker, options = {} ) {
    super( attacker, options );
    this._attackType = options.attackType ?? "unarmed";

    if ( this._attackType !== "unarmed" ) this._steps.push( this.#setWeapon.bind( this ) );
    this._steps.push(
      this.#setAbility.bind( this ),
      this.#createRollOptions.bind( this ),
      this.#createAttackRoll.bind( this ),
      this.#rollAttack.bind( this ),
    );
  }

  async #setWeapon() {
    const weaponStatus = this._attackType === "tail"
      ? [ "tail" ]
      : [ "mainHand", "offHand", "twoHands" ];
    let weapon = this._actor.itemTypes.weapon.find( item => weaponStatus.includes( item.system.itemStatus ) );

    if ( !weapon && this._attackType !== "tail" ) weapon = this.actor.drawWeapon();
    if ( !weapon ) throw new WorkflowInterruptError(
      this,
      game.i18n.localize( "ED.Notifications.Warn.Workflow.AttackNoWeaponFound" ),
    );

    this._weapon = weapon;
  }

  async #setAbility() {
    if ( [ "tail", "unarmed" ].includes( this._attackType ) ) {
      this._ability = this._actor.getSingleItemByEdid( getSetting( "edidUnarmedCombat" ) );
    } else if ( this._weapon ) {
      this._ability = this._actor.getAttackAbilityForWeapon( this._weapon );
    }
  }

  async #createRollOptions() {
    this._rollOptions = AttackRollOptions.fromActor(
      {
        ...this.getCommonAttackRollData(),
        weaponType: this._weapon?.system.weaponType ?? "unarmed",
        weaponUuid: this._weapon?.uuid ?? null,
        chatFlavor: game.i18n.format( `TODO.ED.Chat.Flavor.${this._attackType}Attack`, {} )
      },
      this._actor,
    );
  }

  async #createAttackRoll() {
    this._roll = await RollPrompt.waitPrompt(
      this._rollOptions,
      {
        rollData: this._actor,
      }
    );
  }

  async #rollAttack() {
    // currently used as intended, as roll processing is still part of the actor document
    this._result = this._roll;
  }

  getCommonAttackRollData() {
    const targetTokens = game.user.targets;
    const maxDifficulty = Math.max( ...[ ...targetTokens ].map(
      token => token.actor.system.characteristics.defenses.physical.value
    ) );

    return {
      step:       {
        base:      this._ability?.system.rankFinal ?? this._actor.system.attributes.dex.step,
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

}