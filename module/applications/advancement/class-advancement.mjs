import ClassTemplate from "../../data/item/templates/class.mjs";
import ED4E from "../../config/_module.mjs";
import PromptFactory from "../global/prompt-factory.mjs";
import { getAllDocuments } from "../../utils.mjs";
import ApplicationEd from "../api/application.mjs";

const { isEmpty } = foundry.utils;

export default class ClassAdvancementDialog extends ApplicationEd {

  /**
   * This is a very specific user function which is not following the pattern of the naming convention.
   * @userFunction UF_ClassAdvancementDialog-steps
   */
  STEPS = [
    "requirements",
    "optionChoice",
    "spellSelection",
    "summary",
  ];

  /**
   * Button to navigate to the previous step in the dialog.
   * Sourced from {@link PromptFactory.goBackButton}.
   * Used in steps where the user can go back to review or modify their choices.
   * @userFunction UF_ClassAdvancementDialog-buttonGoBack
   */
  buttonGoBack = PromptFactory.goBackButton;

  /**
   * Button to proceed to the next step in the dialog.
   * Sourced from {@link PromptFactory.continueButton}.
   * Marked as the default action for steps where the user can continue.
   * @userFunction UF_ClassAdvancementDialog-buttonContinue
   */
  buttonContinue = Object.assign( PromptFactory.continueButton, { default: true } );

  /**
   * Button to finalize the dialog and complete the process.
   * Sourced from {@link PromptFactory.completeButton}.
   * Marked as the default action for the final step of the dialog.
   * @userFunction UF_ClassAdvancementDialog-buttonComplete
   */
  buttonComplete = Object.assign( PromptFactory.completeButton, { default: true } );

  /**
   * @inheritDoc
   * @param {ItemEd} classItem                  The class item for which to display advancement options. Must be on its
   *                                            original level.
   * @param {Partial<Configuration>} [options]  Options used to configure the Application instance.
   * @userFunction UF_ClassAdvancementDialog-constructor
   */
  constructor( classItem, options = {} ) {

    if ( !classItem ) throw new Error( "A class item is required to create a class advancement dialog." );
    if ( !( classItem.system instanceof ClassTemplate ) && !classItem.system.hasMixin( ClassTemplate ) )
      throw new TypeError( "The provided item is not a class item." );

    super( options );

    this.resolve = options.resolve;

    this.currentStep = 0;

    this.classItem = classItem;
    this.actor = this.classItem.actor;

    this.currentLevel = this.classItem.system.level;
    this.nextLevel = this.currentLevel + 1;
    this.learning = this.currentLevel === 0;

    this.abilityUuidsByPoolType = classItem.system.advancement.levels[ this.nextLevel - 1 ].abilities;
    this.selectedOption = "";
    this.selectedSpells = new Set();
    this.effectsGained = this.classItem.system.advancement.levels[ this.nextLevel - 1 ].effects;
  }

  /**
   * Wait for dialog to be resolved.
   * @param {ItemEd} classItem                  The class item for which to display advancement options.
   * @param {Partial<Configuration>} [options]  Options used to configure the Application instance.
   * @param {object} [options.resolve]          The function to call when the dialog is resolved.
   * @returns {Promise<
   * {spendLp: string, abilityChoice: string, spells: Set<string>}
   * >}                                           The selected options of the dialog. The abilityChoice
   * @userFunction UF_ClassAdvancementDialog-waitPrompt
   */
  static async waitPrompt( classItem, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( classItem, options ).render( true, { focus: true } );
    } );
  }

  /** 
   * @inheritDoc 
   * @userFunction UF_ClassAdvancementDialog-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    id:       "class-advancement-dialog-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "class-advancement-dialog" ],
    window:   {
      icon:  `fa-thin ${ED4E.icons.classAdvancement}`,
      title: "ED.Dialogs.Title.classAdvancement",
    },
    actions: {
      continue: this._continue,
      goBack:   this._goBack,
      complete:  this._complete,
    },
    form:    {
      handler:        ClassAdvancementDialog.#onFormSubmission,
      submitOnChange: true,
    },
  };

  /** 
   * @inheritDoc 
   * @userFunction UF_ClassAdvancementDialog-parts
   */
  static PARTS = {
    requirements: {
      template:   "systems/ed4e/templates/advancement/advancement-requirements.hbs",
      id:         "advancement-requirements",
      classes:    [ "advancement-requirements" ],
      scrollable: [ "" ],
    },
    optionChoice:   {
      template:   "systems/ed4e/templates/advancement/class-advancement-option-choice.hbs",
      id:         "advancement-option-choice",
      classes:    [ "advancement-option-choice" ],
      scrollable: [ "" ],
    },
    spellSelection: {
      template:   "systems/ed4e/templates/advancement/class-advancement-spell-selection.hbs",
      id:         "advancement-spell-selection",
      classes:    [ "advancement-spell-selection" ],
      scrollable: [ "" ],
    },
    summary:        {
      template:   "systems/ed4e/templates/advancement/class-advancement-summary.hbs",
      id:         "advancement-summary",
      classes:    [ "advancement-summary" ],
      scrollable: [ "" ],
    },
    footer:         {
      template: "templates/generic/form-footer.hbs",
      classes:  [ "flexrow" ],
    },
  };

  /**
   * Handles form submission for the class advancement dialog.
   * @param {Event} event The event object triggered by the form submission.
   * @param {HTMLElement} form The form element.
   * @param {object} formData The form data.
   * @userFunction UF_ClassAdvancementDialog-onFormSubmission
   */
  static async #onFormSubmission( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );
    this.selectedOption = data.selectedOption ?? this.selectedOption;
    this.selectedSpells = new Set( data.selectedSpells ?? this.selectedSpells );
  }

  /**
   * Handles the click event for the continue button.
   * @param {Event} event The event object triggered by the button click.
   * @param {HTMLElement} target The target element.
   * @userFunction UF_ClassAdvancementDialog-continue
   */
  static async _continue( event, target ) {
    if ( this.currentStep === 0 ) this.currentStep++;
    else if (
      this.classItem.system.spellcasting
      && game.settings.get( "ed4e", "lpTrackingLearnSpellsOnCircleUp" )
    ) this.currentStep++;
    else this.currentStep = this.STEPS.length - 1;

    this.render();
  }

  /**
   * Handles the click event for the go back button.
   * @param {Event} event The event object triggered by the button click.
   * @param {HTMLElement} target The target element.
   * @userFunction UF_ClassAdvancementDialog-goBack
   */
  static async _goBack( event, target ) {
    if ( this.currentStep === 1 ) this.currentStep--;
    else if ( this.classItem.system.spellcasting ) this.currentStep--;
    else if ( this.currentStep === 3 ) this.currentStep = 1;
    else return;

    this.render();
  }

  /**
   * Handles the click event for the complete button.
   * @param {Event} event The event object triggered by the button click.
   * @param {HTMLElement} target The target element.
   * @returns {Promise<void>} A promise that resolves when the dialog is closed.
   * @userFunction UF_ClassAdvancementDialog-complete
   */
  static async _complete( event, target ) {
    this.resolve?.( {
      proceed:       true,
      abilityChoice: this.selectedOption,
      spells:        this.selectedSpells,
    } );
    return this.close();
  }

  /** 
   * @inheritDoc 
   * @userFunction UF_ClassAdvancementDialog-prepareContext
   */
  async _prepareContext( options = {} ) {
    const context = await super._prepareContext( options );

    context.render = {
      requirements:   this.currentStep === 0,
      optionChoice:   this.currentStep === 1,
      spellSelection: this.currentStep === 2,
      summary:        this.currentStep === 3,
    };

    context.classItem = this.classItem;
    context.learning = this.learning;
    context.config = ED4E;

    context.writtenRules = context.learning ? this.classItem.system.learnRules : this.classItem.system.increaseRules;
    context.requirementGroups = this.classItem.system.increaseValidationData;

    context.abilityOptionsByTier = this.classItem.system.advancement.availableAbilityOptions;
    context.selectedOption = this.selectedOption;

    context.availableSpells = this.classItem.system.spellcasting ? ( await getAllDocuments(
      "Item",
      "spell",
      true,
      "OBSERVER",
      [ "system.spellcastingType" ],
      spell => spell.system?.spellcastingType === this.classItem.system.getCastingType()
    ) ).filter(
      spell => !this.actor.itemTypes.spell.map( s => s.uuid ).includes( spell )
    ) : [];
    context.selectedSpells = Array.from( this.selectedSpells );

    context.nextLevel = this.nextLevel;
    context.tier = {
      current: this.classItem.system.advancement.levels[ this.currentLevel ].tier,
      next:    this.classItem.system.advancement.levels[ this.nextLevel - 1 ].tier,
    };
    context.tierChanged = context.tier.current !== context.tier.next;

    context.abilityOptionGained = !!this.selectedOption;
    context.abilityOption = this.selectedOption;
    context.gainedAbilities = context.abilityOptionGained
      || !isEmpty( this.abilityUuidsByPoolType.class )
      || !isEmpty( this.abilityUuidsByPoolType.free )
      || !isEmpty( this.abilityUuidsByPoolType.special );
    context.abilitiesGained = this.abilityUuidsByPoolType;

    context.effectsGained = this.effectsGained;

    context.spellsGained = this.selectedSpells;

    context.resourceStep = {
      current: this.classItem.system.advancement.levels[ this.currentLevel ].resourceStep,
      next:    this.classItem.system.advancement.levels[ this.nextLevel - 1 ].resourceStep,
    };
    context.resourceStepChanged = context.resourceStep.current !== context.resourceStep.next;

    context.buttons = [
      PromptFactory.cancelButton,
    ];

    switch ( this.STEPS[ this.currentStep ] ) {
      case "requirements":
        context.buttons.push( this.buttonContinue );
        break;
      case "optionChoice":
        context.buttons.push( this.buttonGoBack );
        context.buttons.push( this.buttonContinue );
        break;
      case "spellSelection":
        context.buttons.push( this.buttonGoBack );
        context.buttons.push( this.buttonContinue );
        break;
      case "summary":
        context.buttons.push( this.buttonGoBack );
        context.buttons.push( this.buttonComplete );
        break;
    }

    return context;
  }

}