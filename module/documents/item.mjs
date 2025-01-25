import DocumentCreateDialog from "../applications/global/document-creation.mjs";
import AdvancementLevelData from "../data/advancement/advancement-level.mjs";

/**
 * Extend the base Item class to implement additional system-specific logic.
 */
export default class ItemEd extends Item {

  /** @inheritDoc */
  static async createDialog( data = {}, { parent = null, pack = null, ...options } = {} ) {
    return DocumentCreateDialog.waitPrompt( data, { documentCls: Item, parent, pack, options } );
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /**
   * Extended to apply active effects to the item.
   * @inheritDoc
   */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects();
  }

  applyActiveEffects() {
    const effects = this.effects.filter( e => !e.data.disabled );
    console.log ( `Not disabled ActiveEffects on Item ${this.name}:`, effects );
    // look in Actor#applyActiveEffects for how to apply effects

    // effects.forEach( e => e.applyToItem( this ) );
  }

  /* -------------------------------------------- */
  /*  Earthdawn Methods                           */
  /* -------------------------------------------- */

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
      ui.notifications.warn( game.i18n.localize( "X.cantUpdateItemWeight" ) );
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

}