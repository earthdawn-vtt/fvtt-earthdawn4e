import SystemDataModel from "./system-data-model.mjs";
import { callIfExists } from "../../utils.mjs";

const { TextEditor } = foundry.applications.ux;

/**
 * Variant of the SystemDataModel with support for rich item tooltips.
 */
export default class ItemDataModel extends SystemDataModel {

  /**
   * @typedef {SystemDataModelMetadata} ItemDataModelMetadata
   * @property {boolean} enchantable    Can this item be modified by enchantment effects?
   * @property {boolean} threadable     Can magic threads be woven to this item ?
   * @property {boolean} inventoryItem  Should this item be listed with an actor's inventory?
   * @property {number} inventoryOrder  Order this item appears in the actor's inventory, smaller numbers are earlier.
   * @property {boolean} singleton      Should only a single item of this type be allowed on an actor?
   */

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item"
  ];

  /** @type {ItemDataModelMetadata} */
  static metadata = Object.freeze( foundry.utils.mergeObject( super.metadata, {
    enchantable:    false,
    hasLinkedItems: false,
    inventoryItem:  false,
    inventoryOrder: Infinity,
    singleton:      false,
    threadable:     false
  }, {
    inplace: false
  } ) );

  /**
   * The handlebars template for rendering item tooltips.
   * @type {string}
   */
  static ITEM_TOOLTIP_TEMPLATE = "systems/ed4e/templates/item/item-partials/item-tooltip.hbs";

  // endregion

  // region Getters

  /** @override */
  get embeddedDescriptionKeyPath() {
    return game.user.isGM || ( this.identified !== false ) ? "description.value" : "unidentified.description";
  }

  // endregion

  // region Data Preparation

  /** @inheritDoc */
  prepareBaseData() {
    if ( this.parent.isEmbedded ) {
      const sourceId = this.parent.flags.ed4e?.sourceId
        ?? this.parent._stats.compendiumSource
        ?? this.parent.flags.core?.sourceId;
      if ( sourceId ) this.parent.actor?.sourcedItems?.set( sourceId, this.parent );
    }
  }

  // endregion

  // region Drag and Drop

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
      knackManeuver: "_onDropKnack"
    };

    return callIfExists(
      this, functionMapping[document.type],
      event, document
    ) ?? true;
  }

  // endregion

  // region Rolling

  /**
   * See {@link Item#getRollData}
   * @returns {object} An object to evaluate rolls and {@link FormulaField}s against.
   */
  getRollData() {
    return {
      ...super.getRollData(),
      extras:         0,
      extraS:         0,
      extraSuccesses: 0,
    };
  }

  // endregion

  // region Methods

  /**
   * Render a rich tooltip for this item.
   * @param {EnrichmentOptions} [enrichmentOptions]   Options for text enrichment.
   * @returns {{content: string, classes: string[]}}  The tooltip HTML content and classes.
   */
  async richTooltip( enrichmentOptions = {} ) {
    return {
      content: await renderTemplate(
        this.constructor.ITEM_TOOLTIP_TEMPLATE, await this.getCardData( enrichmentOptions )
      ),
      classes: [ "earthdawn4e", "earthdawn4e-tooltip", "item-tooltip" ]
    };
  }

  /**
   * Prepare item card template data.
   * @param {EnrichmentOptions} enrichmentOptions Options for text enrichment.
   * @returns {Promise<object>}                   The template context data.
   */
  // eslint-disable-next-line complexity
  async getCardData( enrichmentOptions = {} ) {
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

  /**
   * Prepare type-specific data for the Item sheet.
   * @param {object} context  Sheet context data.
   * @returns {Promise<void>}
   */
  async getSheetData( context ) {
  }

  // endregion

}