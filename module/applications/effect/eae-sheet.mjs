import { getEdIds } from "../../settings.mjs";
import FormulaField from "../../data/fields/formula-field.mjs";
import ED4E from "../../config/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * Extend the basic ActiveEffectConfig class to add Earthdawn game system specific modifications
 * @augments {ActiveEffectConfig}
 */
export default class EarthdawnActiveEffectSheet extends ActiveEffectConfig {

  /** @inheritDoc */
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

  /** @inheritDoc */
  static PARTS = {
    ...ActiveEffectConfig.PARTS,
    details:   { template: "systems/ed4e/templates/effect/details.hbs" },
    duration:  { template: "systems/ed4e/templates/effect/duration.hbs" },
    changes:   { template: "systems/ed4e/templates/effect/changes.hbs" },
    execution: { template: "systems/ed4e/templates/effect/execution.hbs" },
  };

  /** @inheritDoc */
  static TABS = {
    ...ActiveEffectConfig.TABS,
    sheet: {
      ...ActiveEffectConfig.TABS.sheet,
      tabs: [
        ...ActiveEffectConfig.TABS.sheet.tabs,
        { id: "execution", icon: ED4E.icons.effectExecution },
      ],
    },
  };

  // region Properties

  /**
   * @type {FormInputConfig[]}
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

  /** @inheritDoc */
  _prepareSubmitData( event, form, formData ) {
    const submitData = super._prepareSubmitData( event, form, formData );
    submitData.duration = submitData.system.duration;
    // submitData.changes = this._prepareChangesSubmitData( submitData.system.changes );
    return submitData;
  }

  /** @inheritDoc */
  _processFormData( event, form, formData ) {
    const data = super._processFormData( event, form, formData );
    return this._toggleTransfer( event, data );
  }

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

  /** @inheritDoc */
  async _onRender( context, options ) {
    super._onRender( context, options );

    // ensure mutually exclusiveness for `system.transferToTarget` and `transfer` (to actor)
    // this.element.querySelector( "[name='system.transferToTarget']" ).addEventListener( "change", this._onTransferChange.bind( this ) );
  }

  async _prepareContext( options ) {
    const context = await super._prepareContext( options );

    context.systemFields = this.document.system.schema.fields;

    // filter out submit button
    context.buttons = context.buttons.filter( b => b.type !== "submit" );

    return context;
  }

  /** @inheritDoc */
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

  /** @inheritDoc */
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
   */
  static async #onExecute() {
    return this.document.system.execute();
  }

  // endregion

}