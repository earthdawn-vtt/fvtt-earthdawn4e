import ActorWorkflow from "./actor-workflow.mjs";
import RollPrompt from "../../applications/global/roll-prompt.mjs";
import DamageRollOptions from "../../data/roll/damage.mjs";

/**
 * @typedef {object} DamageWorkflowOptions
 * @property
 */

export default class DamageWorkflow extends ActorWorkflow {

  /**
   * The item used for the damage (Damage adder).
   * @type {ItemEd|undefined}
   */
  _substituteAbility;

  /**
   * Extra successed from the attack roll.
   * @type {number}
   */
  _extraSuccesses = 0;

  /**
   * The type of damage being performed.
   * @type {"leathal"|"stun"}
   */
  _damageType;

  /**
   * the protection type the damage works against.
   * @type {"mystical"|"physical"}
   */
  _armorType;

  /**
   * The roll object that is created for the damage.
   * @type {EdRoll}
   */
  _roll;

  /**
   * The options that are passed to the roll object.
   * @type {EdRollOptions}
   */
  _rollOptions;

  /**
   * The item being used for the damage.
   * @type {ItemEd|undefined}
   */
  _damageItem;

  /**
   * the attribute used for the damage.
   * @type {string}
   */
  _damageAttribute;

  /**
   * @Chris: what do we do with e.g. Falling damage. thats not from an actor?
   * @param {foundry.documents.Actor} attacker - The actor that is the source of the damage.
   * @param {WorkflowOptions&DamageWorkflowOptions} options - The options for the damage workflow.
   */
  constructor( attacker, options = {} ) {
    super( attacker, options );
    this._damageType = options.damageType ?? "leathal";

    this._steps.push(
      this.#setDamageAttribute.bind( this ),
      // this.#setSubstituteAbility.bind( this ),
      // this.#setExtraSuccesses.bind( this ),
      this.#setDamageType.bind( this ),
      this.#setArmorType.bind( this ),
      this.#setDamageItem.bind( this ),
      this.#createRollOptions.bind( this ),
      this.#createDamageRoll.bind( this ),
      this.#rollDamage.bind( this ),
    );
  }

  async #setDamageAttribute() {
    // define the base attribute for the damage roll
    if ( this._options.damageItem ) {
      this._damageAttribute = this._actor.system.attributes[this._options.damageItem.system.damage.attribute].step ?? this._actor.system.attributes.str.step;
    } else {
      this._damageAttribute = this._actor.system.attributes.str;
    }
  }

  // async #setSubstituteAbility() {
  // }

  // async #setExtraSuccesses() {
  // }

  async #setDamageType() {
    // define the damage tpye for the damage roll
    this._damageType = this._damageType ?? "leathal";
  }

  async #setArmorType() {
    // define the armor type for the damage roll
    this._armorType = this._armorType ?? "physical";
  }

  async #setDamageItem() {
    // define the damage item for the damage roll
    this._damageItem = this._options.damageItem ?? this._actor.attributes.str.step;
  }

  async #createRollOptions() {
    this._rollOptions = DamageRollOptions.fromActor(
      {
        ...this.getCommonDamageRollData(),
        damageItem: this._damageItem?.uuid ?? null,
        chatFlavor: game.i18n.format( "TODO.ED.Chat.Flavor.Damage", {} )
      },
      this._actor,
    );
  }

  async #createDamageRoll() {
    this._roll = await RollPrompt.waitPrompt(
      this._rollOptions,
      {
        rollData: this._actor,
      }
    );
  }

  async #rollDamage() {
    // currently used as intended, as roll processing is still part of the actor document
    this._result = this._roll;
  }

  async calculateDamageStep() {
    // if ( this._substituteAbility ) { 
    //   this.damageStep += this._substituteAbility.system.rankFinal;
    // } else {
    //   this.damageStep += this._actor.system.attributes[this._damageAttribute].step;
    // }
    // if ( this._damageItem ) this.damageStep += this._damageItem.system.rankFinal;
    // if ( this._exraSucceses ) this.damageStep += this._extraSuccesses * 2;

    let damageStep = 0;
    if ( this._damageItem ) {
      if ( this._damageItem.type === "weapon" ) {
        const totalWeaponStep = ( Number( this._damageAttribute ) + Number( this._damageItem.system.damage.baseStep ) );
        damageStep += totalWeaponStep;
      } else {
        damageStep += this._damageAttribute;
      };
    }
    return damageStep;
  }

  async getCommonDamageRollData() {
    const targetTokens = game.user.targets;
    const damageStep = await this.calculateDamageStep();
    return {
      step:       {
        total:      damageStep ?? 0,
        modifiers: {},
      },
      target:     {
        base:      0,
        modifiers: {},
        public:    false,
        tokens:    targetTokens.map( token => token.document.uuid ),
      },
      extraDice:  {},
      strain:     {
        base:      0,
        modifiers: {},
      },
      testType:   "effect",
      rollType:   "damage",
    };
  }

}