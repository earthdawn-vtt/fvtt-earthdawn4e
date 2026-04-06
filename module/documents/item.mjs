import DocumentCreateDialog from "../applications/global/document-creation.mjs";
import AdvancementLevelData from "../data/advancement/advancement-level.mjs";
import MigrationManager from "../services/migrations/migration-manager.mjs";

/**
 * Extend the base Item class to implement additional system-specific logic.
 */
export default class ItemEd extends Item {

  // region Static Properties

  /** @inheritDoc */
  static async createDialog( data = {}, { parent = null, pack = null, ...options } = {} ) {
    return DocumentCreateDialog.waitPrompt( data, { documentCls: Item, parent, pack, options } );
  }

  // endregion

  // region Initialization

  /** @inheritDoc */
  _configure( options={} ) {
    super._configure( options );
    /**
     * Track completed core ActiveEffect application phases as a backward compatibility measure for packages calling
     * Actor#applyActiveEffects without a phase argument.
     * @type {Set<string>}
     * @private
     */
    Object.defineProperty( this, "_completedActiveEffectPhases", {value: new Set()} );
  }

  // endregion

  // region Properties

  /**
   * An object that tracks which tracks the changes to the data model which were applied by active effects
   * @type {object}
   */
  overrides = this.overrides ?? {};

  // endregion

  // region Getters

  /**
   * Retrieve the list of ActiveEffects that are currently applied to this Item.
   * @type {ActiveEffectData[]}
   */
  get appliedEffects() {
    const effects = [];
    for ( const effect of this.allApplicableEffects() ) {
      if ( effect.active ) effects.push( effect );
    }
    return effects;
  }

  /**
   * A description of the transaction that is created when the item is learned, if applicable.
   * @type {string}
   */
  get lpLearningDescription() {
    return this.system.learnable
      ? game.i18n.format(
        "ED.Actor.LpTracking.Spendings.learningTransactionDescription",
        {
          itemName: this.name,
          itemType: game.i18n.localize( `TYPES.Item.${ this.type }` ),
        }
      )
      : "";
  }

  /**
   * An array of ActiveEffect instances which are present on the Item which have a limited duration.
   * @type {ActiveEffectData[]}
   */
  get temporaryEffects() {
    const effects = [];
    for ( const effect of this.allApplicableEffects() ) {
      if ( effect.active && effect.isTemporary ) effects.push( effect );
    }
    return effects;
  }

  /**
   * An array of ActiveEffect instances which are present on the Item which are permanent.
   * @type {ActiveEffectData[]}
   */
  get permanentEffects() {
    return this.appliedEffects.filter( effect => effect.active && effect.isPermanent );
  }

  /**
   * An array of ActiveEffect instances that are set to transfer to the target of this Item.
   * @type {ActiveEffectData[]}
   */
  get targetEffects() {
    const relevantEffects = this.effects.filter( effect => effect.system.transferToTarget );
    return relevantEffects.map( effect => {
      effect.system.source = {
        documentOriginUuid: effect.system.source.documentOriginUuid || this.uuid,
        documentOriginType: effect.system.source.documentOriginType || this.type,
      };
      return effect;
    } );
  }

  // endregion

  // region Life Cycle Events

  /** @inheritDoc */
  _onCreate( data, options, userId ) {
    super._onCreate( data, options, userId );
    foundry.documents.ActiveEffect.registry.addFromParent( this );
  }

  // endregion

  // region Data Preparation

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.applyActiveEffects( "final" );
  }

  /** @inheritDoc */
  prepareBaseData() {
    this._clearData();
  }

  /**
   * Clear or replace properties not automatically reset by upstream initialization.
   */
  _clearData() {
    this.overrides = {};
    this._completedActiveEffectPhases.clear();
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects( "initial" );
  }

  // endregion

  // region Effects

  /**
   * Apply any transformations to the Item data which are caused by ActiveEffects.
   * This is taken from Foundry's Actor class.
   * @param {string} phase The application phase under which changes are to be applied.
   * @see {foundry.documents.Actor#applyActiveEffects}
   */
  applyActiveEffects( phase ) {
    const ActiveEffect = foundry.documents.ActiveEffect.implementation;
    if ( !( phase in ActiveEffect.CHANGE_PHASES ) ) {
      const error = new Error( `"${phase}" is not a registered ActiveEffect application phase.` );
      Hooks.onError( "Item#applyActiveEffects", error, {log: "error"} );
    }
    if ( this._completedActiveEffectPhases.has( phase ) ) {
      const error = new Error( `ActiveEffect application phase "${phase}" has already completed and cannot be run again`
        + " in this Item's data-preparation cycle." );
      Hooks.onError( "Actor#applyActiveEffects", error, {log: "error"} );
      return;
    }
    this._completedActiveEffectPhases.add( phase );
    // no token changes to track here, so simpler than Actor application

    // organize non-disabled effects by their application priority
    const /** @type {ActiveEffectChangeData[]} */ changes = [];

    for ( const effect of this.allApplicableEffects() ) {
      if ( !effect.active ) continue;

      for ( const change of effect.system.changes ) {
        if ( ( change.key === "" ) || ( change.phase !== phase ) ) continue;

        const changeCopy = foundry.utils.deepClone( change );
        changeCopy.effect = effect;
        changes.push( changeCopy );
      }
    }

    changes.sort( ( a, b ) => a.priority - b.priority );
    ActiveEffect._shimChanges( changes );

    // apply all changes
    const overrides = {};
    const replacementData = this.getRollData();
    for ( const change of changes ) {
      const result = ActiveEffect.applyChange( this, change, { replacementData, } );
      if ( foundry.utils.isPlainObject( result ) ) Object.assign( overrides, result );
    }

    // expand the set of final overrides
    foundry.utils.mergeObject( this.overrides, foundry.utils.expandObject( overrides ) );
  }

  /**
   * Get all ActiveEffects that may apply to this Item.
   * This is taken from Foundry's Actor class.
   * @yields {ActiveEffect}
   * @returns {Generator<ActiveEffect, void, void>} All effects that may apply to this item.
   * @see {foundry.documents.Actor#allApplicableEffects}
   */
  *allApplicableEffects() {
    for ( const effect of this.effects ) {
      if ( effect.target?.uuid === this.uuid ) yield effect;
    }
  }

  /**
   * Workflows to perform following the update of ActiveEffect durations. This method is called for all users.
   * @param {ActiveEffect[]} effects Effects whose durations were updated
   * @param {string} event The identifier of the event that triggered the duration refresh
   * @param {object} [context] Additional contextual information associated with the duration refresh
   */
  async onUpdateEffectDurations( effects, event, context ) {}

  // endregion

  // region Event Handlers

  /** @inheritDoc */
  _preCreateDescendantDocuments( parent, collection, data, options, userId ) {
    if ( collection === "effects" ) {
      const mappedData = data.map( effectData => {
        effectData.origin ??= this.uuid;
        return effectData;
      } );
      return super._preCreateDescendantDocuments( parent, collection, mappedData, options, userId );
    }
    return super._preCreateDescendantDocuments( parent, collection, data, options, userId );
  }

  /** @inheritDoc */
  // eslint-disable-next-line max-params
  _onCreateDescendantDocuments( parent, collection, documents, data, options, userId ) {
    // If this is a grandchild Active Effect creation, call reset to re-prepare and apply active effects, then call
    // super which will invoke sheet re-rendering.
    if ( collection === "effects" ) this.reset();

    // Register created ActiveEffects
    const methodName = ( collection === "effects" ) ? "add" : "addFromParent";
    for ( const descendant of documents ) {
      foundry.documents.ActiveEffect.registry[methodName]( descendant );
    }

    super._onCreateDescendantDocuments( parent, collection, documents, data, options, userId );
    this._onEmbeddedDocumentChange();
  }

  /** @inheritDoc */
  // eslint-disable-next-line max-params
  _onUpdateDescendantDocuments( parent, collection, documents, changes, options, userId ) {
    // If this is a grandchild Active Effect creation, call reset to re-prepare and apply active effects, then call
    // super which will invoke sheet re-rendering.
    if ( collection === "effects" ) this.reset();

    // Register updated ActiveEffects
    const methodName = ( collection === "effects" ) ? "add" : "addFromParent";
    for ( const descendant of documents ) {
      foundry.documents.ActiveEffect.registry[methodName]( descendant );
    }

    super._onUpdateDescendantDocuments( parent, collection, documents, changes, options, userId );
    this._onEmbeddedDocumentChange();
  }

  /** @inheritDoc */
  // eslint-disable-next-line max-params
  _onDeleteDescendantDocuments( parent, collection, documents, ids, options, userId ) {
    // If this is a grandchild Active Effect creation, call reset to re-prepare and apply active effects, then call
    // super which will invoke sheet re-rendering.
    if ( collection === "effects" ) this.reset();

    super._onDeleteDescendantDocuments( parent, collection, documents, ids, options, userId );
    this._onEmbeddedDocumentChange();
  }

  /**
   * Additional workflows to perform when any descendant document within this Item changes.
   */
  _onEmbeddedDocumentChange() {}

  // endregion

  // region Macros

  /**
   * Convert this item into a macro.
   * @param {object} [options] Options to pass to the macro creation.
   * @returns {Promise<Macro>} The created macro.
   */
  async toMacro( options = {} ) {
    if ( !game.user.isGM && !this.isOwned ) {
      throw new Error( "ItemEd.toMacro: Only owned items can be converted to macros." );
    }

    const macroData = {
      name:       this.name,
      type:       CONST.MACRO_TYPES.SCRIPT,
      img:        this.img,
      command:    this.system.getDefaultMacroCommand( this ),
    };

    return CONFIG.Macro.documentClass.create( macroData, options );
  }

  // endregion

  // region Rolls

  /** @inheritDoc */
  getRollData() {
    let rollData = {
      ...super.getRollData(),
      extras:         0,
      extraS:         0,
      extraSuccesses: 0,
    };

    if ( this.system.getRollData instanceof Function ) Object.assign( rollData, this.system.getRollData() );

    rollData.flags = { ...this.flags };
    rollData.name = this.name;

    return rollData;
  }

  // endregion

  // region Earthdawn Methods

  /**
   * Update this items weight and name based on the given namegiver item. Uses the namegiver weight multiplier to
   * recalculate this item's weight. If successful, set a flag to indicate it's been calculated. Has to be unset
   * manually, otherwise another call of this function will not execute and instead display a warning.
   * @param {ItemEd} namegiver The namegiver whose name and weight multiplier should be used.
   * @returns {Promise<void>}
   */
  async tailorToNamegiver( namegiver ) {
    if ( this.isOwned && !this.system.weight.calculated && namegiver ) {
      const updateData = {
        "name":                           `${this.name} (${namegiver.name})`,
        "system.weight.value":            namegiver.system.weightMultiplier * this.system.weight.value,
        "system.weight.calculated":       true,
        "system.weight.multiplier":       namegiver.system.weightMultiplier,
      };
      await this.update( updateData );
      this.render( true );
    } else if ( this.system.weight.calculated ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cantUpdateItemWeight" ) );
    }
  }

  async addAdvancementAbilities( abilityUUID, poolType, level ) {
    let changes;
    if ( level ) {
      const levelIndex = level - 1 ;
      const levelModel = new AdvancementLevelData(
        this.system.advancement.levels[levelIndex].toObject()
      );
      const abilities = levelModel.abilities;
      const abilitiesPool = abilities[poolType];
      levelModel.updateSource( {
        abilities: {
          ...abilities,
          [poolType]: abilitiesPool.concat( abilityUUID ),
        },
      } );

      const newLevels = this.system.advancement.levels.toSpliced(
        levelIndex, 1, levelModel
      );
      changes = {
        "system.advancement.levels": newLevels,
      };
    } else {
      const abilitiesPool = this.system.advancement.abilityOptions[poolType];
      changes = {
        [`system.advancement.abilityOptions.${poolType}`]: abilitiesPool.concat( abilityUUID ),
      };
    }
    return this.update( changes );
  }

  async removeAdvancementAbility( abilityUUID, poolType, level ) {
    let changes;
    if ( level ) {
      const levelIndex = level - 1 ;
      const levelModel = new AdvancementLevelData(
        this.system.advancement.levels[levelIndex].toObject()
      );
      const abilities = levelModel.abilities;
      const abilitiesPool = abilities[poolType];
      const newPool = abilitiesPool.toSpliced(
        abilitiesPool.indexOf( abilityUUID ),1
      );
      levelModel.updateSource( {
        abilities: {
          ...abilities,
          [poolType]: newPool,
        },
      } );

      const newLevels = this.system.advancement.levels.toSpliced(
        levelIndex, 1, levelModel
      );
      changes = {
        "system.advancement.levels": newLevels,
      };
    } else {
      const abilitiesPool = this.system.advancement.abilityOptions[poolType];
      const newPool = abilitiesPool.toSpliced(
        abilitiesPool.indexOf( abilityUUID ), 1
      );
      changes = {
        [`system.advancement.abilityOptions.${poolType}`]: newPool,
      };
    }
    return this.update( changes );
  }

  // endregion

  // region Migrations
  static migrateData( source ) {
  // Skip migration for partial updates or non-complete documents
  // A complete document should have fundamental properties like name, type, etc.
    const isPartialUpdate = !source.name 
                          || !source.type 
                          || ( source.system && Object.keys( source.system ).length <= 2 );
                          
    // Skip if this looks like a partial update rather than a complete document
    if ( isPartialUpdate ) {
      return source;
    }

    // Step 1: Apply Foundry's core migration
    const newSource = super.migrateData( source );

    // Step 2: Apply our comprehensive migration system to the already-migrated source
    const migrationResult = MigrationManager.migrateDocument( newSource, "Item" );

    // Step 3: ALSO modify the original source...
    if ( migrationResult.system ) {
      source.system = migrationResult.system;
    }
    if ( migrationResult.type ) {
      source.type = migrationResult.type;
    }
    if ( migrationResult.img ) {
      source.img = migrationResult.img;
    }

    // Step 4: Return the final migrated result
    return migrationResult;
  }
  // endregion

}