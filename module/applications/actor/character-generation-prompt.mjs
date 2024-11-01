import { documentsToSelectChoices, filterObject, getAllDocuments } from "../../utils.mjs";
import ED4E from "../../config.mjs";
import CharacterGenerationData from "../../data/other/character-generation.mjs";
import ItemEd from "../../documents/item.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class CharacterGenerationPrompt extends HandlebarsApplicationMixin( ApplicationV2 ) {

  magicType;

  constructor( charGen, options = {}, documentCollections ) {
    const charGenData = charGen ?? new CharacterGenerationData();
    super( charGenData );

    this.resolve = options.resolve;

    this.namegivers = documentCollections.namegivers;
    this.disciplines = documentCollections.disciplines;
    this.questors = documentCollections.questors;
    this.skills = documentCollections.skills;
    this.spells = documentCollections.spells;

    this.availableAttributePoints = game.settings.get( "ed4e", "charGenAttributePoints" );

    this.edidLanguageSpeak = game.settings.get( "ed4e", "edidLanguageSpeak" );
    this.edidLanguageRW = game.settings.get( "ed4e", "edidLanguageRW" );

    this._steps = [
      "namegiver",
      "class",
      "attribute",
      "spell",
      "skill",
      "language",
      "equipment"
    ];
    this._currentStep = 0;

    this.tabGroups = {
      primary: "namegiver-tab",
    };
  }

  static errorMessages = {
    noNamegiver:      "X.You didn't choose a namegiver. Pretty difficult to be a person then, don't you think?",
    noClass:          "X.There's no class selected. Don't you wanna be magic?",
    attributes:       "X. This is just reminder: there are still some unspent attribute points. They will be converted to extra karma.",
    talentRanksLeft:  "X.There's still some ranks left for your class abilities. Use them, they're free.",
    skillRanksLeft:   "X.You haven't used all of your skill ranks. Come on, don't be shy.",
  };

  static DEFAULT_OPTIONS = {
    id:      "character-generation-prompt",
    classes: [ "earthdawn4e", "character-generation" ],
    tag:     "form",
    window:  {
      frame: true,
      icon:  "fa-thin fa-user",
      title: "ED.Dialogs.CharacterGeneration",
    },
    actions: {
      next:            this._nextTab,
      previous:        this._previousTab,
      finish:          this._finishGeneration,
      talentOption:    this._onSelectTalentOption,
      changeRank:      this._onChangeRank,
      changeAttribute: this._onChangeAttributeModifier,
      changeSpell:     this._onClickSpell,
      resetPoints:     this._onReset,
    },
    form:    {
      handler:        CharacterGenerationPrompt.#onFormSubmission,
      submitOnChange: true,
      submitOnClose:  false,
    },
  };

  /* ----------------------------------------------------------- */
  /* --------------------------  Parts  ------------------------ */
  /* ----------------------------------------------------------- */
  
  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      id:       "-tabs-navigation",
      classes:  [ "navigation" ],
    },
    "namegiver-tab": {
      template: "systems/ed4e/templates/actor/generation/namegiver-selection.hbs",
      id:       "-namegiver-tab",
      classes:  [ "namegiver" ],
    },
    "class-tab": {
      template: "systems/ed4e/templates/actor/generation/class-selection.hbs",
      id:       "-class-tab",
      classes:  [ "class" ],
    },
    "attribute-tab": {
      template: "systems/ed4e/templates/actor/generation/attribute-assignment.hbs",
      id:       "-attribute-tab",
      classes:  [ "attribute" ],
    },
    "spell-tab": {
      template: "systems/ed4e/templates/actor/generation/spell-selection.hbs",
      id:       "-spell-tab",
      classes:  [ "spell" ],
    },
    "skill-tab": {
      template: "systems/ed4e/templates/actor/generation/skill-selection.hbs",
      id:       "-skill-tab",
      classes:  [ "skill" ],
    },
    "language-tab": {
      template: "systems/ed4e/templates/actor/generation/language-selection.hbs",
      id:       "-language-tab",
      classes:  [ "language" ],
    },
    "equipment-tab": {
      template: "systems/ed4e/templates/actor/generation/equipment.hbs",
      id:       "-equipment-tab",
      classes:  [ "equipment" ],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      id:       "-footer",
      classes:  [ "flexrow" ],
    }
  };

  /* ----------------------------------------------------------- */
  /* -------------------  preparePartContext  ------------------ */
  /* ----------------------------------------------------------- */

  async _preparePartContext( partId, context, options ) {
    await super._preparePartContext( partId, context, options );

    switch ( partId ) {
      case "tabs": return this._prepareTabsContext( context, options );
      case "namegiver-tab":
        break;
      case "class-tab":
        break;
      case "attribute-tab":
        break;
      case "spell-tab":
        break;
      case "skill-tab":
        break;
      case "language-tab":
        break;
      case "equipment-tab":
        break;
    }

    // We only reach it if we're in a tab part
    const tabGroup = "primary";
    context.tab = foundry.utils.deepClone( this.constructor.TABS[partId] );
    if ( this.tabGroups[tabGroup] === context.tab?.id ) context.tab.cssClass = "active";

    return context;
  }

  async _prepareTabsContext( context, options ) {
    // make a deep copy to guarantee the css classes are always empty before setting it to active
    context.tabs = foundry.utils.deepClone( this.constructor.TABS );
    const tab = this.tabGroups.primary;
    context.tabs[tab].cssClass = "active";

    return context;
  }

  /* ----------------------------------------------------------- */
  /* --------------------------  Tabs  ------------------------- */
  /* ----------------------------------------------------------- */

  /**
   * @type {Record<string, ApplicationTab>}
   */
  static TABS = {
    "namegiver-tab": {
      id:       "namegiver-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.CharGen.namegiver",
      active:   false,
      cssClass: ""
    },
    "class-tab": {
      id:       "class-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.CharGen.class",
      active:   false,
      cssClass: ""
    },
    "attribute-tab": {
      id:       "attribute-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.CharGen.attribute",
      active:   false,
      cssClass: ""
    },
    "spell-tab": {
      id:       "spell-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.CharGen.spell",
      active:   false,
      cssClass: ""
    },
    "skill-tab": {
      id:       "skill-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.CharGen.skill",
      active:   false,
      cssClass: ""
    },
    "language-tab": {
      id:       "language-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.CharGen.language",
      active:   false,
      cssClass: ""
    },
    "equipment-tab": {
      id:       "equipment-tab",
      group:    "primary",
      icon:     "",
      label:    "ED.Dialogs.Tabs.CharGen.equipment",
      active:   false,
      cssClass: ""
    },
  };

  /* ----------------------------------------------------------- */
  /* ------------------------  Buttons  ------------------------ */
  /* ----------------------------------------------------------- */

  buttons = [
    {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.cancel" ),
      cssClass: "cancel",
      icon:     `fas ${ED4E.icons.cancel}`,
      action:   "close",
    },
    {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.nextStep" ),
      cssClass: "next",
      icon:     `fa-regular ${ED4E.icons.nextCharGen}`,
      action:   "next",
    },
    {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.previousStep" ),
      cssClass: "previous",
      icon:     `fas ${ED4E.icons.previousCharGen}`,
      action:   "previous",
    },
    {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.finish" ),
      cssClass: "finish",
      icon:     `fa-regular ${ED4E.icons.finishCharGen}`,
      action:   "finish",
    }
  ];

  /* ----------------------------------------------------------- */
  /* --------------------------  Form  ------------------------- */
  /* ----------------------------------------------------------- */

  static async #onFormSubmission( event, form, formData ) {

    const data = foundry.utils.expandObject( formData );

    data.namegiver ??= null;

    // Reset selected class if class type changed
    if ( data.isAdept !== this.object.isAdept ) data.selectedClass = null;

    // Set class specifics
    if ( data.selectedClass ) {
      this.object.classAbilities = await fromUuid( data.selectedClass );
    }

    // process selected class option ability
    if ( data.abilityOption ) this.object.abilityOption = data.abilityOption;

    // Check the maximum selectable number of languages by comparing the array length
    // of the selected languages with the rank of the corresponding language skill
    // always use the stored ranks, since we never have a rank assignment in `_updateObject`
    const languageSkillRanks = await this.object.getLanguageSkillRanks();
    if ( data.languages.speak.length > languageSkillRanks.speak ) {
      delete data.languages.speak;
      ui.notifications.warn( game.i18n.format( "X.Can only choose X languages to speak (your rank in that skill." ) );
    }
    if ( data.languages.readWrite.length > languageSkillRanks.readWrite ) {
      delete data.languages.readWrite;
      ui.notifications.warn( game.i18n.format( "X.Can only choose X languages to read / write (your rank in that skill." ) );
    }
    if ( foundry.utils.isEmpty( data.languages ) ) delete data.languages;

    this.object.updateSource( data );

    // wait for the update, so we can use the data models method
    this.magicType = await this.object.getMagicType();

    // Re-render sheet with updated values
    this.render( true );
  }

  /* ----------------------------------------------------------- */
  /* ------------------------  Actions  ------------------------ */
  /* ----------------------------------------------------------- */

  static _nextTab( event, target ) {
    if ( !this._hasNextStep() ) return;
    // if ( !this._validateOnChangeTab() ) return;
    this._currentStep++;
    this.activateTab( this._steps[this._currentStep] );
    this.render( true );
  }

  static _previousTab( event, target ) {
    if ( !this._hasPreviousStep() ) return;
    // if ( !this._validateOnChangeTab() ) return;
    this._currentStep--;
    this.activateTab( this._steps[this._currentStep] );
    this.render( true );
  }

  _hasNextStep() {
    return this._currentStep < this._steps.length - 1;
  }

  _hasPreviousStep() {
    return this._currentStep > 0;
  }

  async _finishGeneration( event ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if ( !this._validateCompletion() ) {
      ui.notifications.error( game.i18n.localize( "X.No no no, You're not finished yet." ) );
      return;
    }

    this.resolve?.( this.object );
    return this.close();
  }

  _validateCompletion() {
    const errorLevel = "error";
    return this._validateNamegiver( errorLevel, true )
      && this._validateClass( errorLevel, true )
      && this._validateClassRanks( errorLevel, true )
      // this._validateAttributes( "warn", true );
      && this._validateSkills( errorLevel, true );
  }

  _validateNamegiver( errorLevel = "warn", displayNotification = false ) {
    const hasNamegiver = !!this.object.namegiver;
    if ( displayNotification ) {
      if ( !hasNamegiver ) this._displayValidationError( errorLevel, "noNamegiver" );
    }
    return hasNamegiver;
  }

  _validateClass( errorLevel = "warn", displayNotification = false ) {
    const hasClass = !!this.object.selectedClass;
    if ( displayNotification ) {
      if ( !hasClass ) this._displayValidationError( errorLevel, "noClass" );
    }
    return hasClass;
  }

  _validateClassRanks( errorLevel = "warn", displayNotification = false ) {
    const hasRanks = this.object.availableRanks[this.object.isAdept ? "talent" : "devotion"] > 0;
    if ( displayNotification ) {
      if ( hasRanks ) this._displayValidationError( errorLevel, "talentRanksLeft" );
    }
    return !hasRanks;
  }

  _validateAttributes( errorLevel = "info", displayNotification = false ) {
    const hasAttributePoints = this.object.availableAttributePoints > 0;
    if ( displayNotification ) {
      if ( hasAttributePoints ) this._displayValidationError( errorLevel, "attributes" );
    }
    return !hasAttributePoints;
  }

  _validateSkills( errorLevel = "warn", displayNotification = false ) {
    const availableRanks = filterObject(
      this.object.availableRanks,
      ( [ key, _ ] ) => ![ "talent", "devotion" ].includes( key )
    );
    availableRanks[this.object.isAdept ? "devotion" : "talent"] = 0;
    availableRanks["readWrite"] = 0;
    availableRanks["speak"] = 0;
    const hasRanks = Object.values( availableRanks ).some( value => value > 0 );
    if ( displayNotification ) {
      if ( hasRanks ) this._displayValidationError( errorLevel, "skillRanksLeft" );
    }
    return !hasRanks;
  }

  _displayValidationError( level, type ) {
    ui.notifications[level]( game.i18n.format( this.constructor.errorMessages[type] ) );
  }

  static _onSelectTalentOption( event, target ) {
    event.currentTarget.querySelector( "input[type=\"radio\"]" ).click();
  }

  static _onChangeRank( event, target ) {
    const abilityUuid = event.currentTarget.dataset.abilityUuid;
    const abilityType = event.currentTarget.dataset.abilityType;
    const changeType = event.currentTarget.dataset.changeType;
    this.object.changeAbilityRank( abilityUuid, abilityType, changeType ).then( _ => this.render() );
  }

  static _onChangeAttributeModifier( event, target ) {
    const attribute = event.currentTarget.dataset.attribute;
    const changeType = event.currentTarget.dataset.changeType;
    this.object.changeAttributeModifier( attribute, changeType ).then( _ => this.render() );
  }

  static _onClickSpell( event, target ) {
    const spellSelected = event.currentTarget.dataset.spellSelected;
    let result;
    if ( spellSelected === "false" ) {
      // add the spell
      result = this.object.addSpell( event.currentTarget.dataset.spellUuid );
    } else if ( spellSelected === "true" ) {
      // unselect the spell
      result = this.object.removeSpell( event.currentTarget.dataset.spellUuid );
    }
    result.then( _ => this.render() );
  }

  static _onReset( event, target ) {
    const resetType = event.currentTarget.dataset.resetType;
    this.object.resetPoints( resetType ).then( _ => this.render() );
  }

  /* ----------------------------------------------------------- */
  /* -----------------------  weitPrompt  ---------------------- */
  /* ----------------------------------------------------------- */

  /**
   * Wait for dialog to be resolved.
   * @param {object} [charGenData]           Initial data to pass to the constructor.
   * @param {object} [options]        Options to pass to the constructor.
   */
  static async waitPrompt( charGenData, options = {} ) {
    const data = charGenData ?? new CharacterGenerationData();

    const docCollections = {
      namegivers:   await getAllDocuments( "Item", "namegiver", false, "OBSERVER" ),
      disciplines:  await getAllDocuments( "Item", "discipline", false, "OBSERVER" ),
      questors:     await getAllDocuments( "Item", "questor", false, "OBSERVER" ),
      skills:       await getAllDocuments(
        "Item",
        "skill",
        false,
        "OBSERVER",
        [ "system.tier" ],
        ( x ) => x.system.tier === "novice",
      ),
      spells: await getAllDocuments(
        "Item",
        "spell",
        false,
        "OBSERVER",
        [ "system.level" ],
        ( x ) => x.system.level <= game.settings.get( "ed4e", "charGenMaxSpellCircle" ),
      ),
    };

    // add the language skills manually, so we can localize them and assert the correct edid
    const edidLanguageSpeak = game.settings.get( "ed4e", "edidLanguageSpeak" );
    const edidLanguageRW = game.settings.get( "ed4e", "edidLanguageRW" );
    let skillLanguageSpeak = docCollections.skills.find( skill => skill.system.edid === edidLanguageSpeak );
    let skillLanguageRW = docCollections.skills.find( skill => skill.system.edid === edidLanguageRW );

    if ( !skillLanguageSpeak ) {
      skillLanguageSpeak = await ItemEd.create(
        foundry.utils.mergeObject(
          ED4E.documentData.Item.skill.languageSpeak,
          { system: { level: ED4E.availableRanks.speak, edid: edidLanguageSpeak } },
          { inplace: false } ),
      );
      docCollections.skills.push( skillLanguageSpeak );
    }
    if ( !skillLanguageRW ) {
      skillLanguageRW = await ItemEd.create(
        foundry.utils.mergeObject(
          ED4E.documentData.Item.skill.languageRW,
          { system: { level: ED4E.availableRanks.readWrite, edid: edidLanguageRW } },
          { inplace: false } ),
      );
      docCollections.skills.push( skillLanguageRW );
    }

    data.updateSource( {
      abilities: {
        language: {
          [skillLanguageSpeak.uuid]: skillLanguageSpeak.system.level,
          [skillLanguageRW.uuid]:    skillLanguageRW.system.level,
        }
      }
    } );

    // create the prompt
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( data, options, docCollections ).render( true, { focus: true } );
    } );
  }


  /* ----------------------------------------------------------- */
  /* --------------------  _prepareContext  -------------------- */
  /* ----------------------------------------------------------- */

  async _prepareContext( options = {} ) {
    const context = super._prepareContext( options );

    context.config = ED4E;

    // Namegiver
    context.namegivers = this.namegivers;
    // context.namegiverDocument = await context.object.namegiverDocument;

    // Class
    context.disciplines = this.disciplines;
    context.disciplineRadioChoices = documentsToSelectChoices( this.disciplines );
    context.questors = this.questors;
    context.questorRadioChoices = documentsToSelectChoices( this.questors );
    // context.classDocument = await context.object.classDocument;

    // Talents & Devotions
    context.maxAssignableRanks = game.settings.get( "ed4e", "charGenMaxRank" );

    // Abilities
    // remove language skills from general skills, otherwise they will be displayed twice
    const languageSkills = this.skills.filter( skill => [ this.edidLanguageRW, this.edidLanguageSpeak ].includes( skill.system.edid ) );
    const filteredSkills = this.skills.filter( skill => !languageSkills.includes( skill ) );
    context.skills = {
      general:    filteredSkills.filter( skill => skill.system.skillType === "general" ),
      artisan:    filteredSkills.filter( skill => skill.system.skillType === "artisan" ),
      knowledge:  filteredSkills.filter( skill => skill.system.skillType === "knowledge" ),
      language:   languageSkills,
    };

    // Attributes
    // context.finalAttributeValues = await context.object.getFinalAttributeValues();
    // context.availableAttributePoints = context.object.availableAttributePoints;
    context.maxAttributePoints = game.settings.get( "ed4e", "charGenAttributePoints" );
    // context.previews = await context.object.getCharacteristicsPreview();

    // Spells
    // context.availableSpellPoints = await this.object.getAvailableSpellPoints();
    // context.maxSpellPoints = await this.object.getMaxSpellPoints();
    context.spells = this.spells.filter( spell => spell.system.magicType === this.magicType );
    context.spellsBifurcated = context.spells.map(
      spell => this.object.spells.has( spell.uuid ) ? [ null, spell ] : [ spell, null ]
    );
    context.spellsByCircle = context.spellsBifurcated?.reduce( ( acc, spellTuple ) => {
      const { system: { level } } = spellTuple[0] ?? spellTuple[1];
      acc[level] ??= [];
      acc[level].push( spellTuple );
      return acc;
    }, {} );

    // Dialog Config
    context.hasNextStep = this._hasNextStep();
    context.hasNoNextStep = !context.hasNextStep;
    context.hasPreviousStep = this._hasPreviousStep();
    context.hasNoPreviousStep = !context.hasPreviousStep;

    return context;
  }
  
}







/**
 * The application responsible for handling character generation
 * @augments {FormApplication}
 * @param {CharacterGenerationData} charGen         The data model which is the
 *      target data structure to be updated by the form.
 * @param {FormApplicationOptions} [options={}]     Additional options which
 *      modify the rendering of the sheet.
 * @param {{string:[Document]}} documentCollections An object mapping the
 *      document subtypes to arrays of the available documents of that type.
 */
// export default class CharacterGenerationPrompt extends FormApplication {
// export class CharacterGenerationPromptV1 extends FormApplication {

//   // magicType;
  
//   // constructor( charGen, options = {}, documentCollections ) {
//   //   const charGenData = charGen ?? new CharacterGenerationData();
//   //   super( charGenData );

//   //   this.resolve = options.resolve;

//   //   this.namegivers = documentCollections.namegivers;
//   //   this.disciplines = documentCollections.disciplines;
//   //   this.questors = documentCollections.questors;
//   //   this.skills = documentCollections.skills;
//   //   this.spells = documentCollections.spells;

//   //   this.availableAttributePoints = game.settings.get( "ed4e", "charGenAttributePoints" );

//   //   this.edidLanguageSpeak = game.settings.get( "ed4e", "edidLanguageSpeak" );
//   //   this.edidLanguageRW = game.settings.get( "ed4e", "edidLanguageRW" );

//   //   this._steps = [
//   //     "namegiver-tab",
//   //     "class-tab",
//   //     "attribute-tab",
//   //     "spell-tab",
//   //     "skill-tab",
//   //     "language-tab",
//   //     "equipment-tab"
//   //   ];
//   //   this._currentStep = 0;
//   // }

//   // /**
//   //  * Wait for dialog to be resolved.
//   //  * @param {object} [charGenData]           Initial data to pass to the constructor.
//   //  * @param {object} [options]        Options to pass to the constructor.
//   //  */
//   // static async waitPrompt( charGenData, options = {} ) {
//   //   const data = charGenData ?? new CharacterGenerationData();

//   //   const docCollections = {
//   //     namegivers:   await getAllDocuments( "Item", "namegiver", false, "OBSERVER" ),
//   //     disciplines:  await getAllDocuments( "Item", "discipline", false, "OBSERVER" ),
//   //     questors:     await getAllDocuments( "Item", "questor", false, "OBSERVER" ),
//   //     skills:       await getAllDocuments(
//   //       "Item",
//   //       "skill",
//   //       false,
//   //       "OBSERVER",
//   //       [ "system.tier" ],
//   //       ( x ) => x.system.tier === "novice",
//   //     ),
//   //     spells: await getAllDocuments(
//   //       "Item",
//   //       "spell",
//   //       false,
//   //       "OBSERVER",
//   //       [ "system.level" ],
//   //       ( x ) => x.system.level <= game.settings.get( "ed4e", "charGenMaxSpellCircle" ),
//   //     ),
//   //   };

//   //   // add the language skills manually, so we can localize them and assert the correct edid
//   //   const edidLanguageSpeak = game.settings.get( "ed4e", "edidLanguageSpeak" );
//   //   const edidLanguageRW = game.settings.get( "ed4e", "edidLanguageRW" );
//   //   let skillLanguageSpeak = docCollections.skills.find( skill => skill.system.edid === edidLanguageSpeak );
//   //   let skillLanguageRW = docCollections.skills.find( skill => skill.system.edid === edidLanguageRW );

//   //   if ( !skillLanguageSpeak ) {
//   //     skillLanguageSpeak = await ItemEd.create(
//   //       foundry.utils.mergeObject(
//   //         ED4E.documentData.Item.skill.languageSpeak,
//   //         { system: { level: ED4E.availableRanks.speak, edid: edidLanguageSpeak } },
//   //         { inplace: false } ),
//   //     );
//   //     docCollections.skills.push( skillLanguageSpeak );
//   //   }
//   //   if ( !skillLanguageRW ) {
//   //     skillLanguageRW = await ItemEd.create(
//   //       foundry.utils.mergeObject(
//   //         ED4E.documentData.Item.skill.languageRW,
//   //         { system: { level: ED4E.availableRanks.readWrite, edid: edidLanguageRW } },
//   //         { inplace: false } ),
//   //     );
//   //     docCollections.skills.push( skillLanguageRW );
//   //   }

//   //   data.updateSource( {
//   //     abilities: {
//   //       language: {
//   //         [skillLanguageSpeak.uuid]: skillLanguageSpeak.system.level,
//   //         [skillLanguageRW.uuid]:    skillLanguageRW.system.level,
//   //       }
//   //     }
//   //   } );

//   //   // create the prompt
//   //   return new Promise( ( resolve ) => {
//   //     options.resolve = resolve;
//   //     new this( data, options, docCollections ).render( true, { focus: true } );
//   //   } );
//   // }

//   // static get defaultOptions() {
//   //   const options = super.defaultOptions;
//   //   return {
//   //     ...options,
//   //     closeOnSubmit:  false,
//   //     submitOnChange: true,
//   //     submitOnClose:  false,
//   //     height:         850,
//   //     width:          1000,
//   //     resizable:      true,
//   //     classes:        [ ...options.classes, "earthdawn4e", "character-generation" ],
//   //     tabs:           [
//   //       {
//   //         navSelector:     ".prompt-tabs",
//   //         contentSelector: ".tab-body",
//   //         initial:         "base-input",
//   //       },
//   //     ],
//   //   };
//   // }

//   // static errorMessages = {
//   //   noNamegiver:      "X.You didn't choose a namegiver. Pretty difficult to be a person then, don't you think?",
//   //   noClass:          "X.There's no class selected. Don't you wanna be magic?",
//   //   attributes:       "X. This is just reminder: there are still some unspent attribute points. They will be converted to extra karma.",
//   //   talentRanksLeft:  "X.There's still some ranks left for your class abilities. Use them, they're free.",
//   //   skillRanksLeft:   "X.You haven't used all of your skill ranks. Come on, don't be shy.",
//   // };

//   // get title() {
//   //   return game.i18n.localize( "X-Character Generation" );
//   // }

//   // get template() {
//   //   return "systems/ed4e/templates/actor/generation/generation.hbs";
//   // }

//   /** @inheritDoc */
//   // activateListeners( html ) {
//   //   super.activateListeners( html );

//   //   $( this.form.querySelectorAll( ".talent-tables .optional-talents-pool td.ability-name" ) ).on(
//   //     "click", this._onSelectTalentOption.bind( this )
//   //   );
//   //   $( this.form.querySelectorAll( "span.rank-change-icon" ) ).on(
//   //     "click", this._onChangeRank.bind( this )
//   //   );
//   //   $( this.form.querySelectorAll( "span.attribute-change-icon" ) ).on(
//   //     "click", this._onChangeAttributeModifier.bind( this )
//   //   );
//   //   $( this.form.querySelectorAll( "td.spell-name" ) ).on(
//   //     "click", this._onClickSpell.bind( this )
//   //   );
//   //   $( this.form.querySelectorAll( "button.reset-points" ) ).on( "click", this._onReset.bind( this ) );
//   //   $( this.form.querySelector( "button.next" ) ).on( "click", this._nextTab.bind( this ) );
//   //   $( this.form.querySelector( "button.previous" ) ).on( "click", this._previousTab.bind( this ) );
//   //   $( this.form.querySelector( "button.cancel" ) ).on( "click", this.close.bind( this ) );
//   //   $( this.form.querySelector( "button.ok" ) ).on( "click", this._finishGeneration.bind( this ) );
//   // }

//   // async getData( options = {} ) {
//   //   const context = super.getData( options );

//   //   context.config = ED4E;

//   //   // Namegiver
//   //   context.namegivers = this.namegivers;
//   //   context.namegiverDocument = await context.object.namegiverDocument;

//   //   // Class
//   //   context.disciplines = this.disciplines;
//   //   context.disciplineRadioChoices = documentsToSelectChoices( this.disciplines );
//   //   context.questors = this.questors;
//   //   context.questorRadioChoices = documentsToSelectChoices( this.questors );
//   //   context.classDocument = await context.object.classDocument;

//   //   // Talents & Devotions
//   //   context.maxAssignableRanks = game.settings.get( "ed4e", "charGenMaxRank" );

//   //   // Abilities
//   //   // remove language skills from general skills, otherwise they will be displayed twice
//   //   const languageSkills = this.skills.filter( skill => [ this.edidLanguageRW, this.edidLanguageSpeak ].includes( skill.system.edid ) );
//   //   const filteredSkills = this.skills.filter( skill => !languageSkills.includes( skill ) );
//   //   context.skills = {
//   //     general:    filteredSkills.filter( skill => skill.system.skillType === "general" ),
//   //     artisan:    filteredSkills.filter( skill => skill.system.skillType === "artisan" ),
//   //     knowledge:  filteredSkills.filter( skill => skill.system.skillType === "knowledge" ),
//   //     language:   languageSkills,
//   //   };

//   //   // Attributes
//   //   context.finalAttributeValues = await context.object.getFinalAttributeValues();
//   //   context.availableAttributePoints = context.object.availableAttributePoints;
//   //   context.maxAttributePoints = game.settings.get( "ed4e", "charGenAttributePoints" );
//   //   context.previews = await context.object.getCharacteristicsPreview();

//   //   // Spells
//   //   context.availableSpellPoints = await this.object.getAvailableSpellPoints();
//   //   context.maxSpellPoints = await this.object.getMaxSpellPoints();
//   //   context.spells = this.spells.filter( spell => spell.system.magicType === this.magicType );
//   //   context.spellsBifurcated = context.spells.map(
//   //     spell => this.object.spells.has( spell.uuid ) ? [ null, spell ] : [ spell, null ]
//   //   );
//   //   context.spellsByCircle = context.spellsBifurcated?.reduce( ( acc, spellTuple ) => {
//   //     const { system: { level } } = spellTuple[0] ?? spellTuple[1];
//   //     acc[level] ??= [];
//   //     acc[level].push( spellTuple );
//   //     return acc;
//   //   }, {} );

//   //   // Dialog Config
//   //   context.hasNextStep = this._hasNextStep();
//   //   context.hasNoNextStep = !context.hasNextStep;
//   //   context.hasPreviousStep = this._hasPreviousStep();
//   //   context.hasNoPreviousStep = !context.hasPreviousStep;

//   //   return context;
//   // }

//   // async _updateObject( event, formData ) {
//   //   const data = foundry.utils.expandObject( formData );

//   //   data.namegiver ??= null;

//   //   // Reset selected class if class type changed
//   //   if ( data.isAdept !== this.object.isAdept ) data.selectedClass = null;

//   //   // Set class specifics
//   //   if ( data.selectedClass ) {
//   //     this.object.classAbilities = await fromUuid( data.selectedClass );
//   //   }

//   //   // process selected class option ability
//   //   if ( data.abilityOption ) this.object.abilityOption = data.abilityOption;

//   //   // Check the maximum selectable number of languages by comparing the array length
//   //   // of the selected languages with the rank of the corresponding language skill
//   //   // always use the stored ranks, since we never have a rank assignment in `_updateObject`
//   //   const languageSkillRanks = await this.object.getLanguageSkillRanks();
//   //   if ( data.languages.speak.length > languageSkillRanks.speak ) {
//   //     delete data.languages.speak;
//   //     ui.notifications.warn( game.i18n.format( "X.Can only choose X languages to speak (your rank in that skill." ) );
//   //   }
//   //   if ( data.languages.readWrite.length > languageSkillRanks.readWrite ) {
//   //     delete data.languages.readWrite;
//   //     ui.notifications.warn( game.i18n.format( "X.Can only choose X languages to read / write (your rank in that skill." ) );
//   //   }
//   //   if ( foundry.utils.isEmpty( data.languages ) ) delete data.languages;

//   //   this.object.updateSource( data );

//   //   // wait for the update, so we can use the data models method
//   //   this.magicType = await this.object.getMagicType();

//   //   // Re-render sheet with updated values
//   //   this.render();
//   // }

//   // /** @inheritDoc */
//   // async close( options = {} ) {
//   //   this.resolve?.( null );
//   //   return super.close( options );
//   // }

//   // async _finishGeneration( event ) {
//   //   event.preventDefault();
//   //   event.stopPropagation();
//   //   event.stopImmediatePropagation();

//   //   if ( !this._validateCompletion() ) {
//   //     ui.notifications.error( game.i18n.localize( "X.No no no, You're not finished yet." ) );
//   //     return;
//   //   }

//   //   this.resolve?.( this.object );
//   //   return this.close();
//   // }

//   // _onChangeRank( event ) {
//   //   const abilityUuid = event.currentTarget.dataset.abilityUuid;
//   //   const abilityType = event.currentTarget.dataset.abilityType;
//   //   const changeType = event.currentTarget.dataset.changeType;
//   //   this.object.changeAbilityRank( abilityUuid, abilityType, changeType ).then( _ => this.render() );
//   // }

//   // _onChangeAttributeModifier( event ) {
//   //   const attribute = event.currentTarget.dataset.attribute;
//   //   const changeType = event.currentTarget.dataset.changeType;
//   //   this.object.changeAttributeModifier( attribute, changeType ).then( _ => this.render() );
//   // }

//   // _onReset( event ) {
//   //   const resetType = event.currentTarget.dataset.resetType;
//   //   this.object.resetPoints( resetType ).then( _ => this.render() );
//   // }

//   // _onSelectTalentOption( event ) {
//   //   event.currentTarget.querySelector( "input[type=\"radio\"]" ).click();
//   // }

//   // _onClickSpell( event ) {
//   //   const spellSelected = event.currentTarget.dataset.spellSelected;
//   //   let result;
//   //   if ( spellSelected === "false" ) {
//   //     // add the spell
//   //     result = this.object.addSpell( event.currentTarget.dataset.spellUuid );
//   //   } else if ( spellSelected === "true" ) {
//   //     // unselect the spell
//   //     result = this.object.removeSpell( event.currentTarget.dataset.spellUuid );
//   //   }
//   //   result.then( _ => this.render() );
//   // }

//   // _onChangeTab( event, tabs, active ) {
//   //   super._onChangeTab( event, tabs, active );
//   //   this._currentStep = this._steps.indexOf( active );
//   //   this.render();
//   // }

//   // first check completeness and then proceed
//   // _nextTab() {
//   //   if ( !this._hasNextStep() ) return;
//   //   // if ( !this._validateOnChangeTab() ) return;
//   //   this._currentStep++;
//   //   this.activateTab( this._steps[this._currentStep] );
//   //   this.render();
//   // }

//   // _previousTab() {
//   //   if ( !this._hasPreviousStep() ) return;
//   //   // if ( !this._validateOnChangeTab() ) return;
//   //   this._currentStep--;
//   //   this.activateTab( this._steps[this._currentStep] );
//   //   this.render();
//   // }

//   // _hasNextStep() {
//   //   return this._currentStep < this._steps.length - 1;
//   // }

//   // _hasPreviousStep() {
//   //   return this._currentStep > 0;
//   // }

//   // _validateOnChangeTab() {
//   //   let hasValidationError = false;
//   //   let errorMessage = "";
//   //   switch ( this._steps[this._currentStep] ) {
//   //     case "namegiver-tab":
//   //       hasValidationError = this._validateNamegiver();
//   //       errorMessage = this.constructor.errorMessages["noNamegiver"];
//   //       break;
//   //     case "class-tab":
//   //       hasValidationError = this._validateClass();
//   //       errorMessage = "";
//   //       break;
//   //     case "attribute-tab":
//   //       break;
//   //     case "spell-tab":
//   //       break;
//   //     case "skill-tab":
//   //       break;
//   //     case "equipment-tab":
//   //       break;
//   //   }

//   //   console.debug( "Validation error: ", hasValidationError, errorMessage );
//   // }

//   // _validateCompletion() {
//   //   const errorLevel = "error";
//   //   return this._validateNamegiver( errorLevel, true )
//   //     && this._validateClass( errorLevel, true )
//   //     && this._validateClassRanks( errorLevel, true )
//   //     // this._validateAttributes( "warn", true );
//   //     && this._validateSkills( errorLevel, true );
//   // }

//   // _validateNamegiver( errorLevel = "warn", displayNotification = false ) {
//   //   const hasNamegiver = !!this.object.namegiver;
//   //   if ( displayNotification ) {
//   //     if ( !hasNamegiver ) this._displayValidationError( errorLevel, "noNamegiver" );
//   //   }
//   //   return hasNamegiver;
//   // }

//   // _validateClass( errorLevel = "warn", displayNotification = false ) {
//   //   const hasClass = !!this.object.selectedClass;
//   //   if ( displayNotification ) {
//   //     if ( !hasClass ) this._displayValidationError( errorLevel, "noClass" );
//   //   }
//   //   return hasClass;
//   // }

//   // _validateClassRanks( errorLevel = "warn", displayNotification = false ) {
//   //   const hasRanks = this.object.availableRanks[this.object.isAdept ? "talent" : "devotion"] > 0;
//   //   if ( displayNotification ) {
//   //     if ( hasRanks ) this._displayValidationError( errorLevel, "talentRanksLeft" );
//   //   }
//   //   return !hasRanks;
//   // }

//   // _validateAttributes( errorLevel = "info", displayNotification = false ) {
//   //   const hasAttributePoints = this.object.availableAttributePoints > 0;
//   //   if ( displayNotification ) {
//   //     if ( hasAttributePoints ) this._displayValidationError( errorLevel, "attributes" );
//   //   }
//   //   return !hasAttributePoints;
//   // }

//   // _validateSkills( errorLevel = "warn", displayNotification = false ) {
//   //   const availableRanks = filterObject(
//   //     this.object.availableRanks,
//   //     ( [ key, _ ] ) => ![ "talent", "devotion" ].includes( key )
//   //   );
//   //   availableRanks[this.object.isAdept ? "devotion" : "talent"] = 0;
//   //   availableRanks["readWrite"] = 0;
//   //   availableRanks["speak"] = 0;
//   //   const hasRanks = Object.values( availableRanks ).some( value => value > 0 );
//   //   if ( displayNotification ) {
//   //     if ( hasRanks ) this._displayValidationError( errorLevel, "skillRanksLeft" );
//   //   }
//   //   return !hasRanks;
//   // }

//   // _displayValidationError( level, type ) {
//   //   ui.notifications[level]( game.i18n.format( this.constructor.errorMessages[type] ) );
//   // }
// }