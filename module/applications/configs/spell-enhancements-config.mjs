import BaseConfigSheet from "./base-config-sheet.mjs";
import ED4E from "../../config.mjs";

const { getProperty } = foundry.utils;

/**
 * Base application for configuring data fields that use {@link MetricData} and its subclasses.
 */
export default class SpellEnhancementsConfig extends BaseConfigSheet {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: [ "spell-enhancements-config" ],
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

    newContext.item = this.document;
    newContext.system = this.document.system;
    newContext.options = this.options;
    newContext.systemFields = this.document.system.schema.fields;
    newContext.config = ED4E;

    newContext.keyPath = this.keyPath;
    newContext.enhancements = getProperty( this.document.system, this.keyPath );
    newContext.enhancementsField = this.document.system.schema.fields[ this.keyPath ];

    return newContext;
  }
}