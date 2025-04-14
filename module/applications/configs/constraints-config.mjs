import BaseConfigSheet from "./base-config-sheet.mjs";
import { ConstraintData } from "../../data/common/restrict-require.mjs";

const { getProperty } = foundry.utils;

/**
 * Base application for configuring data fields that use {@link ConstraintData} and its subclasses.
 */
export default class ConstraintsConfig extends BaseConfigSheet {

  /** 
   * @inheritDoc 
   * @userFunction UF_ConstraintsConfig-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    classes: [ "constraints-config" ],
    window:  {
      title: "ED.Dialogs.Configs.Constraints.title",
    },
    form:    {
      handler: this.#onSubmitForm,
    },
    keyPath: null,
    type:    null,
  };

  /** 
   * @inheritDoc 
   * @userFunction UF_ConstraintsConfig-parts
   */
  static PARTS = {
    config: {
      template: "systems/ed4e/templates/configs/constraints-config.hbs",
    },
  };

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The data for the constraints field on the document's system property.
   * @type {object}
   * @userFunction UF_ConstraintsConfig-constraints
   */
  get constraints() {
    return getProperty( this.document.system, this.keyPath );
  }

  /**
   * The schema data field for the constraints field on the document's system property.
   * @type {DataField}
   * @userFunction UF_ConstraintsConfig-constraintsField
   */
  get constraintsField() {
    return this.document.system.schema.fields[ this.keyPath ];
  }

  /**
   * Path to the requirements or restrictions data on the document's system property.
   * E.g., "requirements" for the document type "knackAbility" system.requirements field.
   * @type {string}
   * @userFunction UF_ConstraintsConfig-keyPath
   */
  get keyPath() {
    return  this.options.keyPath ?? this.options.type;

  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** 
   * @inheritDoc 
   * @userFunction UF_ConstraintsConfig-preparePartContext
   */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    newContext.item = newContext.document;

    newContext.keyPath = this.keyPath;
    newContext.constraints = this.constraints;
    newContext.constraintsField = this.constraintsField;

    newContext.availableConstraints = Object.values( ConstraintData.TYPES );

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
   * @userFunction UF_ConstraintsConfig-onSubmitForm
   */
  static async #onSubmitForm( event, form, formData ) {
    const data = foundry.utils.expandObject( formData.object );

    const updates = Array.from(
      Object.values( this.constraints ),
      ( element, index ) => new this.constraints[ index ].constructor( data.system[ this.keyPath ][ index ] )
    );

    await this.document.update( {
      [ `system.${this.keyPath}` ]: updates,
    } );
  }
}