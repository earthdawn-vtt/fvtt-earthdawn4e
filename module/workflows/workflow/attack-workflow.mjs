import ActorWorkflow from "./actor-workflow.mjs";
import WorkflowInterruptError from "../workflow-interrupt.mjs";
import { getSetting } from "../../settings.mjs";
import AttackRollOptions from "../../data/roll/attack.mjs";
import Rollable from "./rollable.mjs";

/**
 * @typedef {object} AttackWorkflowOptions
 * @property {"tail"|"unarmed"|"weapon"} [attackType] The type of attack being performed. Defaults to "unarmed", if no
 * weapon is provided.
 * @property {ItemEd} [weapon] The weapon being used for the attack.
 * @property {ItemEd} [attackAbility] The ability used for the attack. Can be omitted to have it determined from
 * the attackType and/or weapon.
 */

export default class AttackWorkflow extends Rollable( ActorWorkflow ) {

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

    this._rollToMessage = true;

    this._ability = options.attackAbility;
    this._weapon = options.weapon;
    this._attackType = options.attackType ?? ( this._weapon ? "weapon" : "unarmed" );

    if ( !this._weapon && this._attackType !== "unarmed" ) this._steps.push( this.#setWeapon.bind( this ) );
    if ( !this._ability ) this._steps.push( this.#setAbility.bind( this ) );
    this._initRollableSteps();
  }

  async #setWeapon() {
    const weaponStatus = this._attackType === "tail"
      ? [ "tail" ]
      : [ "mainHand", "offHand", "twoHands" ];
    let weapon = this._actor.itemTypes.weapon.find( item => weaponStatus.includes( item.system.itemStatus ) );

    if ( !weapon && this._attackType !== "tail" ) weapon = this._actor.drawWeapon();
    if ( !weapon ) throw new WorkflowInterruptError(
      this,
      game.i18n.localize( "ED.Notifications.Warn.attackNoWeaponFound" ),
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

  /** @inheritdoc */
  async _prepareRollOptions() {
    this._rollOptions = AttackRollOptions.fromActor(
      {
        weapon:        this._weapon ?? null,
        attackAbility: this._ability ?? null,
        attacker:      this._actor,
      },
      this._actor,
    );
  }

}