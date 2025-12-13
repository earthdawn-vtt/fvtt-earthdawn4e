import DocumentCreateDialog from "../applications/global/document-creation.mjs";
import AdvancementLevelData from "../data/advancement/advancement-level.mjs";

/**
 * Extend the base Item class to implement additional system-specific logic.
 */
export default class ItemEd extends Item {

  // region Initialization

  /**
   * An object that tracks which tracks the changes to the data model which were applied by active effects
   * @type {object}
   */
  overrides = this.overrides ?? {};

  // endregion

  // region Static Properties

  /** @inheritDoc */
  static async createDialog( data = {}, { parent = null, pack = null, ...options } = {} ) {
    return DocumentCreateDialog.waitPrompt( data, { documentCls: Item, parent, pack, options } );
  }

  // endregion

  // region Properties

  /**
   * Retrieve the list of ActiveEffects that are currently applied to this Item.
   * @type {ActiveEffectData[]}
   */
  get appliedEffects() {
    return this.effects.filter( effect => effect.active );
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
    return this.appliedEffects.filter( effect => effect.active && effect.isTemporary );
  }

  /**
   * An array of ActiveEffect instances which are present on the Item which are permanent.
   * @type {ActiveEffectData[]}
   */
  get permanentEffects() {
    return this.appliedEffects.filter( effect => effect.active && effect.system?.permanent );
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

  // region Data Preparation

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects();
  }

  /**
   * Apply any transformations to the Item data which are caused by ActiveEffects.
   * This is taken from Foundry's Actor class.
   */
  applyActiveEffects() {

    // data preparation
    this.prepareDocumentDerivedData();

    // application
    const overrides = {};

    // Organize non-disabled effects by their application priority
    const changes = [];
    for ( const effect of this.allApplicableEffects() ) {
      if ( !effect.active ) continue;
      changes.push( ...effect.changes.map( change => {
        const c = foundry.utils.deepClone( change );
        c.effect = effect;
        c.priority = c.priority ?? ( c.mode * 10 );
        return c;
      } ) );
    }
    changes.sort( ( a, b ) => a.priority - b.priority );

    // Apply all changes
    for ( let change of changes ) {
      if( !change.key ) continue;
      const changes = change.effect.apply( this, change );
      Object.assign( overrides, changes );
    }

    // Expand the set of final overrides
    this.overrides = foundry.utils.expandObject( overrides );
  }

  /**
   * Only for data/fields that depend on information of embedded documents.
   * Apply transformations or derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   */
  prepareDocumentDerivedData() {
    if ( this.system.prepareDocumentDerivedData ) this.system.prepareDocumentDerivedData();
  }

  /**
   * Get all ActiveEffects that may apply to this Item.
   * This is taken from Foundry's Actor class.
   * Legacy Transferal does not apply here, it's always the new behavior.
   * @yields {ActiveEffect}
   * @returns {Generator<ActiveEffect, void, void>} All effects that may apply to this item.
   */
  *allApplicableEffects() {
    for ( const effect of this.effects ) {
      if ( !effect.transfer && !effect.system.transferToTarget ) yield effect;
    }
  }

  // endregion

  // region Effects

  // endregion

  // region Event Handlers

  /** @inheritDoc */
  _preCreateDescendantDocuments( parent, collection, data, options, userId ) {
    if ( collection === "effects" ) {
      const mappedData = data.map( effectData => {
        if ( !effectData.hasOwnProperty( "system" ) ) effectData.system = {};
        effectData.system.source = {
          documentOriginUuid: this.uuid,
          documentOriginType: this.type,
        };
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
    return super._onCreateDescendantDocuments( parent, collection, documents, data, options, userId );
  }

  /** @inheritDoc */
  // eslint-disable-next-line max-params
  _onUpdateDescendantDocuments( parent, collection, documents, data, options, userId ) {
    // If this is a grandchild Active Effect creation, call reset to re-prepare and apply active effects, then call
    // super which will invoke sheet re-rendering.
    if ( collection === "effects" ) this.reset();
    return super._onUpdateDescendantDocuments( parent, collection, documents, data, options, userId );
  }

  /** @inheritDoc */
  // eslint-disable-next-line max-params
  _onDeleteDescendantDocuments( parent, collection, documents, data, options, userId ) {
    // If this is a grandchild Active Effect creation, call reset to re-prepare and apply active effects, then call
    // super which will invoke sheet re-rendering.
    if ( collection === "effects" ) this.reset();
    return super._onDeleteDescendantDocuments( parent, collection, documents, data, options, userId );
  }

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

    // TODO: Add macro to folder if it exists, add user specific folder if not
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

}