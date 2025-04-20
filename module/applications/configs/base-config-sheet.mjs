import ED4E from "../../config/_module.mjs";
import DocumentSheetMixinEd from "../api/document-sheet-mixin.mjs";

const { DocumentSheetV2, } = foundry.applications.api;

/**
 * Base document sheet on which all document configuration sheets should be based.
 */
export default class BaseConfigSheet extends DocumentSheetMixinEd( DocumentSheetV2 ) {

  /** 
   * @inheritDoc 
   * @userFunction UF_BaseConfigSheet-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    classes:     [ "config-sheet", ],
    sheetConfig: false,
  };

  /** 
   * @inheritDoc 
   * @userFunction UF_BaseConfigSheet-preparePartContext
   */
  async _preparePartContext( partId, context, options ) {
    const newContext = await super._preparePartContext( partId, context, options );

    if ( this.document ) {
      newContext.document = this.document;
      newContext.system = this.document.system;
      newContext.options = this.options;
      newContext.systemFields = this.document.system.schema.fields;
      newContext.config = ED4E;
    }

    return newContext;
  }

}