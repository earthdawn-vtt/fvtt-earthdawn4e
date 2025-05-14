import BaseConfigSheet from "./base-config-sheet.mjs";
import { MetricData } from "../../data/common/metrics.mjs";

const { getProperty } = foundry.utils;

/**
 * Base application for configuring data fields that use {@link MetricData} and its subclasses.
 */
export default class SpellEnhancementsConfig extends BaseConfigSheet {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: [ "spell-enhancements-config" ],
    window:  {
      title: "ED.Dialogs.Configs.SpellEnhancement.title",
    },
    form:    {
      handler: this.#onSubmitForm,
    },
    keyPath: null,
    type:    null,
  };

  /** @inheritDoc */
  static PARTS = {
    config: {
      template: "systems/ed4e/templates/configs/spell-enhancements-config.hbs",
    },
  };

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The data for the enhancements field on the document's system property.
   * @type {object}
   */
  get enhancements() {
    return getProperty( this.document.system, this.keyPath );
  }

  /**
   * The schema data field for the enhancements field on the document's system property.
   * @type {DataField}
   */
  get enhancementsField() {
    return this.document.system.schema.fields[ this.keyPath ];
  }

  /**
   * Path to the extraThreads or extraSuccess data on the document's system property.
   * E.g., "extraThreads" for the document type "spell" system.extraThreads field.
   * @type {string}
   */
  get keyPath() {
    return  this.options.keyPath ?? this.options.type;

  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    newContext.item = newContext.document;

    newContext.keyPath = this.keyPath;
    newContext.enhancements = this.enhancements;
    newContext.enhancementsField = this.enhancementsField;

    newContext.availableEnhancements = Object.values( MetricData.TYPES );

    return newContext;
  }

  /* -------------------------------------------- */
  /*  Form Submission                             */
  /* -------------------------------------------- */

  /**
   * Process form submission for the sheet
   * @this {DocumentSheetV2}
   * The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async #onSubmitForm( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );

    const updates = Array.from(
      Object.values( this.enhancements ),
      ( element, index ) => new this.enhancements[ index ].constructor( data.system[ this.keyPath ][ index ] )
    );

    await this.document.update( {
      [ `system.${this.keyPath}` ]: updates,
    } );
  }
}