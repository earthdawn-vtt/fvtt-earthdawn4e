import { getEdIds } from "../../settings.mjs";
import FormulaField from "../../data/fields/formula-field.mjs";
import ED4E from "../../config/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * Extend the basic ActiveEffectConfig class to add Earthdawn game system specific modifications
 * @augments {ActiveEffectConfig}
 */
export default class EarthdawnActiveEffectSheet extends ActiveEffectConfig {

  /** 
   * @inheritDoc 
   * @userFunction UF_EarthdawnActiveEffectSheet-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: true,
      closeOnSubmit:  false,
    },
    actions: {
      addChange:     this.#onAddChange,
      deleteChange:  this.#onDeleteChange,
      execute:       this.#onExecute,
    },
  };

  /** 
   * @inheritDoc 
   * @userFunction UF_EarthdawnActiveEffectSheet-parts
   */
  static PARTS = {
    ...ActiveEffectConfig.PARTS,
    details:   { template: "systems/ed4e/templates/effect/details.hbs" },
    duration:  { template: "systems/ed4e/templates/effect/duration.hbs" },
    changes:   { template: "systems/ed4e/templates/effect/changes.hbs" },
    execution: { template: "systems/ed4e/templates/effect/execution.hbs" },
  };

  /** 
   * @inheritDoc 
   * @userFunction UF_EarthdawnActiveEffectSheet-tabs
   */
  static TABS = {
    ...ActiveEffectConfig.TABS,
    sheet: {
      ...ActiveEffectConfig.TABS.sheet,
      tabs: [
        ...ActiveEffectConfig.TABS.sheet.tabs,
        { id: "execution", icon: ED4E.icons.effectExecution },
      ],
    },
    labelPrefix: "ED.Sheet.Tabs",
  };

  // region Properties

  /**
   * @type {FormInputConfig[]}
   * @userFunction UF_EarthdawnActiveEffectSheet-keyOptions
   */
  get keyOptions() {
    if ( !this.document ) return [];
    if ( this.document.system.appliedToItem ) return ED4E.eaeChangeKeysItem;
    if ( this.document.system.appliedToActor ) return ED4E.eaeChangeKeysActor;
    return [ {
      value:    "",
      label:    game.i18n.localize( "ED4E.Data.placeholderBlankSelectOption" ),
      selected: true,
    } ];
  }

  // endregion

  // region Form Handling

  /** 
   * @inheritDoc 
   * @userFunction UF_EarthdawnActiveEffectSheet-prepareSubmitData
   */
  _prepareSubmitData( event, form, formData ) {
    const submitData = super._prepareSubmitData( event, form, formData );
    submitData.duration = submitData.system.duration;
    // submitData.changes = this._prepareChangesSubmitData( submitData.system.changes );
    return submitData;
  }

  /** 
   * @inheritDoc 
   * @userFunction UF_EarthdawnActiveEffectSheet-processFormData
   */
  _processFormData( event, form, formData ) {
    const data = super._processFormData( event, form, formData );
    return this._toggleTransfer( event, data );
  }

  /**
   * Prepares the changes data for submission by evaluating the formula fields.
   * @param {object[]} changes - The changes data to be prepared.
   * @returns {object[]} The prepared changes data with evaluated formulas.
   * @userFunction UF_EarthdawnActiveEffectSheet-prepareChangesSubmitData
   */
  _prepareChangesSubmitData( changes ) {
    return changes.map( change => {
      return {
        ...change,
        value: FormulaField.evaluate( change.value, this.document.system.formulaData, { warn: true } ),
      };
    } );
  }


  /**
   * Toggles the transfer property based on the changed property in the form.
   * @param {Event} event - The event that triggered the change.
   * @param {object} submitData - The data being submitted from the form.
   * @returns {object} The modified submitData with the toggled transfer property.
   * @userFunction UF_EarthdawnActiveEffectSheet-toggleTransfer
   */
  _toggleTransfer( event, submitData ) {
    const changedProperty = event?.target?.name;
    if ( changedProperty === "system.transferToTarget" && submitData.system?.transferToTarget === true )
      submitData.transfer = false;
    if ( changedProperty === "transfer" && submitData.transfer === true )
      submitData.system.transferToTarget = false;
    return submitData;
  }

  // endregion

  // region Rendering

  /** 
   * @inheritDoc 
   * @userFunction UF_EarthdawnActiveEffectSheet-onRender
   */
  async _onRender( context, options ) {
    super._onRender( context, options );

    // ensure mutually exclusiveness for `system.transferToTarget` and `transfer` (to actor)
    // this.element.querySelector( "[name='system.transferToTarget']" ).addEventListener( "change", this._onTransferChange.bind( this ) );
  }

  /**
   * @inheritdoc
   * @userFunction UF_EarthdawnActiveEffectSheet-prepareContext
   */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );

    context.systemFields = this.document.system.schema.fields;

    // filter out submit button
    context.buttons = context.buttons.filter( b => b.type !== "submit" );

    return context;
  }

  /** 
   * @inheritDoc 
   * @userFunction UF_EarthdawnActiveEffectSheet-preparePartContext
   */
  async _preparePartContext( partId, context ) {
    const partContext = await super._preparePartContext( partId, context );

    switch ( partId ) {
      case "details":
        if ( context.statuses ) {
          context.statuses.sort( ( a, b ) => a.label.localeCompare( b.label ) );

          const primaryStatus = CONFIG.ED4E.STATUS_CONDITIONS[ this.document.system.primary ];
          const effectLevels = primaryStatus?.levels;
          context.hasLevels = effectLevels > 0;
          if ( context.hasLevels ) context.levelInput = this.document.system.levelsToFormGroup();
        }
        break;
      case "duration":
        break;
      case "changes":
        partContext.keyOptions = this.keyOptions;
        partContext.edids = getEdIds();
        break;
      case "execution":
        break;
    }

    return partContext;
  }

  /**
   * Prepares the tabs for the effect sheet.
   * @param {string} group - The group name for the tabs.
   * @returns {object} The prepared tabs for the effect sheet. 
   * @userFunction UF_EarthdawnActiveEffectSheet-prepareTabs
   */
  _prepareTabs( group ) {
    // returns a new object, so can be modified without changing TABS
    const tabs = super._prepareTabs( group );
    const execInTabs = "execution" in tabs;
    const executable = this.document.system.executable;

    // remove execution tab if not executable
    // no need to check opposite, as the tab is always added in ApplicationV2
    if ( !executable && execInTabs ) delete tabs.execution;

    return tabs;
  }

  // endregion

  // region Event Handlers

  /**
   * Add a new change to the effect's changes array.
   * @this {ActiveEffectConfig}
   * @type {ApplicationClickAction}
   * @userFunction UF_EarthdawnActiveEffectSheet-onAddChange
   */
  static async #onAddChange() {
    const submitData = this._processFormData( null, this.form, new FormDataExtended( this.form ) );
    const systemChanges = Object.values( submitData.system.changes ) ?? [];
    systemChanges.push( {} );
    return this.submit( { updateData: { "system.changes": systemChanges } } );
  }

  /**
   * Delete a change from the effect's changes array.
   * @this {ActiveEffectConfig}
   * @type {ApplicationClickAction}
   * @userFunction UF_EarthdawnActiveEffectSheet-onDeleteChange
   */
  static async #onDeleteChange( event ) {
    const submitData = this._processFormData( null, this.form, new FormDataExtended( this.form ) );
    const changes = Object.values( submitData.system.changes );
    const row = event.target.closest( "li" );
    const index = Number( row.dataset.index ) || 0;
    changes.splice( index, 1 );
    return this.submit( { updateData: { system: { changes } } } );
  }

  /**
   * Execute the effect script, if available.
   * @this {ActiveEffectConfig}
   * @type {ApplicationClickAction}
   * @userFunction UF_EarthdawnActiveEffectSheet-onExecute
   */
  static async #onExecute() {
    return this.document.system.execute();
  }

  // endregion

}