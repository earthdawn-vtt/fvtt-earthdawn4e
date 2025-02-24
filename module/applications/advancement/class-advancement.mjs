import ClassTemplate from "../../data/item/templates/class.mjs";
import ED4E from "../../config/_module.mjs";
import PromptFactory from "../global/prompt-factory.mjs";
import { getAllDocuments } from "../../utils.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { isEmpty } = foundry.utils;

export default class ClassAdvancementDialog extends HandlebarsApplicationMixin( ApplicationV2 ) {

  STEPS = [
    "requirements",
    "optionChoice",
    "spellSelection",
    "summary",
  ];

  buttonGoBack = PromptFactory.goBackButton;
  buttonContinue = Object.assign( PromptFactory.continueButton, { default: true } );
  buttonComplete = Object.assign( PromptFactory.completeButton, { default: true } );

  /**
   * @inheritDoc
   * @param {ItemEd} classItem                  The class item for which to display advancement options. Must be on its
   *                                            original level.
   * @param {Partial<Configuration>} [options]  Options used to configure the Application instance.
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
   */
  static async waitPrompt( classItem, options = {} ) {
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( classItem, options ).render( true, { focus: true } );
    } );
  }

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    id:      "class-advancement-dialog",
    classes: [ "earthdawn4e", "class-advancement-dialog" ],
    tag:     "form",
    window:  {
      frame: true,
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
      closeOnSubmit:  false,
    },
  };

  /** @inheritDoc */
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

  static async #onFormSubmission( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );
    this.selectedOption = data.selectedOption ?? this.selectedOption;
    this.selectedSpells = new Set( data.selectedSpells ?? this.selectedSpells );
  }

  static async _continue( event, target ) {
    if ( this.currentStep === 0 ) this.currentStep++;
    else if (
      this.classItem.system.spellcasting
      && game.settings.get( "ed4e", "lpTrackingLearnSpellsOnCircleUp" )
    ) this.currentStep++;
    else this.currentStep = this.STEPS.length - 1;

    this.render();
  }

  static async _goBack( event, target ) {
    if ( this.currentStep === 1 ) this.currentStep--;
    else if ( this.classItem.system.spellcasting ) this.currentStep--;
    else if ( this.currentStep === 3 ) this.currentStep = 1;
    else return;

    this.render();
  }

  static async _complete( event, target ) {
    this.resolve?.( {
      proceed:       true,
      abilityChoice: this.selectedOption,
      spells:        this.selectedSpells,
    } );
    return this.close();
  }

  /** @inheritDoc */
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
      [ "system.magicType" ],
      _ => true // x.system.magicType === this.classItem
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