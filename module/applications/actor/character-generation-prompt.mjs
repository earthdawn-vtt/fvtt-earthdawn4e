import { documentsToSelectChoices, filterObject, getAllDocuments } from "../../utils.mjs";
import ED4E, { LEGEND } from "../../config/_module.mjs";
import CharacterGenerationData from "../../data/other/character-generation.mjs";
import ItemEd from "../../documents/item.mjs";
import ApplicationEd from "../api/application.mjs";


export default class CharacterGenerationPrompt extends ApplicationEd {

  // region Static Properties

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    id:       "character-generation-prompt-{id}",
    uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
    classes:  [ "character-generation", ],
    window:   {
      frame:       false,
      positioned:  false,
      icon:        "fa-thin fa-user",
      title:       "ED.Dialogs.Title.characterGeneration",
      resizable:   true,
      minimizable: false,
    },
    actions: {
      next:            this._nextTab,
      previous:        this._previousTab,
      finish:          this._finishGeneration,
      talentOption:    this._onSelectTalentOption,
      decreaseAbility: this._onChangeRank,
      increaseAbility: this._onChangeRank,
      increase:        this._onChangeAttributeModifier,
      decrease:        this._onChangeAttributeModifier,
      changeSpell:     this._onClickSpell,
      reset:           this._onReset,
      selectEquipment: this._onSelectEquipment,
    },
    form:    {
      handler:        CharacterGenerationPrompt.#onFormSubmission,
      submitOnChange: true,
      submitOnClose:  false,
    },
    position: {
      width:  1000,
      top:    100,
      left:   100,
    }
  };

  /** @inheritdoc */
  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      id:       "-tabs-navigation",
      classes:  [ "navigation" ],
    },
    "namegiver": {
      template:   "systems/ed4e/templates/actor/generation/namegiver-selection.hbs",
      id:         "-namegiver",
      classes:    [ "namegiver" ],
      scrollable: [ "" ],
    },
    "classes": {
      template:   "systems/ed4e/templates/actor/generation/class-selection.hbs",
      id:         "-classes",
      classes:    [ "class" ],
      scrollable: [ "" ],
    },
    "attributes": {
      template:   "systems/ed4e/templates/actor/generation/attribute-assignment.hbs",
      id:         "-attributes",
      classes:    [ "attribute" ],
      scrollable: [ "" ],
    },
    "spells": {
      template:   "systems/ed4e/templates/actor/generation/spell-selection.hbs",
      id:         "-spells",
      classes:    [ "spell" ],
      scrollable: [ "" ],
    },
    "skills": {
      template:   "systems/ed4e/templates/actor/generation/skill-selection.hbs",
      id:         "-skills",
      classes:    [ "skill" ],
      scrollable: [ "" ],
    },
    "languages": {
      template:   "systems/ed4e/templates/actor/generation/language-selection.hbs",
      id:         "-languages",
      classes:    [ "language" ],
      scrollable: [ "" ],
    },
    "equipment": {
      template:   "systems/ed4e/templates/actor/generation/equipment-selection.hbs",
      id:         "-equipment",
      classes:    [ "equipment" ],
      scrollable: [ "" ],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      id:       "-footer",
      classes:  [ "flexrow" ],
    }
  };

  /** @inheritdoc */
  static TABS = {
    primary: {
      tabs: [
        { id:       "namegiver", },
        { id:       "classes", },
        { id:       "attributes", },
        { id:       "spells", },
        { id:       "skills", },
        { id:       "languages", },
        { id:       "equipment", },
      ],
      initial:     "namegiver",
      labelPrefix: "ED.Tabs.CharacterGeneration",
    },
  };

  /**
   * Error messages for character generation validation.
   * @type {Record<string, string>}
   */
  static ERROR_MESSAGES = {
    noNamegiver:         "ED.Dialogs.CharGen.Errors.noNamegiver",
    noClass:             "ED.Dialogs.CharGen.Errors.noClass",
    attributes:          "ED.Dialogs.CharGen.Errors.attributes",
    talentRanksLeft:     "ED.Dialogs.CharGen.Errors.talentRanksLeft",
    skillRanksLeft:      "ED.Dialogs.CharGen.Errors.skillRanksLeft",
    notFinished:         "ED.Dialogs.CharGen.Errors.notFinished",
    maxLanguagesToSpeak: "ED.Dialogs.CharGen.Errors.maxLanguagesToSpeak",
    maxLanguagesToRead:  "ED.Dialogs.CharGen.Errors.maxLanguagesToRead",
  };

  // endregion

  // region Static Methods

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
      equipment: {
        armor:     await this.getEquipmentItems( "armor" ),
        equipment: await this.getEquipmentItems( "equipment" ),
        shields:   await this.getEquipmentItems( "shield" ),
        weapons:   await this.getEquipmentItems( "weapon" ),
      }
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
          { system: { level: ED4E.availableRanks.speak, edid: edidLanguageSpeak, tier: "novice" }  },
          { inplace: false } ),
      );
      docCollections.skills.push( skillLanguageSpeak );
    }
    if ( !skillLanguageRW ) {
      skillLanguageRW = await ItemEd.create(
        foundry.utils.mergeObject(
          ED4E.documentData.Item.skill.languageRW,
          { system: { level: ED4E.availableRanks.readWrite, edid: edidLanguageRW, tier: "novice" } },
          { inplace: false } ),
      );
      docCollections.skills.push( skillLanguageRW );
    }

    data.updateSource( {
      abilities: {
        language: {
          [skillLanguageSpeak.uuid]: LEGEND.availableRanks.speak,
          [skillLanguageRW.uuid]:    LEGEND.availableRanks.readWrite,
        }
      }
    } );

    // create the prompt
    return new Promise( ( resolve ) => {
      options.resolve = resolve;
      new this( data, options, docCollections ).render( true, { focus: true } );
    } );
  }

  /**
   * Retrieves a list of equipment items of the specified type.
   * @param {string} type - The type of equipment to retrieve (e.g., "armor", "weapon").
   * @returns {Promise<Array>} A promise that resolves to an array of equipment items.
   */
  static async getEquipmentItems( type ) {
    const lang = game.i18n.lang;
    const items = [];
    const equipmentList = ED4E.startingEquipment;

    for ( const key in equipmentList ) {
      if ( equipmentList.hasOwnProperty( key ) ) {
        const item = equipmentList[key];
        const equipmentItem = await fromUuid( item.uuid[lang] || item.uuid["en"] ); // Fallback to English if language not found
        if ( equipmentItem?.type === type ) {
          items.push( equipmentItem );
        }
      }
    }
    return items;
  }

  // endregion

  // region Properties

  castingType;

  // endregion

  // region Constructor

  /** @inheritdoc */
  constructor( charGen, options = {}, documentCollections ) {
    const charGenData = charGen ?? new CharacterGenerationData();
    super( options );
    this.resolve = options.resolve;
    this.charGenData = charGenData;

    this.namegivers = documentCollections.namegivers;
    this.disciplines = documentCollections.disciplines;
    this.questors = documentCollections.questors;
    this.skills = documentCollections.skills;
    this.spells = documentCollections.spells;
    this.equipment = documentCollections.equipment;

    this.availableAttributePoints = game.settings.get( "ed4e", "charGenAttributePoints" );

    this.edidLanguageSpeak = game.settings.get( "ed4e", "edidLanguageSpeak" );
    this.edidLanguageRW = game.settings.get( "ed4e", "edidLanguageRW" );

    this._steps = [
      "namegiver",
      "classes",
      "attributes",
      "spells",
      "skills",
      "languages",
      "equipment",
    ];
    this._currentStep = 0;
  }

  // endregion

  // region Checkers

  /**
   * @returns {number} This function returns the number of the next step.
   */
  _hasNextStep() {
    return this._currentStep < this._steps.length - 1;
  }

  /**
   * @returns {boolean} This function returns true if there is a previous step.
   */
  _hasPreviousStep() {
    return this._currentStep > 0;
  }

  // endregion

  // region Validation

  /**
   * Validates the completion of the character generation process.
   * @param {string} errorLevel - The level of error to display (e.g., "warn", "error").
   * @returns {boolean} True if the character generation is complete, otherwise false.
   */
  _validateCompletion( errorLevel = "error" ) {
    return this._validateNamegiver( errorLevel, true )
      && this._validateClass( errorLevel, true )
      && this._validateClassRanks( errorLevel, true )
      // this._validateAttributes( "warn", true );
      && this._validateSkills( errorLevel, true );
  }

  /**
   * Validates whether a namegiver has been selected during character generation.
   * @param {string} errorLevel - The level of error to display (e.g., "warn", "error").
   * @param {boolean} displayNotification - Whether to display a notification if validation fails.
   * @returns {boolean} True if a namegiver is selected, otherwise false.
   */
  _validateNamegiver( errorLevel = "warn", displayNotification = false ) {
    const hasNamegiver = !!this.charGenData.namegiver;
    if ( displayNotification ) {
      if ( !hasNamegiver ) this._displayValidationError( errorLevel, "noNamegiver" );
    }
    return hasNamegiver;
  }

  /**
   * Validates whether a class has been selected during character generation.
   * @param {string} errorLevel - The level of error to display (e.g., "warn", "error").
   * @param {boolean} displayNotification - Whether to display a notification if validation fails.
   * @returns {boolean} True if a class is selected, otherwise false.
   */
  _validateClass( errorLevel = "warn", displayNotification = false ) {
    const hasClass = !!this.charGenData.selectedClass;
    if ( displayNotification ) {
      if ( !hasClass ) this._displayValidationError( errorLevel, "noClass" );
    }
    return hasClass;
  }

  /**
   * Validates whether the class ranks are properly assigned during character generation.
   * @param {string} errorLevel - The level of error to display (e.g., "warn", "error").
   * @param {boolean} displayNotification - Whether to display a notification if validation fails.
   * @returns {boolean} True if class ranks are valid, otherwise false.
   */
  _validateClassRanks( errorLevel = "warn", displayNotification = false ) {
    const hasRanks = this.charGenData.availableRanks[this.charGenData.isAdept ? "talent" : "devotion"] > 0;
    if ( displayNotification ) {
      if ( hasRanks ) this._displayValidationError( errorLevel, "talentRanksLeft" );
    }
    return !hasRanks;
  }

  /**
   * Validates whether all attribute points have been assigned during character generation.
   * @param {string} errorLevel - The level of error to display (e.g., "info", "warn").
   * @param {boolean} displayNotification - Whether to display a notification if validation fails.
   * @returns {boolean} True if all attribute points are assigned, otherwise false.
   */
  _validateAttributes( errorLevel = "info", displayNotification = false ) {
    const hasAttributePoints = this.charGenData.availableAttributePoints > 0;
    if ( displayNotification ) {
      if ( hasAttributePoints ) this._displayValidationError( errorLevel, "attributes" );
    }
    return !hasAttributePoints;
  }

  /**
   * Validates whether all skill ranks have been properly assigned during character generation.
   * @param {string} errorLevel - The level of error to display (e.g., "warn", "error").
   * @param {boolean} displayNotification - Whether to display a notification if validation fails.
   * @returns {boolean} True if all skill ranks are valid, otherwise false.
   */
  _validateSkills( errorLevel = "warn", displayNotification = false ) {
    const availableRanks = filterObject(
      this.charGenData.availableRanks,
      ( [ key, _ ] ) => ![ "talent", "devotion" ].includes( key )
    );
    availableRanks[this.charGenData.isAdept ? "devotion" : "talent"] = 0;
    availableRanks["readWrite"] = 0;
    availableRanks["speak"] = 0;
    const hasRanks = Object.values( availableRanks ).some( value => value > 0 );
    if ( displayNotification ) {
      if ( hasRanks ) this._displayValidationError( errorLevel, "skillRanksLeft" );
    }
    return !hasRanks;
  }

  /**
   * @param {string} level - The severity level of the validation error (e.g., "warn", "error").
   * @param {string} type - The type of equipment to retrieve (e.g., "armor", "weapon").
   */
  _displayValidationError( level, type ) {
    if ( level ) ui.notifications[level]( game.i18n.format( this.constructor.ERROR_MESSAGES[type] ) );
  }

  // endregion

  // region Rendering

  /** @inheritdoc */
  async _prepareContext( options = {} ) {
    const context = await super._prepareContext( options );
    context.config = ED4E;
    context.options = options;

    context.charGenData = this.charGenData;

    // Character generation data properties
    context.namegiver = this.charGenData.namegiver;
    context.isAdept = this.charGenData.isAdept;
    context.selectedClass = this.charGenData.selectedClass;
    context.attributes = this.charGenData.attributes;
    context.abilities = this.charGenData.abilities;
    context.availableRanks = this.charGenData.availableRanks;
    context.languages = this.charGenData.languages;
    context.schema = this.charGenData.schema;

    // Rules
    context.charGenRules = game.i18n.localize( "ED.Dialogs.CharGen.charGenRules" );
    context.chooseEquipmentRules = game.i18n.localize( "ED.Dialogs.CharGen.chooseEquipmentRules" );

    // Namegiver
    context.namegivers = this.namegivers;
    context.namegiverDocument = await this.charGenData.namegiverDocument;

    // Add namegiver abilities to the context
    context.namegiverAbilities = await this.charGenData.getNamegiverAbilities();

    // Class
    context.disciplines = this.disciplines;
    context.disciplineRadioChoices = documentsToSelectChoices( this.disciplines );
    context.questors = this.questors;
    context.questorRadioChoices = documentsToSelectChoices( this.questors );
    context.classDocument = await this.charGenData.classDocument;

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
    context.finalAttributeValues = await this.charGenData.getFinalAttributeValues();
    context.availableAttributePoints = this.charGenData.availableAttributePoints;
    context.maxAttributePoints = game.settings.get( "ed4e", "charGenAttributePoints" );
    context.previews = await this.charGenData.getCharacteristicsPreview();

    // Spells
    context.availableSpellPoints = await this.charGenData.getAvailableSpellPoints();
    context.maxSpellPoints = await this.charGenData.getMaxSpellPoints();
    context.spells = this.spells.filter( spell => spell.system.spellcastingType === this.castingType );
    context.spellsBifurcated = context.spells.map(
      spell => this.charGenData.spells.has( spell.uuid ) ? [ null, spell ] : [ spell, null ]
    );
    context.spellsByCircle = context.spellsBifurcated?.reduce( ( acc, spellTuple ) => {
      const { system: { level } } = spellTuple[0] ?? spellTuple[1];
      acc[level] ??= [];
      acc[level].push( spellTuple );
      return acc;
    }, {} );

    context.equipment = this.equipment;

    context.selectedEquipment = this.charGenData.equipment;

    // Dialog Config
    context.hasNextStep = this._hasNextStep();
    context.hasNoNextStep = !context.hasNextStep;
    context.hasPreviousStep = this._hasPreviousStep();
    context.hasNoPreviousStep = !context.hasPreviousStep;

    // Add buttons
    context.buttons = [ {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.cancel" ),
      cssClass: "cancel",
      icon:     `fas ${ED4E.icons.cancel}`,
      action:   "close",
    }, ];
    if ( context.hasPreviousStep ) context.buttons.push( {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.previousStep" ),
      cssClass: "previous",
      icon:     `fas ${ED4E.icons.previousCharGen}`,
      action:   "previous",
    } );
    if ( context.hasNextStep ) context.buttons.push( {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.nextStep" ),
      cssClass: "next",
      icon:     `fa-regular ${ED4E.icons.nextCharGen}`,
      action:   "next",
    } );
    context.buttons.push( {
      type:     "button",
      label:    game.i18n.localize( "ED.Dialogs.Buttons.finish" ),
      cssClass: "finish",
      icon:     `fa-regular ${ED4E.icons.finishCharGen}`,
      action:   "finish",
      disabled: !this._validateCompletion( "" ),
    }, );
    return context;
  }

  /** @inheritdoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );
    switch ( partId ) {
      case "tabs": break;
      case "namegiver":
        break;
      case "classes":
        break;
      case "attributes":
        break;
      case "spells":
        break;
      case "skills":
        break;
      case "languages":
        break;
      case "equipment":
        break;
    }

    return newContext;
  }

  // endregion

  // region Tabs

  /** @inheritdoc */
  changeTab( tab, group, {event, navElement, force=false, updatePosition=true}={} ) {
    super.changeTab( tab, group, {event, navElement, force, updatePosition} );

    // check if the currentStep is still valid with the active tab
    // this is not the case if the tab was changed via the navigation, not the buttons
    this._currentStep = this._steps.indexOf( tab );
    this.render( { parts: [ "footer" ] } );
  }

  // endregion

  // region Form Handling

  /**
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLFormElement} form - The HTML form element being submitted.
   * @param {object} formData - The data object containing form input values.
   */
  static async #onFormSubmission( event, form, formData ) {

    const data = foundry.utils.expandObject( formData.object );

    data.namegiver ??= null;

    // Set namegiver specifics
    if ( data.namegiver ) {
      this.charGenData.namegiverAbilities = await fromUuid( data.namegiver );
    }

    // Reset selected class if class type changed
    if ( data.isAdept !== this.charGenData.isAdept ) data.selectedClass = null;

    // Set class specifics
    if ( data.selectedClass ) {
      if ( this.charGenData.selectedClass ) {
        if ( data.selectedClass !== this.charGenData.selectedClass ) {   
          this.element.querySelector( "button#char-gen-clear-talent-ranks-button" ).click(); 
          this.charGenData.classAbilities = await fromUuid( data.selectedClass );
        } 
      } else {
        this.charGenData.classAbilities = await fromUuid( data.selectedClass );
      }
    }

    // process selected class option ability
    if ( data.abilityOption ) {
      const oldOptionLevel = Object.values( this.charGenData.abilities.optional )[0];
      this.resetOptionalPoints( oldOptionLevel );
      this.charGenData.abilityOption = data.abilityOption;
    }

    // Check the maximum selectable number of languages by comparing the array length
    // of the selected languages with the rank of the corresponding language skill
    // always use the stored ranks, since we never have a rank assignment in `_updateObject`
    const languageSkillRanks = await this.charGenData.getLanguageSkillRanks();
    if ( data.languages.speak.length > languageSkillRanks.speak ) {
      delete data.languages.speak;
      this._displayValidationError( "warn", "maxLanguagesToSpeak" );
    }
    if ( data.languages.readWrite.length > languageSkillRanks.readWrite ) {
      delete data.languages.readWrite;
      this._displayValidationError( "warn", "maxLanguagesToRead" );
    }
    if ( foundry.utils.isEmpty( data.languages ) ) delete data.languages;

    this.charGenData.updateSource( data );

    // wait for the update, so we can use the data models method
    this.castingType = await this.charGenData.getCastingType();

    // Re-render sheet with updated values
    this.render( true );
  }

  // endregion

  // region Event Handlers

  /**
   * @param {*} _ - Unused parameter.
   */
  static _nextTab( _ ) {
    if ( !this._hasNextStep() ) return;

    // if ( !this._validateOnChangeTab() ) return;

    this._currentStep++;
    this.changeTab( this._steps[this._currentStep], "primary" );
  }

  /**
   * @param {*} _ - Unused parameter.
   */
  static _previousTab( _ ) {
    if ( !this._hasPreviousStep() ) return;

    // if ( !this._validateOnChangeTab() ) return;

    this._currentStep--;
    this.changeTab( this._steps[this._currentStep], "primary" );
  }

  /**
   * Handles the finish generation event.
   * @param {Event} event - The event that triggered the finish generation process.
   * @returns {void} This function does not return a value.
   */
  static _finishGeneration( event ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if ( !this._validateCompletion() ) {
      this._displayValidationError( "error", "notFinished" );
      return;
    }

    this.resolve?.( this.charGenData );
    return this.close();
  }

  /**
   * @param {*} _ - Unused parameter.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   */
  static _onSelectTalentOption( _, target ) {
    target.querySelector( "input[type=\"radio\"]" ).click();
  }

  /**
   * @param {*} _ - Unused parameter.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   */
  static _onChangeRank( _, target ) {
    const abilityUuid = target.dataset.abilityUuid;
    const abilityType = target.dataset.abilityType;
    const changeType = target.dataset.changeType;
    this.charGenData.changeAbilityRank( abilityUuid, abilityType, changeType ).then( _ => this.render() );
  }

  /**
   * @param {*} _ - Unused parameter.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   */
  static _onChangeAttributeModifier( _, target ) {
    const attribute = target.dataset.attribute;
    const changeType = target.dataset.changeType;
    this.charGenData.changeAttributeModifier( attribute, changeType ).then( _ => this.render() );
  }

  /**
   * @param {*} _ - Unused parameter.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   */
  static _onClickSpell( _, target ) {
    const spellSelected = target.dataset.spellSelected;
    let result;
    if ( spellSelected === "false" ) {
      // add the spell
      result = this.charGenData.addSpell( target.dataset.spellUuid );
    } else if ( spellSelected === "true" ) {
      // unselect the spell
      result = this.charGenData.removeSpell( target.dataset.spellUuid );
    }
    result.then( _ => this.render() );
  }

  /**
   * @param {*} _ - Unused parameter.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   */
  static _onReset( _, target ) {
    const resetType = target.dataset.resetType;
    this.charGenData.resetPoints( resetType ).then( _ => this.render() );
  }

  /**
   * @param {*} _ - Unused parameter.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   */
  static _onSelectEquipment( _, target ) {
    const equipmentUuid = target.dataset.uuid;
    let result;
    if ( target.attr.checked ) {
      // add the equipment
      result = this.charGenData.addEquipment( equipmentUuid );
    } else {
      // unselect the equipment
      result = this.charGenData.removeEquipment( equipmentUuid );
    }
    result.then( _ => this.render );
  }

  // endregion

  // region Methods

  /**
   * Reset points spend on optional talents, e.g. when the optional talent is changed.
   * @param {number} oldOptionLevel - The previous level of the optional talent to reset points for.
   */
  resetOptionalPoints( oldOptionLevel ) {
    if ( !oldOptionLevel ) return;
    this.charGenData.updateSource( { availableRanks: { talent: this.charGenData.availableRanks.talent + oldOptionLevel } } );
  }

  // endregion

}