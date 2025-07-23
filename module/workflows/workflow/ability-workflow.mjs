import RollProcessor from "../../services/roll-processor.mjs";
import AbilityRollOptions from "../data/roll/ability.mjs";

/**
 * @typedef {object} AbilityRollOptions
 */

/**
 * Workflow for handling actor ability tests.
 */
export default class AbilityWorkflow extends Rollable( ActorWorkflow ) {
    /**
     * The attribute step the ability is based on.
     * @type {number}
     * @private
     */
    _attributeStep;

    /**
     * The ability rank.
     * @type {number}
     * @private
     */
    _abilityRank;

    /**
     * Strain cost of the ability.
     * @type {number}
     * @private
     */
    _strain;

    /**
     * The difficulty of the ability test.
     * @type {number}
     * @private
     */
    _difficulty;

    // region constructor
    /**
     * @param {ActorEd} actor The actor performing the ability test
     * @param {Ability} ability The ability being tested
     * @param {AbilityRollOptions} options The options for the ability workflow
     */
    constructor( actor, ability, options = {} ) {
        super( actor, ability, options );

        this._attributeStep = actor.system.attributes[ability.system.attribute].step;
        this._abilityRank = ability.system.level ?? 0;
        this._strain = ability.system.strain ?? 0;
        this._difficulty = options.difficulty || game.settings.get( "ed4e", "minimumDifficulty" );

        this._steps = [
            this._prepareRollOptions.bind( this ),
            this._performAbiltyRoll.bind( this ),
            this._processAbilityRoll.bind( this ),
        ];
    }

    /**
     * Prepare roll options
     * @return {Promise<void>}
     * @private
     */
    async _prepareRollOptions() {
        const stepModifiers = {};
        const allTestsModifier = this._actor.system.globalBonuses?.allTests.value ?? 0
        const allActionModifier = this._actor.system.globalBonuses?.allActions.value ?? 0;
        if ( allTestsModifier || allActionModifier ) {
        stepModifiers.allActions = allAbilityModifier + allActionModifier;
        stepModifiers.allTests = allAbilityModifier + allTestsModifier;
        }
        this._rollOptions = KnockdownRollOptions.fromActor(
        {
            step:         {
                base:      this._attributeStep + this._abilityRank,
                // does this work like this?
                modifiers: stepModifiers[
                allActions,
                allTests
                ]
            
            },
            strain: {
                base:      this._strain,
            },
            target: {
                base:      this._difficulty,
            },
            chatFlavor: game.i18n.format ( 
            "ED.Chat.Flavor.rollAbility",
            {
                actor: this._actor.name,
                attribute: ability.name,
                step:  this._knockdownStep,
            }
            )
        },
        this._actor,
        );
    }

    /**
     * Perform ability roll.
     * @return {Promise<void>}
     * @private
     */
    async _performAbiltyRoll() {
        if ( this._roll === null ) {
            this._roll = null;
            this._result = null;
            return;
        }

        await this._createRoll();
        await this._roll.evaluate();
        this._result = this._roll;
    }

    /**
     * Process ability roll.
     * @return {Promise<void>}
     * @private
     */
    async _processAbilityRoll() {
        await RollProcessor.process( this._roll, this._actor, { rollToMessage: false } );
    }

}