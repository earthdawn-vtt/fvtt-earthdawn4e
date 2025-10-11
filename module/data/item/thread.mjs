import ItemDataModel from "../abstract/item-data-model.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import LpIncreaseTemplate from "./templates/lp-increase.mjs";

export default class ThreadData extends ItemDataModel.mixin(
  ItemDescriptionTemplate,
  LpIncreaseTemplate,
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      wovenToUuid: new fields.DocumentUUIDField( {} ),
      level:       new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        integer:  true,
        min:      0,
        initial:  0,
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.Thread",
  ];

  // endregion

  // region Rendering

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion

  // region Methods

  /**
   * Add an active effect to the thread or create a new one. There can always ever be only one active effect on
   * a thread.
   * @param {EarthdawnActiveEffect|object} [effect] The active effect to add
   * or the data for creating a new one.
   * @param {object} [options] Options for adding the active effect.
   * @param {boolean} [options.overwrite] Whether to overwrite an existing active effect.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The created active effect or undefined if no effect was added.
   */
  async addActiveEffect( effect = {}, options = { overwrite: false, } ) {
    const parentDocument = /** @type {ItemEd} */ this.parentDocument;
    if ( !parentDocument ) throw new Error( "Cannot add an active effect to a thread without parent document." );

    const existingEffect = parentDocument.effects[0];
    if ( existingEffect && !options.overwrite ) return;
    if ( existingEffect && options.overwrite ) await existingEffect.delete();

    const createdDocuments = await parentDocument.createEmbeddedDocuments(
      "ActiveEffect",
      [ effect.toObject?.() ?? effect, ],
    );
    return /** @type {EarthdawnActiveEffect|undefined} */ createdDocuments[0];
  }

  /**
   * Delete the active effect on this thread, if any.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The deleted active effect or undefined if no
   * effect was deleted.
   */
  async deleteActiveEffect() {
    const parentDocument = /** @type {ItemEd} */ this.parentDocument;
    if ( !parentDocument ) throw new Error( "Cannot delete an active effect from a thread without parent document." );

    const existingEffect = parentDocument.effects[0];
    if ( !existingEffect ) return;

    return existingEffect.delete();
  }

  // endregion

}