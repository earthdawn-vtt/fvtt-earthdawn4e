const { TextEditor } = foundry.applications.ux;

/**
 * Taken from DnD5e ( https://github.com/foundryvtt/dnd5e )
 *
 * Data Model variant with some extra methods to support template mix-ins.
 *
 * **Note**: This uses some advanced Javascript techniques that are not necessary for most data models.
 * Please refer to the DND5E's system `BaseAdvancement` class for an example of a more typical usage.
 *
 * In template.json, each Actor or Item type can incorporate several templates which are chunks of data that are
 * common across all the types that use them. One way to represent them in the schema for a given Document type is to
 * duplicate schema definitions for the templates and write them directly into the Data Model for the Document type.
 * This works fine for small templates or systems that do not need many Document types but for more complex systems
 * this boilerplate can become prohibitive.
 *
 * Here we have opted to instead create a separate Data Model for each template available. These define their own
 * schemas which are then mixed-in to the final schema for the Document type's Data Model. A Document type Data Model
 * can define its own schema unique to it, and then add templates in direct correspondence to those in template.json
 * via SystemDataModel.mixin.
 */
export default class SystemDataModel extends foundry.abstract.TypeDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    "ED.Data.General",
  ];

  /**
   * System type that this system data model represents ( e.g. "character", "npc", "vehicle" ).
   * @type {string}
   */
  static _systemType;

  /* -------------------------------------------- */

  /**
   * Base templates used for construction.
   * @type {*[]}
   * @private
   */
  static _schemaTemplates = [];

  /* -------------------------------------------- */

  /**
   * The field names of the base templates used for construction.
   * @type {Set<string>}
   * @private
   */
  static get _schemaTemplateFields() {
    const fieldNames = Object.freeze( new Set( this._schemaTemplates.map( t => t.schema.keys() ).flat() ) );
    Object.defineProperty( this, "_schemaTemplateFields", {
      value:        fieldNames,
      writable:     false,
      configurable: false
    } );
    return fieldNames;
  }

  /* -------------------------------------------- */

  /**
   * A list of properties that should not be mixed-in to the final type.
   * @type {Set<string>}
   * @private
   */
  static _immiscible = new Set( [ "length", "mixed", "name", "prototype", "cleanData", "_cleanData",
    "_initializationOrder", "validateJoint", "_validateJoint", "migrateData", "_migrateData",
    "shimData", "_shimData", "defineSchema", "LOCALIZATION_PREFIXES" ] );

  /* -------------------------------------------- */

  /**
   * @typedef {object} SystemDataModelMetadata
   * @property {typeof DataModel} [systemFlagsModel]  Model that represents flags data within the ed4e namespace.
   */

  /**
   * Metadata that describes this DataModel.
   * @type {SystemDataModelMetadata}
   */
  static metadata = Object.freeze( {
    systemFlagsModel: null
  } );

  get metadata() {
    return this.constructor.metadata;
  }

  /* -------------------------------------------- */

  /*   /!**
   * Filters available for this item type when using the compendium browser.
   * @returns {CompendiumBrowserFilterDefinition}
   *!/
  static get compendiumBrowserFilters() {
    return new Map();
  } */

  /* -------------------------------------------- */

  /**
   * Key path to the description used for default embeds.
   * @type {string|null}
   */
  get embeddedDescriptionKeyPath() {
    return null;
  }

  /* -------------------------------------------- */

  /**
   * Get the actor that contains this data model or undefined if it is not embedded.
   * @type {ActorEd|undefined}
   */
  get containingActor() {
    if ( !this.parent ) return undefined;
    return this.parent.actor ?? this.parent.containingActor;
  }

  /**
   * Check if this data model is a descendent of an actor.
   * @type {boolean}
   */
  get isActorEmbedded() {
    if ( !this.parent ) return false;
    if ( this.parent.actor ) return true;
    return this.parent.isActorEmbedded ?? false;
  }

  /**
   * A reference to the parent Document of this data model, or undefined if one does not exist.
   * @type {Document|undefined}
   */
  get parentDocument() {
    if ( !this.parent ) return undefined;
    return this.parent instanceof foundry.abstract.Document ? this.parent : this.parent.parentDocument;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static defineSchema(  ) {
    const schema = {};
    for ( const template of this._schemaTemplates ) {
      if (  !template.defineSchema ) {
        throw new Error( `Invalid ed4e template mixin ${template} defined on class ${this.constructor}` );
      }
      this.mergeSchema( schema, template.defineSchema(  ) );
    }
    return schema;
  }

  /* -------------------------------------------- */

  /**
   * Merge two schema definitions together as well as possible.
   * @param {DataModel} a  First schema that forms the basis for the merge. *Will be mutated.*
   * @param {DataModel} b  Second schema that will be merged in, overwriting any non-mergeable properties.
   * @returns {DataModel}  Fully merged schema.
   */
  static mergeSchema( a, b ) {
    Object.assign( a, b );
    return a;
  }

  /* -------------------------------------------- */
  /*  Data Cleaning                               */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static cleanData( source, options ) {
    this._cleanData( source, options );
    return super.cleanData( source, options );
  }

  /* -------------------------------------------- */

  /**
   * Performs cleaning without calling DataModel.cleanData.
   * @param {object} [source]         The source data
   * @param {object} [options]     Additional options (see DataModel.cleanData)
   * @protected
   */
  static _cleanData( source, options ) {
    for ( const template of this._schemaTemplates ) {
      template._cleanData( source, options );
    }
  }

  /* -------------------------------------------- */
  /*  Data Initialization                         */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static *_initializationOrder() {
    for ( const template of this._schemaTemplates ) {
      for ( const entry of template._initializationOrder() ) {
        entry[1] = this.schema.get( entry[0] );
        yield entry;
      }
    }
    for ( const entry of this.schema.entries() ) {
      if ( this._schemaTemplateFields.has( entry[0] ) ) continue;
      yield entry;
    }
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /**
   * Pre-creation logic for this system data.
   * @param {object} data               The initial data object provided to the document creation request.
   * @param {object} options            Additional options which modify the creation request.
   * @param {User} user                 The User requesting the document creation.
   * @returns {Promise<boolean|void>}   A return value of false indicates the creation operation should be cancelled.
   * @see {Document#_preCreate}
   * @protected
   */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;
    const actor = this.parent?.actor;
    if ( ( actor?.type !== "character" ) || !this.metadata?.singleton ) return;
    if ( actor.itemTypes[data.type]?.length ) {
      ui.notifications.error( game.i18n.format( "ED.Notifications.Error.actorWarningSingleton", {
        itemType:  game.i18n.localize( CONFIG.Item.typeLabels[data.type] ),
        actorType: game.i18n.localize( CONFIG.Actor.typeLabels[actor.type] )
      } ) );
      return false;
    }
  }

  /* -------------------------------------------- */
  /*  Data Validation                             */
  /* -------------------------------------------- */

  /** @inheritdoc */
  validate( options={} ) {
    return super.validate( options );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static validateJoint( data ) {
    this._validateJoint( data );
    return super.validateJoint( data );
  }

  /* -------------------------------------------- */

  /**
   * Performs joint validation without calling DataModel.validateJoint.
   * @param {object} data     The source data
   * @throws                  An error if a validation failure is detected
   * @protected
   */
  static _validateJoint( data ) {
    for ( const template of this._schemaTemplates ) {
      template._validateJoint( data );
    }
  }


  // region Data Preparation


  _applySelectedActiveEffects( keys = [], { ignore = false } = {} ) {
    if ( !this.parent ) return;

    this.parent.statuses.clear();

    const changes = Array.from( this.parent.allApplicableEffects()
      .filter( effect => effect.active )
      .flatMap( effect => {
        effect.statuses.forEach( statusId => this.parent.statuses.add( statusId ) );
        return effect.changes.map( change => ( {
          ...foundry.utils.deepClone( change ),
          effect,
          priority: change.priority ?? ( change.mode * 10 )
        } ) );
      } ) )
      .sort( ( a, b ) => a.priority - b.priority );

    const overrides = changes.reduce( ( acc, change ) => {
      if ( keys.includes( change.key ) !== ignore ) {
        Object.assign( acc, change.effect.apply( this.parent, change ) );
      }
      return acc;
    }, {} );

    this.overrides = foundry.utils.expandObject( overrides );
  }

  /**
   * Called by {@link ActorEd#applyActiveEffects} after embedded document preparation,
   * but before active effects are applied.
   * Meant for data/fields that depend on information of embedded documents.
   * Apply transformations or derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   */
  prepareDocumentDerivedData() {}

  // endregion


  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData( source ) {
    this._migrateData( source );
    return super.migrateData( source );
  }

  /* -------------------------------------------- */

  /**
   * Performs migration without calling DataModel.migrateData.
   * @param {object} source     The source data
   * @protected
   */
  static _migrateData( source ) {
    for ( const template of this._schemaTemplates ) {
      template._migrateData( source );
    }
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static shimData( data, options ) {
    this._shimData( data, options );
    return super.shimData( data, options );
  }

  /* -------------------------------------------- */

  /**
   * Performs shimming without calling DataModel.shimData.
   * @param {object} data         The source data
   * @param {object} [options]    Additional options (see DataModel.shimData)
   * @protected
   */
  static _shimData( data, options ) {
    for ( const template of this._schemaTemplates ) {
      template._shimData( data, options );
    }
  }

  /* -------------------------------------------- */
  /*  Mixins                                      */
  /* -------------------------------------------- */

  /**
   * Mix multiple templates with the base type.
   * @param {...*} templates            Template classes to mix.
   * @returns {typeof SystemDataModel}  Final prepared type.
   */
  static mixin( ...templates ) {
    for ( const template of templates ) {
      if ( !( template.prototype instanceof SystemDataModel ) ) {
        throw new Error( `${template.name} is not a subclass of SystemDataModel` );
      }
    }

    // create a new empty base class to mix in all templates
    const Base = class extends this {};

    // add the immutable information which templates the new class is made of
    Object.defineProperty( Base, "_schemaTemplates", {
      value:        Object.seal( [ ...this._schemaTemplates, ...templates ] ),
      writable:     false,
      configurable: false
    } );

    // Special handling for LOCALIZATION_PREFIXES to ensure they're combined rather than overwritten
    const allPrefixes = new Set( [ ...( this.LOCALIZATION_PREFIXES || [] ) ] );

    for ( const template of templates ) {
      // take all static methods and fields from template and mix in to base class
      for ( const [ key, descriptor ] of Object.entries( Object.getOwnPropertyDescriptors( template ) ) ) {
        if ( this._immiscible.has( key ) ) continue;
        Object.defineProperty( Base, key, descriptor );
      }

      // Collect all localization prefixes for consolidation
      if ( template.LOCALIZATION_PREFIXES ) {
        template.LOCALIZATION_PREFIXES.forEach( prefix => allPrefixes.add( prefix ) );
      }

      // take all instance methods and fields from template and mix in to base class
      for ( const [ key, descriptor ] of Object.entries( Object.getOwnPropertyDescriptors( template.prototype ) ) ) {
        if (  [ "constructor" ].includes( key )  ) continue;
        Object.defineProperty( Base.prototype, key, descriptor );
      }
    }

    Object.defineProperty( Base, "LOCALIZATION_PREFIXES", {
      value:        [ ...allPrefixes ],
      writable:     true,
      configurable: true
    } );

    return Base;
  }

  /* -------------------------------------------- */

  /**
   * Test whether a SystemDataModel includes a certain template.
   * @param {SystemDataModel} template  The template to test.
   * @returns {boolean}                 True if the template is included, false otherwise.
   */
  static hasMixin( template ) {
    return this._schemaTemplates.includes( template ) || false;
  }

  /* -------------------------------------------- */

  /**
   * Test whether this SystemDataModel includes a certain template.
   * @param {SystemDataModel} template  The template to test.
   * @returns {boolean}                  True if the template is included, false otherwise.
   */
  hasMixin( template ) {
    return this.constructor.hasMixin( template );
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /** @override */
  async toEmbed( config, options={} ) {
    const keyPath = this.embeddedDescriptionKeyPath;
    if ( !keyPath || !foundry.utils.hasProperty( this, keyPath ) ) return null;
    const enriched = await TextEditor.enrichHTML( foundry.utils.getProperty( this, keyPath ), {
      ...options,
      relativeTo: this.parent
    } );
    const container = document.createElement( "div" );
    container.innerHTML = enriched;
    return container.children;
  }

  // region Macros

  /**
   * Get the default command for script macros of the containing item document.
   * @param {object} [options]  Additional options to modify the command.
   * @returns {string}                The default command for the macro.
   */
  getDefaultMacroCommand( options = {} ) {
    return `await foundry.applications.ui.Hotbar.toggleDocumentSheet("${this.parent.uuid}");`;
  }

  // endregion

}