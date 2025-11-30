/**
 * @template FormInputConfig
 * @typedef {FormInputConfig} SiblingDocumentFieldInputConfig
 * @property {Document} [parentDocument]   The parent document from which to retrieve sibling documents.
 */

/**
 * @typedef _SiblingDocumentFieldOptions
 * @property {string|string[]} [systemTypes=[]]   The allowed system types of the sibling document, e.g. "talent", "ability", etc.
 */

/**
 * @typedef {DataFieldOptions & _SiblingDocumentFieldOptions} SiblingDocumentFieldOptions
 */

import { isValidSystemType } from "../../utils.mjs";

/**
 * A ForeignDocumentField which references a sibling document within the same parent document.
 * @augments foundry.data.fields.ForeignDocumentField
 */
export default class SiblingDocumentField extends foundry.data.fields.ForeignDocumentField {

  /**
   * @param {typeof Document} model The foreign DataModel class definition which this field links to
   * @param {SiblingDocumentFieldOptions} options Options which configure the behavior of the field
   * @param {DataFieldContext} [context]      Additional context which describes the field
   */
  constructor( model, options={}, context={} ) {
    super( model, options, context );

    let systemTypes = options.systemTypes;
    if ( systemTypes ){
      systemTypes = [].concat( systemTypes );
      const isValid = systemTypes.every( type => isValidSystemType( type, model.documentName ) );
      if ( !isValid ) {
        throw new Error( `Invalid system type for document type "${ model.documentName }" provided to SiblingDocumentField: ${ options.systemTypes }` );
      }

      /**
       * The system type of the sibling document, e.g. "talent", "ability", etc.
       * @type {string[]}
       */
      this.systemTypes = systemTypes;
    }

  }

  /** @inheritDoc */
  static get _defaults() {
    return Object.assign( super._defaults, { idOnly: true, systemTypes: [] } );
  }

  /** @inheritDoc */
  _cast( value ) {
    if ( typeof value !== "string" ) return super._cast( value );
    if ( foundry.data.validators.isValidId( value ) ) return super._cast( value );

    const parsedUuid = foundry.utils.parseUuid( value );
    if ( parsedUuid.type !== this.model.documentName ) {
      throw new Error( `Invalid UUID for SiblingDocumentField: ${value}` );
    }

    return super._cast( parsedUuid.id );
  }

  /**
   * @inheritDoc
   * @param {SiblingDocumentFieldInputConfig} config Form element configuration parameters
   */
  _toInput( config ) {

    config.choices ??= config.parentDocument instanceof foundry.abstract.Document
      ? this.getChoices( config.parentDocument )
      : {};

    return super._toInput( config );
  }

  /**
   * Get the choices available for this sibling document field relative to the provided parent document.
   * @param {Document} parentDocument   The parent document from which to retrieve sibling documents.
   * @returns {Record<string, string>}   A mapping of document IDs to document names.
   */
  getChoices( parentDocument ) {
    const choices = {};
    for ( const doc of parentDocument[ this.model.collectionName ].values() ) {
      if ( this.systemTypes.length > 0 && !this.systemTypes.includes( doc.type ) ) continue;
      choices[ doc.id ] = doc.name;
    }
    return choices;
  }

}