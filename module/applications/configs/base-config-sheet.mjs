const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base document sheet on which all document configuration sheets should be based.
 */
export default class BaseConfigSheet extends HandlebarsApplicationMixin( DocumentSheetV2 ) {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes:     [ "config-sheet" ],
    sheetConfig: false,
    form:        {
      submitOnChange: true
    }
  };

}