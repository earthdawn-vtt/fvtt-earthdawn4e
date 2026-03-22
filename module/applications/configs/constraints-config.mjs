import BaseConfigSheet from "./base-config-sheet.mjs";
import { ConstraintData } from "../../data/common/restrict-require.mjs";

const { getProperty } = foundry.utils;

/**
 * Base application for configuring data fields that use {@link ConstraintData} and its subclasses.
 */
export default class ConstraintsConfig extends BaseConfigSheet {

  // region Static Properties

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: [ "constraints-config" ],
    window:  {
      title: "ED.Dialogs.Configs.Constraints.title",
    },
    actions: {
      addConstraint:    this._onAddConstraint,
      deleteConstraint: this._onDeleteConstraint,
    },
    keyPath: null,
    type:    null,
  };

  /** @inheritDoc */
  static PARTS = {
    config: {
      template: "systems/ed4e/templates/configs/constraints-config.hbs",
    },
  };

  // endregion

  // region Getters

  /**
   * The data for the constraints field on the document's system property.
   * @type {object}
   */
  get constraints() {
    return getProperty( this.document.system, this.keyPath );
  }

  /**
   * The schema data field for the constraints field on the document's system property.
   * @type {DataField}
   */
  get constraintsField() {
    return this.document.system.schema.fields[ this.keyPath ];
  }

  /**
   * Path to the requirements or restrictions data on the document's system property.
   * E.g., "requirements" for the document type "knackAbility" system.requirements field.
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

    newContext.keyPath = this.keyPath;
    newContext.constraints = this.constraints;
    newContext.constraintsField = this.constraintsField;

    newContext.availableConstraints = Object.values( ConstraintData.TYPES );

    return newContext;
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {ConstraintsConfig}
   */
  static async _onAddConstraint( event, target ) {
    await this.document.system.addConstraint?.( target.dataset.constraintType, this.keyPath );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {ConstraintsConfig}
   */
  static async _onDeleteConstraint( event, target ) {
    await this.document.system.removeConstraint?.( target.dataset.constraintType, this.keyPath, target.dataset.storageKey );
  }

  // endregion
}