import getDice from "./step-tables.mjs";
import { sum } from "../utils.mjs";
import ED4E from "../config/_module.mjs";
import { SYSTEM_TYPES } from "../constants/constants.mjs";

const { renderTemplate } = foundry.applications.handlebars;

/**
 * Data structure returned by getFlavorTemplateData() to populate roll flavor templates.
 * EdRollOptions subclasses may extend this with additional properties for specific roll types.
 * @typedef {object} RollFlavorTemplateData
 * @property {string} roller Name of the actor or user who made the roll
 * @property {string} [customFlavor] Optional custom flavor text for the roll
 * @property {number} result The total result of the roll
 * @property {object} step Information about the step used for the roll
 * @property {number} step.base The base step value
 * @property {{[key: string]: number}} step.modifiers Modifiers applied to the step
 * @property {number} step.total The final calculated step value
 * @property {object} target Information about the target difficulty
 * @property {number} target.base The base target difficulty value
 * @property {{[key: string]: number}} target.modifiers Modifiers applied to the target difficulty
 * @property {number} target.total The final calculated target difficulty value
 * @property {string} testType The localized label of the test type (action, effect, etc.)
 * @property {boolean} [ruleOfOne] Whether the roll triggered the Rule of One
 * @property {boolean} [success] Whether the roll was a success
 * @property {boolean} [failure] Whether the roll was a failure
 * @property {number} numSuccesses The number of successes achieved in the roll
 * @property {number} numExtraSuccesses The number of extra successes achieved in the roll
 */

export default class EdRoll extends Roll {

  // region Constructor

  constructor( formula = undefined, data = {}, edRollOptions = {} ) {
    const getBaseTerm = ( formula, edRollOptions ) => {
      if ( edRollOptions._dummy ) return "1";

      return formula
        ? formula
        : `(${getDice( edRollOptions.step.total )})[${game.i18n.localize( "ED.Rolls.step" )} ${
          edRollOptions.step.total
        }]`;
    };

    const baseTerm = getBaseTerm( formula, edRollOptions );
    super( baseTerm, data, edRollOptions );

    this.flavorTemplate = ED4E.rollTypes[this.options.rollType]?.flavorTemplate ?? ED4E.testTypes.arbitrary.flavorTemplate;

    if ( !this.options.extraDiceAdded ) this.#addExtraDice();
    if ( !this.options.configured ) this.#configureModifiers();
  }

  // endregion

  // region Static Properties
  /**
   * @inheritDoc
   */
  static TOOLTIP_TEMPLATE = "systems/ed4e/templates/chat/tooltip.hbs";

  // endregion

  // region Getters

  /**
   * Return the total result of the Roll expression if it has been evaluated. This
   * always evaluates to at least 1.
   * @type {number}
   */
  get total() {
    return this.options.hasOwnProperty( "rollType" )
      ? Math.max( super.total, 1 )
      : super.total;
  }

  get validEdRoll() {
    // First term must be a Die
    // return this.terms[0] instanceof Die;
    return true;
  }

  get isRuleOfOne() {
    if ( !this.validEdRoll || !this._evaluated ) return undefined;
    // more than one die required
    if ( this.numDice < 2 ) return false;
    return this.total === this.numDice;
  }

  get isBasicSuccess() {
    if ( !this.canCalculateSuccesses ) return undefined;
    return this.total >= this.options.target.total;
  }

  /**
   * Whether this roll is a dummy roll.
   * @type {boolean}
   */
  get isDummy() {
    return this.options._dummy === true;
  }

  get isSuccess() {
    if ( !this.validEdRoll || !this._evaluated || ![ "arbitrary", "action" ].includes( this.options.testType ) ) return undefined;
    if ( this.isRuleOfOne === true ) return false;
    return this.numSuccesses > 0;
  }

  get isFailure() {
    if ( !this.validEdRoll || !this._evaluated || ![ "arbitrary", "action" ].includes( this.options.testType ) ) return undefined;
    if ( this.isRuleOfOne === true ) return true;
    return this.numSuccesses <= 0;
  }

  get numDice() {
    // must be evaluated since dice can explode and add more dice
    if ( !this.validEdRoll || !this._evaluated ) return undefined;
    return this.dice
      .map( ( diceTerm ) => diceTerm.number )
      .reduce( ( accumulator, currentValue ) => accumulator + currentValue, 0 );
  }

  get totalStrain() {
    if ( !this.validEdRoll ) return undefined;
    return this.options.strain?.total ?? 0;
  }

  get canCalculateSuccesses() {
    return this.validEdRoll && this._evaluated && this.options.target && this.options.target.total >= 0;
  }

  get numSuccesses() {
    if ( !this.canCalculateSuccesses ) return undefined;

    const numBasicSuccess = this.isBasicSuccess ? 1 : 0;
    if ( numBasicSuccess < 1 && this.numGuaranteedSuccesses < 1 ) return 0;
    return (
      numBasicSuccess
      + this.numBasicExtraSuccesses
      + this.numGuaranteedSuccesses
      + this.numAdditionalExtraSuccesses
    );
  }

  get numBasicExtraSuccesses() {
    if ( !this.canCalculateSuccesses ) return undefined;
    return Math.trunc( ( this.total - this.options.target.total ) / 5 );
  }

  get numExtraSuccesses() {
    if ( !this.canCalculateSuccesses ) return undefined;
    return this.numBasicExtraSuccesses + this.numAdditionalExtraSuccesses;
  }

  /**
   * The number of guaranteed successes in this roll. Available even if the roll is not evaluated.
   * @type {undefined|number}
   */
  get numGuaranteedSuccesses() {
    if ( !this.validEdRoll ) return undefined;
    return this.options.successes?.guaranteed ?? 0;
  }

  /**
   * The number of additional extra successes in this roll. Available even if the roll is not evaluated.
   * @type {undefined|number}
   */
  get numAdditionalExtraSuccesses() {
    if ( !this.validEdRoll ) return undefined;
    return this.options.successes?.additionalExtra ?? 0;
  }

  // endregion

  // region Modifiers

  /**
   * @description           Apply modifiers to make all dice explode.
   * @private
   */
  #configureModifiers() {
    this.dice.map( ( diceTerm ) => {
      // Explodify all dice terms
      diceTerm.modifiers.push( "X" );
      return diceTerm;
    } );

    // Mark configuration as complete
    this.options.configured = true;
  }

  /**
   * @description             Add additional dice in groups, like karma, devotion or elemental damage.
   */
  #addExtraDice() {
    this.#addResourceDice( "karma" );
    this.#addResourceDice( "devotion" );
    this.#addExtraSteps();

    // Mark extra dice as complete
    this.options.extraDiceAdded = true;
  }

  /**
   * @description             Add dice from a given resource step. Currently only karma or devotion.
   * @param {"karma"|"devotion"} type The type of resource to add dice for.
   */
  #addResourceDice( type ) {
    const pointsUsed = this.options[type]?.pointsUsed;
    if ( pointsUsed > 0 ) {
      let diceTerm;
      let newTerms;
      for ( let i = 1; i <= pointsUsed; i++ ) {
        diceTerm = getDice( this.options[type].step );
        newTerms = Roll.parse(
          `(${diceTerm})[${game.i18n.localize( `ED.Rolls.${type}` )} ${i}]`,
          {}
        );
        this.terms.push( new foundry.dice.terms.OperatorTerm( {operator: "+"} ), ...newTerms );
      }
      this.resetFormula();
    }
  }

  /**
   * @description                   Add the dice from extra steps (like "Flame Weapon" or "Night's Edge").
   */
  #addExtraSteps() {
    if ( !foundry.utils.isEmpty( this.options?.extraDice ) ) {
      Object.entries( this.options.extraDice ).forEach( ( [ label, step ] ) => {
        const diceTerm = getDice( step );
        const newTerms = Roll.parse(
          `(${diceTerm})[${label}]`,
          {}
        );
        this.terms.push( new foundry.dice.terms.OperatorTerm( {operator: "+"} ), ...newTerms );
      } );
      this.resetFormula();
    }
  }

  // endregion

  // region Chat Messages

  /**
   * @description                     The text that is added to this roll's chat message when calling `toMessage`.
   * @returns {Promise<string>}       The rendered chat flavor text.
   */
  async getChatFlavor() {
    return renderTemplate( this.flavorTemplate, await this.getFlavorTemplateData() );
  }

  /**
   * @description                       Prepare the roll data for rendering the flavor template.
   * @returns {object}                  The context data object used to render the flavor template.
   */
  async getFlavorTemplateData() {
    let templateData = {};

    const rollingActor = await fromUuid( this.options.rollingActorUuid );

    // Basic Data
    templateData.CONFIG = CONFIG;
    templateData.roll = this;
    templateData.rollOptions = this.options;
    templateData.roller = rollingActor?.name
      ?? game.user.character?.name
      ?? canvas.tokens.controlled[0]
      ?? game.user.name;
    templateData.rollingActor = rollingActor;
    templateData.customFlavor = this.options.chatFlavor;
    templateData.result = this.total;
    templateData.step = this.options.step;
    templateData.target = this.options.target;
    templateData.testType = ED4E.testTypes[this.options.testType].label;
    templateData.ruleOfOne = this.isRuleOfOne;
    templateData.success = this.isSuccess;
    templateData.failure = this.isFailure;
    templateData.numBasicSuccesses = this.isBasicSuccess ? 1 : 0;
    templateData.numSuccesses = this.numSuccesses ?? 0;
    templateData.numBasicExtraSuccesses = this.numBasicExtraSuccesses ?? 0;
    templateData.numExtraSuccesses = this.numExtraSuccesses ?? 0;
    templateData.numGuaranteedSuccesses = this.numGuaranteedSuccesses ?? 0;
    templateData.numAdditionalExtraSuccesses = this.numAdditionalExtraSuccesses ?? 0;
    templateData.successesTooltip = this._getSuccessesTooltip();

    // Roll Type specific data
    if ( this.options.getFlavorTemplateData instanceof Function ) templateData = await this.options.getFlavorTemplateData( templateData );

    return templateData;
  }

  _getSuccessesTooltip() {
    let tooltip = [ game.i18n.format(
      "ED.Rolls.successesAchieved",
      {
        numSuccesses:      this.numSuccesses ?? 0,
        numExtraSuccesses: this.numExtraSuccesses ?? 0,
      },
    ) ];
    tooltip.push( "<ul class='successes-tooltip'>" );

    const numBasicSuccesses = this.isBasicSuccess ? 1 : 0;
    if ( numBasicSuccesses < 1 && this.numGuaranteedSuccesses > 0 ) {
      tooltip.push( `<li>${ game.i18n.format(
        "ED.Rolls.numBasicSuccesses",
        { numBasicSuccesses, },
      ) }</li>` );
    }
    if ( this.numGuaranteedSuccesses > 0 ) {
      tooltip.push( `<li>${ game.i18n.format(
        "ED.Rolls.numGuaranteedSuccesses",
        { numGuaranteedSuccesses: this.numGuaranteedSuccesses, },
      ) }</li>` );
    }
    if ( this.numBasicExtraSuccesses > 0 ) {
      tooltip.push( `<li>${ game.i18n.format(
        "ED.Rolls.numBasicExtraSuccesses",
        { numBasicExtraSuccesses: this.numBasicExtraSuccesses, },
      ) }</li>` );
    }
    if ( this.numAdditionalExtraSuccesses > 0 ) {
      tooltip.push( `<li>${ game.i18n.format(
        "ED.Rolls.numAdditionalExtraSuccesses",
        { numAdditionalExtraSuccesses: this.numAdditionalExtraSuccesses, },
      ) }</li>` );
    }

    tooltip.push( "</ul>" );

    return tooltip.join( "\n" );
  }

  /**
   * @description                       Add a success or failure class to the dice total.
   * @param {HTMLElement} element       The HTML element to which the class should be added.
   */
  addSuccessClass( element ) {
    if ( this.isSuccess || this.isFailure ) {
      element.querySelector( ".dice-total" ).classList.add(
        this.isSuccess ? "roll-success" : "roll-failure"
      );
    }
  }

  /**
   * @description                         Create the `rolls` part of the tooltip for displaying dice icons with results.
   * @param {DiceTerm[]} diceTerms        An array of dice terms with multiple results to be combined
   * @returns {{}[]}                      The desired classes
   */
  #getTooltipsRollData( diceTerms ) {
    const rolls = diceTerms.map( diceTerm => {
      return diceTerm.results.map( r => {
        return {
          result:  diceTerm.getResultLabel( r ),
          classes: diceTerm.getResultCSS( r ).filterJoin( " " )
        };
      } );
    } );

    return rolls.flat( Infinity );
  }

  /** @inheritDoc */
  async getTooltip() {
    const partsByFlavor = this.dice.reduce( ( acc, diceTerm ) => {
      const key = diceTerm.flavor;
      acc[key] = acc[key] ?? [];
      acc[key].push( diceTerm );
      return acc;
    }, {} );

    // Sort the dice terms of each part by size of the dice
    Object.values( partsByFlavor ).forEach(
      diceList => diceList.sort(
        ( a, b ) => a.faces - b.faces
      )
    );

    const parts = this.isDummy ? [] : Object.keys( partsByFlavor ).map( part => {
      return {
        formula: partsByFlavor[part].map( d => d.expression ).join( " + " ),
        total:   sum( partsByFlavor[part].map( d => d.total ) ),
        faces:   undefined,
        flavor:  part,
        rolls:   this.#getTooltipsRollData( partsByFlavor[part] )
      };
    } );

    return renderTemplate( this.constructor.TOOLTIP_TEMPLATE, { parts } );
  }

  /**
   * @description                                   Render a Roll instance to HTML
   * @param {object} [options]                   Options which affect how the Roll is rendered
   * @param {string} [options.flavor]               Flavor text to include
   * @param {string} [options.template]             A custom HTML template path
   * @param {boolean} [options.isPrivate]     Is the Roll displayed privately?
   * @returns {Promise<string>}                     The rendered HTML template as a string
   */
  async render( {flavor, template=this.constructor.CHAT_TEMPLATE, isPrivate=false}={} ) {
    if ( !this._evaluated ) await this.evaluate();
    const chatData = {
      formula: this.#getRenderedStepsFormula( isPrivate ),
      flavor:  isPrivate ? null : flavor,
      user:    game.user.id,
      tooltip: isPrivate ? "" : await this.getTooltip(),
      total:   this.#getRenderedTotal( isPrivate ),
    };
    return renderTemplate( template, chatData );
  }

  /** @inheritDoc */
  async toMessage( messageData = {}, options = {} ) {
    if ( !this._evaluated ) await this.evaluate();

    messageData.flavor = await this.getChatFlavor();
    messageData.type = ( this.options.rollType in CONFIG.ChatMessage.typeLabels )
      ? this.options.rollType
      : SYSTEM_TYPES.ChatMessage.common;

    return super.toMessage( messageData, options );

  }

  /**
   * @description                     Returns the formula string based on strings instead of dice.
   * @type {string}
   */
  #getRenderedStepsFormula( isPrivate = false ) {
    if ( isPrivate ) return "???";
    if ( this.isDummy ) return "---";

    const formulaParts = [
      game.i18n.format(
        "ED.Rolls.formulaStep", {
          step: this.options.step.total
        }
      ),
    ];
    if ( this.options.karma?.pointsUsed > 0 ) formulaParts.push(
      game.i18n.format(
        "ED.Rolls.formulaKarma",
        {
          step:   this.options.karma.step,
          amount: this.options.karma.pointsUsed
        }
      )
    );
    if ( this.options.devotion?.pointsUsed > 0 ) formulaParts.push(
      game.i18n.format(
        "ED.Rolls.formulaDevotion",
        {
          step:   this.options.devotion.step,
          amount: this.options.devotion.pointsUsed
        }
      )
    );

    formulaParts.push( ...Object.entries(
      this.options.extraDice
    ).map(
      ( [ label, step ] ) => game.i18n.format(
        "ED.Rolls.formulaExtraStep",
        {
          label,
          step
        }
      )
    ) );

    return formulaParts.filterJoin( " + " );
  }

  #getRenderedTotal( isPrivate = false ) {
    if ( isPrivate ) return "?";
    if ( this.isDummy ) return "-";

    return  Math.round( this.total * 100 ) / 100;
  }

  // endregion
}