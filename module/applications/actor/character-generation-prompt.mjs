import { documentsToSelectChoices, filterObject, getAllDocuments } from "../../utils.mjs";
import ED4E from "../../config.mjs";
import CharacterGenerationData from "../../data/other/character-generation.mjs";
import ItemEd from "../../documents/item.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class CharacterGenerationPrompt extends HandlebarsApplicationMixin( ApplicationV2 ) {

  magicType;

  // #region CONSTRUCTOR
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

    this.availableAttributePoints = game.settings.get( "ed4e", "charGenAttributePoints" );

    this.edidLanguageSpeak = game.settings.get( "ed4e", "edidLanguageSpeak" );
    this.edidLanguageRW = game.settings.get( "ed4e", "edidLanguageRW" );

    this._steps = [
      "namegiver-tab",
      "class-tab",
      "attribute-tab",
      "spell-tab",
      "skill-tab",
      "language-tab",
      "equipment-tab",
    ];
    this._currentStep = 0;

    this.tabGroups = {
      primary: "namegiver-tab",
    };
  }
  // #region Error Messages
  static get errorMessages() {
    return {
      noNamegiver:         game.i18n.localize( "ED.Dialogs.CharGen.Errors.noNamegiver" ),
      noClass:             game.i18n.localize( "ED.Dialogs.CharGen.Errors.noClass" ),
      attributes:          game.i18n.localize( "ED.Dialogs.CharGen.Errors.attributes" ),
      talentRanksLeft:     game.i18n.localize( "ED.Dialogs.CharGen.Errors.talentRanksLeft" ),
      skillRanksLeft:      game.i18n.localize( "ED.Dialogs.CharGen.Errors.skillRanksLeft" ),
      notFinished:         game.i18n.localize( "ED.Dialogs.CharGen.Errors.notFinished" ),
      maxLanguagesToSpeak: game.i18n.localize( "ED.Dialogs.CharGen.Errors.maxLanguagesToSpeak" ),
      maxLanguagesToRead:  game.i18n.localize( "ED.Dialogs.CharGen.Errors.maxLanguagesToRead" ),
    };
  }

  // #region DEFAULT_OPTIONS
  static DEFAULT_OPTIONS = {
    id:      "character-generation-prompt",
    classes: [ "earthdawn4e", "character-generation" ],
    tag:     "form",
    window:  {
      frame:       true,
      icon:        "fa-thin fa-user",
      title:       "ED.Dialogs.Title.characterGeneration",
      resizable:   true,
      minimizable: true,
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
      selectEquipment: this._selectEquipment,
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

  /* ----------------------------------------------------------- */
  /* --------------------------  Parts  ------------------------ */
  /* ----------------------------------------------------------- */
  // #region PARTS
  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
      id:       "-tabs-navigation",
      classes:  [ "navigation" ],
    },
    "namegiver-tab": {
      template:   "systems/ed4e/templates/actor/generation/namegiver-selection.hbs",
      id:         "-namegiver-tab",
      classes:    [ "namegiver" ],
      scrollable: [ "" ],
    },
    "class-tab": {
      template:   "systems/ed4e/templates/actor/generation/class-selection.hbs",
      id:         "-class-tab",
      classes:    [ "class" ],
      scrollable: [ "" ],
    },
    "attribute-tab": {
      template:   "systems/ed4e/templates/actor/generation/attribute-assignment.hbs",
      id:         "-attribute-tab",
      classes:    [ "attribute" ],
      scrollable: [ "" ],
    },
    "spell-tab": {
      template:   "systems/ed4e/templates/actor/generation/spell-selection.hbs",
      id:         "-spell-tab",
      classes:    [ "spell" ],
      scrollable: [ "" ],
    },
    "skill-tab": {
      template:   "systems/ed4e/templates/actor/generation/skill-selection.hbs",
      id:         "-skill-tab",
      classes:    [ "skill" ],
      scrollable: [ "" ],
    },
    "language-tab": {
      template:   "systems/ed4e/templates/actor/generation/language-selection.hbs",
      id:         "-language-tab",
      classes:    [ "language" ],
      scrollable: [ "" ],
    },
    "equipment-tab": {
      template:   "systems/ed4e/templates/actor/generation/equipment.hbs",
      id:         "-equipment-tab",
      classes:    [ "equipment" ],
      scrollable: [ "" ],
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
      id:       "-footer",
      classes:  [ "flexrow" ],
    }
  };

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
  /* --------------------  _prepareContext  -------------------- */
  /* ----------------------------------------------------------- */

  // #region PREPARE CONTENT
  async _prepareContext( options = {} ) {
    const context = await super._prepareContext( options );
    context.config = ED4E;
    context.object = this.charGenData;
    context.options = options;

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
    context.spells = this.spells.filter( spell => spell.system.spellcastingType === this.magicType );
    context.spellsBifurcated = context.spells.map(
      spell => this.charGenData.spells.has( spell.uuid ) ? [ null, spell ] : [ spell, null ]
    );
    context.spellsByCircle = context.spellsBifurcated?.reduce( ( acc, spellTuple ) => {
      const { system: { level } } = spellTuple[0] ?? spellTuple[1];
      acc[level] ??= [];
      acc[level].push( spellTuple );
      return acc;
    }, {} );


    // Add equipment to the context
    context.equipment = {
      armor:     await this.charGenData.getEquipmentItems( "armor" ),
      equipment: await this.charGenData.getEquipmentItems( "equipment" ),
      shields:   await this.charGenData.getEquipmentItems( "shields" ),
      weapons:   await this.charGenData.getEquipmentItems( "weapons" ),
    };

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

  /* ----------------------------------------------------------- */
  /* -------------------  preparePartContext  ------------------ */
  /* ----------------------------------------------------------- */
  // #region _preparePartContext
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

  async _prepareTabsContext( context, _ ) {
    // make a deep copy to guarantee the css classes are always empty before setting it to active
    context.tabs = foundry.utils.deepClone( this.constructor.TABS );
    const tab = this.tabGroups.primary;
    context.tabs[tab].cssClass = "active";

    return context;
  }


  /* ----------------------------------------------------------- */
  /* -------------------  Tab Handling  ------------------------ */
  /* ----------------------------------------------------------- */
  async activateTab ( context, tabId ) {
    const tabGroup = "primary";
    for ( const tab of Object.values( this.constructor.TABS ) ) {
      tab.active = tab.id === tabId;
    }
    this.tabGroups[tabGroup] = tabId;
    if ( context?.tabs ) context.tabs[tabId].cssClass = "active";
  }

  /** @inheritDoc */
  changeTab( tab, group, {event, navElement, force=false, updatePosition=true}={} ) {
    super.changeTab( tab, group, {event, navElement, force, updatePosition} );

    // until we have a `_onChangeTab` method we need to do it here
    // check if the currentStep is still valid with the active tab
    // this is not the case if the tab was changed via the navigation, not the buttons
    this._currentStep = this._steps.indexOf( tab );
    this.render( { parts: [ "footer" ] } );
  }

  /* ----------------------------------------------------------- */
  /* --------------------------  Form  ------------------------- */
  /* ----------------------------------------------------------- */
  // region FORMSUBMISSION
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
      this.charGenData.classAbilities = await fromUuid( data.selectedClass );
    }

    // process selected class option ability
    if ( data.abilityOption ) this.charGenData.abilityOption = data.abilityOption;

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

    // Process selected equipment
    this.equipment = data.equipment ?? [];

    this.charGenData.updateSource( data );

    // wait for the update, so we can use the data models method
    this.magicType = await this.charGenData.getMagicType();

    // Re-render sheet with updated values
    this.render( true );
  }

  /* ----------------------------------------------------------- */
  /* ------------------------  Actions  ------------------------ */
  /* ----------------------------------------------------------- */
  // #region ACTIONS
  static _nextTab( _ ) {
    if ( !this._hasNextStep() ) return;

    // if ( !this._validateOnChangeTab() ) return;

    this._currentStep++;
    this.changeTab( this._steps[this._currentStep], "primary" );
  }

  static _previousTab( _ ) {
    if ( !this._hasPreviousStep() ) return;

    // if ( !this._validateOnChangeTab() ) return;

    this._currentStep--;
    this.changeTab( this._steps[this._currentStep], "primary" );
  }

  _hasNextStep() {
    return this._currentStep < this._steps.length - 1;
  }

  _hasPreviousStep() {
    return this._currentStep > 0;
  }

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

  _validateCompletion( errorLevel = "error" ) {
    return this._validateNamegiver( errorLevel, true )
      && this._validateClass( errorLevel, true )
      && this._validateClassRanks( errorLevel, true )
      // this._validateAttributes( "warn", true );
      && this._validateSkills( errorLevel, true );
  }

  _validateNamegiver( errorLevel = "warn", displayNotification = false ) {
    const hasNamegiver = !!this.charGenData.namegiver;
    if ( displayNotification ) {
      if ( !hasNamegiver ) this._displayValidationError( errorLevel, "noNamegiver" );
    }
    return hasNamegiver;
  }

  _validateClass( errorLevel = "warn", displayNotification = false ) {
    const hasClass = !!this.charGenData.selectedClass;
    if ( displayNotification ) {
      if ( !hasClass ) this._displayValidationError( errorLevel, "noClass" );
    }
    return hasClass;
  }

  _validateClassRanks( errorLevel = "warn", displayNotification = false ) {
    const hasRanks = this.charGenData.availableRanks[this.charGenData.isAdept ? "talent" : "devotion"] > 0;
    if ( displayNotification ) {
      if ( hasRanks ) this._displayValidationError( errorLevel, "talentRanksLeft" );
    }
    return !hasRanks;
  }

  _validateAttributes( errorLevel = "info", displayNotification = false ) {
    const hasAttributePoints = this.charGenData.availableAttributePoints > 0;
    if ( displayNotification ) {
      if ( hasAttributePoints ) this._displayValidationError( errorLevel, "attributes" );
    }
    return !hasAttributePoints;
  }

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

  _displayValidationError( level, type ) {
    if ( level ) ui.notifications[level]( game.i18n.format( this.constructor.errorMessages[type] ) );
  }

  static _onSelectTalentOption( _, target ) {
    target.querySelector( "input[type=\"radio\"]" ).click();
  }

  static _onChangeRank( _, target ) {
    const abilityUuid = target.dataset.abilityUuid;
    const abilityType = target.dataset.abilityType;
    const changeType = target.dataset.changeType;
    this.charGenData.changeAbilityRank( abilityUuid, abilityType, changeType ).then( _ => this.render() );
  }

  static _onChangeAttributeModifier( _, target ) {
    const attribute = target.dataset.attribute;
    const changeType = target.dataset.changeType;
    this.charGenData.changeAttributeModifier( attribute, changeType ).then( _ => this.render() );
  }

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

  static _selectEquipment( _, target ) {
    const equipmentUuid = target.dataset.uuid;
    if ( target.checked ) {
      this.charGenData.addEquipment( equipmentUuid );
    } else {
      this.charGenData.removeEquipment( equipmentUuid );
    }
    this.render();
  }
  
  static _onReset( _, target ) {
    const resetType = target.dataset.resetType;
    this.charGenData.resetPoints( resetType ).then( _ => this.render() );
  }

  /* ----------------------------------------------------------- */
  /* -----------------------  waitPrompt  ---------------------- */
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
}