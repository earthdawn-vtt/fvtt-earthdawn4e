import { callIfExists } from "../utils.mjs";

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

  /**
   * A bound version of {@link getLocalizeKey}. Used to automatically get the
   * localization key of a data field label for this instances document type.
   * It is bound to call `getLocalizeKey` with the document type as its first
   * argument and `false` as the second argument.
   * @see getLocalizeKey
   * @param {string} name  The name of the field to get the label key for.
   * @type {Function}
   */
  static labelKey = getLocalizeKey.bind( this, "General", false );

  /**
   * A bound version of {@link getLocalizeKey}. Used to automatically get the
   * localization key of a data field hint for this instances document type.
   * It is bound to call `getLocalizeKey` with the document type as its first
   * argument and `true` as the second argument.
   * @see getLocalizeKey
   * @param {string} name  The name of the field to get the hint key for.
   * @type {Function}
   */
  static hintKey = getLocalizeKey.bind( this, "General", true );

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
    "shimData", "_shimData", "defineSchema" ] );

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

  get isActorEmbedded() {
    return !!this.parent?.actor;
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
    const actor = this.parent?.actor;
    if ( ( actor?.type !== "character" ) || !this.metadata?.singleton ) return;
    if ( actor.itemTypes[data.type]?.length ) {
      ui.notifications.error( game.i18n.format( "ED.Notifications.ActorWarningSingleton", {
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

    for ( const template of templates ) {
      // take all static methods and fields from template and mix in to base class
      for ( const [ key, descriptor ] of Object.entries( Object.getOwnPropertyDescriptors( template ) ) ) {
        if (  this._immiscible.has( key )  ) continue;
        Object.defineProperty( Base, key, descriptor );
      }

      // take all instance methods and fields from template and mix in to base class
      for ( const [ key, descriptor ] of Object.entries( Object.getOwnPropertyDescriptors( template.prototype ) ) ) {
        if (  [ "constructor" ].includes( key )  ) continue;
        Object.defineProperty( Base.prototype, key, descriptor );
      }
    }

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

  /**
   * Get the localization keys for the label or hint property of a {@link foundry.data.fields.DataField}.
   * @param {string}  documentType    The type of document of the data model, like "Actor", "Item", or "ActiveEffect".
   * @param {boolean}  hint           `True`, if the key is made for the `hint` field, otherwise for `label` field.
   * @param {string}  name            The final part of the localization key, the actual name.
   * @returns {string}                A localization key in the form of `ED.Data.<DocumentType>.<Labels|Hints>.<name>`.
   */
  static getLocalizeKey( documentType, hint, name ) {
    return `ED.Data.${documentType}.${hint ? "Hints" : "Labels"}.${name}`;
  }

}

/* -------------------------------------------- */

/**
 * Variant of the SystemDataModel with some extra actor-specific handling.
 */
export class ActorDataModel extends SystemDataModel {

  /** @inheritDoc */
  static labelKey = SystemDataModel.getLocalizeKey.bind( this, "Actor", false );

  /** @inheritDoc */
  static hintKey = SystemDataModel.getLocalizeKey.bind( this, "Actor", true );

  /**
   * @typedef {SystemDataModelMetadata} ActorDataModelMetadata
   * @property {boolean} supportsAdvancement  Can advancement be performed for this actor type?
   */

  /** @type {ActorDataModelMetadata} */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    supportsAdvancement: false
  }, {
    inplace: false
  } ) );

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @override */
  get embeddedDescriptionKeyPath() {
    return "description.value";
  }

  /* -------------------------------------------- */

  /**
   * Other actors that are available for currency transfers from this actor.
   * @type {ActorEd[]}
   */
  get transferDestinations() {
    const primaryParty = game.settings.get( "ed4e", "primaryParty" )?.actor;
    if ( !primaryParty?.system.members.ids.has( this.parent.id ) ) return [];
    const destinations = primaryParty.system.members.map( m => m.actor ).filter( a => a.isOwner && a !== this.parent );
    if ( primaryParty.isOwner ) destinations.unshift( primaryParty );
    return destinations;
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

}

/* -------------------------------------------- */

/**
 * Variant of the SystemDataModel with support for rich item tooltips.
 */
export class ItemDataModel extends SystemDataModel {

  /** @inheritDoc */
  static labelKey = SystemDataModel.getLocalizeKey.bind( this, "Item", false );

  /** @inheritDoc */
  static hintKey = SystemDataModel.getLocalizeKey.bind( this, "Item", true );

  /**
   * @typedef {SystemDataModelMetadata} ItemDataModelMetadata
   * @property {boolean} enchantable    Can this item be modified by enchantment effects?
   * @property {boolean} threadable     Can magic threads be woven to this item ?
   * @property {boolean} inventoryItem  Should this item be listed with an actor's inventory?
   * @property {number} inventoryOrder  Order this item appears in the actor's inventory, smaller numbers are earlier.
   * @property {boolean} singleton      Should only a single item of this type be allowed on an actor?
   */

  /** @type {ItemDataModelMetadata} */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    enchantable:    false,
    hasLinkedItems: false,
    inventoryItem:  false,
    inventoryOrder: Infinity,
    singleton:      false,
    threadable:     false,
  }, {
    inplace: false
  } ) );

  /**
   * The handlebars template for rendering item tooltips.
   * @type {string}
   */
  static ITEM_TOOLTIP_TEMPLATE = "systems/ed4e/templates/item/item-partials/item-tooltip.hbs";

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @override */
  get embeddedDescriptionKeyPath() {
    return game.user.isGM || ( this.identified !== false ) ? "description.value" : "unidentified.description";
  }

  get parentActor() {
    return this.parent?.actor;
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    if ( this.parent.isEmbedded ) {
      const sourceId = this.parent.flags.ed4e?.sourceId
        ?? this.parent._stats.compendiumSource
        ?? this.parent.flags.core?.sourceId;
      if ( sourceId ) this.parent.actor?.sourcedItems?.set( sourceId, this.parent );
    }
  }


  /* -------------------------------------------- */
  /*  Drop Events                                 */
  /* -------------------------------------------- */

  /**
   * Handle a dropped document on the ItemSheet belonging to this data models parent document.
   * @param {DragEvent} event         The initiating drop event
   * @param {Document} document       The resolved Document class
   * @returns {Promise<boolean>}      True if drop handling should continue, false if it should be cancelled.
   * @protected
   */
  _onDropDocument( event, document ) {
    const functionMapping = {
      devotion:      "_onDropDevotion",
      knackAbility:  "_onDropKnack",
      knackKarma:    "_onDropKnack",
      knackManeuver: "_onDropKnack",
    };

    return callIfExists(
      this, functionMapping[document.type],
      event, document
    ) ?? true;
  }


  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Render a rich tooltip for this item.
   * @param {EnrichmentOptions} [enrichmentOptions]   Options for text enrichment.
   * @returns {{content: string, classes: string[]}}  The tooltip HTML content and classes.
   */
  async richTooltip( enrichmentOptions={} ) {
    return {
      content: await renderTemplate(
        this.constructor.ITEM_TOOLTIP_TEMPLATE, await this.getCardData( enrichmentOptions )
      ),
      classes: [ "earthdawn4e", "earthdawn4e-tooltip", "item-tooltip" ]
    };
  }

  /* -------------------------------------------- */
  
  /**
   * Prepare item card template data.
   * @param {EnrichmentOptions} enrichmentOptions Options for text enrichment.
   * @returns {Promise<object>}                   The template context data.
   */
  async getCardData( enrichmentOptions={} ) {
    const { name, type, img } = this.parent;
    let {
      price, weight, uses, identified, unidentified, description, materials, activation
    } = this;
    const rollData = this.parent.getRollData();
    const isIdentified = identified !== false;
    const chat = isIdentified ? description.chat || description.value : unidentified?.description;
    description = game.user.isGM || isIdentified ? description.value : unidentified?.description;
    uses = this.hasLimitedUses && ( game.user.isGM || identified ) ? uses : null;
    price = game.user.isGM || identified ? price : null;

    const subtitle = [ this.type?.label ?? game.i18n.localize( CONFIG.Item.typeLabels[this.parent.type] ) ];
    const context = {
      name, type, img, price, weight, uses, materials, activation,
      config:       CONFIG.ED4E,
      controlHints: game.settings.get( "ed4e", "controlHints" ),
      labels:       foundry.utils.deepClone( this.parent.labels ),
      tags:         this.parent.labels?.components?.tags,
      subtitle:     subtitle.filterJoin( " &bull; " ),
      description:  {
        value: await TextEditor.enrichHTML( description ?? "", {
          rollData, relativeTo: this.parent, ...enrichmentOptions
        } ),
        chat: await TextEditor.enrichHTML( chat ?? "", {
          rollData, relativeTo: this.parent, ...enrichmentOptions
        } )
      }
    };

    context.properties = [];

    if ( game.user.isGM || isIdentified ) {
      context.properties.push(
        ...this.cardProperties ?? [],
        ...this.activatedEffectCardProperties ?? [],
        ...this.equippableItemCardProperties ?? []
      );
    }

    context.properties = context.properties.filter( _ => _ );
    context.hasProperties = context.tags?.length || context.properties.length;
    return context;
  }

  /* -------------------------------------------- */

  /**
   * Prepare type-specific data for the Item sheet.
   * @param {object} context  Sheet context data.
   * @returns {Promise<void>}
   */
  async getSheetData( context ) {}

}

/* -------------------------------------------- */

/**
 * Variant of the SystemDataModel with support for custom active effects.
 */
export class ActiveEffectDataModel extends SystemDataModel {

  /** @inheritDoc */
  static labelKey = SystemDataModel.getLocalizeKey.bind( this, "ActiveEffect", false );

  /** @inheritDoc */
  static hintKey = SystemDataModel.getLocalizeKey.bind( this, "ActiveEffect", true );

  /**
   * @typedef {SystemDataModelMetadata} ActiveEffectDataModelMetadata
   * @property {boolean} foo    This is just a test property
   */

  /** @type {ActiveEffectDataModelMetadata} */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    foo: false,
  }, {
    inplace: false,
  } ) );

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */
  
  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if ( this.parent.isEmbedded ) {
      const sourceId = this.parent.flags.ed4e?.sourceId
        ?? this.parent._stats.compendiumSource
        ?? this.parent.flags.core?.sourceId;
      if ( sourceId ) this.parent.actor?.sourcedEffects?.set( sourceId, this.parent );
    }
  }

}

/* -------------------------------------------- */

/**
 * Data Model variant that does not export fields with an `undefined` value during `toObject( true )`.
 */
export class SparseDataModel extends foundry.abstract.DataModel {

  /**
   * A bound version of {@link getLocalizeKey}. Used to automatically get the
   * localization key of a data field label for this instances document type.
   * It is bound to call `getLocalizeKey` with the document type as its first
   * argument and `false` as the second argument.
   * @see getLocalizeKey
   * @param {string} name  The name of the field to get the label key for.
   * @type {Function}
   */
  static labelKey = getLocalizeKey.bind( this, "Other", false );

  /**
   * A bound version of {@link getLocalizeKey}. Used to automatically get the
   * localization key of a data field hint for this instances document type.
   * It is bound to call `getLocalizeKey` with the document type as its first
   * argument and `true` as the second argument.
   * @see getLocalizeKey
   * @param {string} name  The name of the field to get the hint key for.
   * @type {Function}
   */
  static hintKey = getLocalizeKey.bind( this, "Other", true );

  /** @inheritDoc */
  toObject( source = true ) {
    if (  !source  ) return super.toObject( source );
    const clone = foundry.utils.flattenObject( this._source );
    // remove any undefined keys from the source data
    Object.keys( clone ).filter( k => clone[k] === undefined ).forEach( k => delete clone[k] );
    return foundry.utils.expandObject( clone );
  }

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

}

/* -------------------------------------------- */

/**
 * Get the localization keys for the label or hint property of a {@link foundry.data.fields.DataField}.
 * @param {string}  documentType    The type of document of the data model, like "Actor", "Item", or "ActiveEffect".
 * @param {boolean}  hint           `True`, if the key is made for the `hint` field, otherwise for `label` field.
 * @param {string}  name            The final part of the localization key, the actual name.
 * @returns {string}                A localization key in the form of `ED.Data.<DocumentType>.<Labels|Hints>.<name>`.
 */
export function getLocalizeKey( documentType, hint, name ) {
  return `ED.Data.${documentType}.${hint ? "Hints" : "Labels"}.${name}`;
}