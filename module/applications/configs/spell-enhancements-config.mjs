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
    actions: {
      addEnhancement:    this._onAddEnhancement,
      deleteEnhancement: this._onDeleteEnhancement,
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

  // region Getters

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

  // endregion

  // region Rendering

  /** @inheritDoc */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    newContext.item = newContext.document;
    newContext.extraSuccess = this.keyPath === "extraSuccess" ? this.enhancements : null;
    newContext.extraThreads = this.keyPath === "extraThreads" ? this.enhancements : null;
    newContext.keyPath = this.keyPath;
    newContext.enhancementsField = this.enhancementsField;
    newContext.availableEnhancements = Object.values( MetricData.TYPES );

    return newContext;
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {SpellEnhancementsConfig}
   */
  static async _onAddEnhancement( event, target ) {
    await this.document.system.addEnhancement( target.dataset.enhancementType, this.keyPath );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {SpellEnhancementsConfig}
   */
  static async _onDeleteEnhancement( event, target ) {
    await this.document.system.removeEnhancement( target.dataset.enhancementType, this.keyPath );
  }

  // endregion

}