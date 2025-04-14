import ED4E from "../../config/_module.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base document sheet on which all document configuration sheets should be based.
 */
export default class BaseConfigSheet extends HandlebarsApplicationMixin( DocumentSheetV2 ) {

  /** 
   * @inheritDoc 
   * @userFunction UF_BaseConfigSheet-defaultOptions
   */
  static DEFAULT_OPTIONS = {
    classes:     [ "config-sheet" ],
    sheetConfig: false,
    form:        {
      submitOnChange: true
    }
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