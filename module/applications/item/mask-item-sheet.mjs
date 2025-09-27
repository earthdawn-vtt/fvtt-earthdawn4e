import ED4E from "../../config/_module.mjs";
import { linkForUuid } from "../../utils.mjs";
import ItemSheetEd from "./item-sheet.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

export default class MaskItemSheetEd extends ItemSheetEd {

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes:  [ "mask" ],
    actions:  {
      deleteEmbeddedItem:   MaskItemSheetEd._deleteEmbeddedItem,         
    },
  };

  // region Static Properties

  /** @inheritDoc */
  static PARTS = {
    header: {
      template: "systems/ed4e/templates/item/item-partials/item-section-name.hbs",
      id:       "item-name",
      classes:  [ "item-name" ]
    },
    top: {
      template: "systems/ed4e/templates/item/item-partials/item-section-top.hbs",
      id:       "top",
      classes:  [ "top" ]
    },
    tabs: {
      template:   "templates/generic/tab-navigation.hbs",
      id:         "-tabs-navigation",
      classes:    [ "tabs-navigation" ],
      scrollable: [ "" ],
    },
    "general": {
      template: "systems/ed4e/templates/item/item-partials/item-description.hbs",
      classes:  [ "general", "scrollable" ]
    },
    "details": {
      template:   "systems/ed4e/templates/item/item-partials/item-details.hbs",
      classes:    [ "details", "scrollable" ],
      scrollable: [ "" ],
    },
    "effects": {
      template: "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs",
      classes:  [ "effects", "scrollable" ]
    },
  };

  /** @inheritDoc */
  static TABS = {
    sheet: {
      tabs:        [
        { id:    "general", },
        { id:    "details", },
        { id:    "effects", },
      ],
      initial:     "general",
      labelPrefix: "ED.Tabs.ItemSheet",
    },
  };

  // endregion

  // region Rendering

  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "header":
      case "top":
      case "tabs":
        break;
      case "general": {
        // Process powers
        const powers = await Promise.all(
          ( this.document.system.powers ?? [] ).map( async power => {
            const data = {...power};
            data.enrichedLink = await linkForUuid( power.uuid );
            return data;
          } )
        );
        
        // Process maneuvers
        const maneuvers = await Promise.all(
          ( this.document.system.maneuvers ?? [] ).map( async maneuver => {
            const data = {uuid: maneuver};
            data.enrichedLink = await linkForUuid( maneuver );
            return data;
          } )
        );
        
        // Filter out any null values and assign to context
        context.powerItems = powers;
        context.maneuverItems = maneuvers;
        break;
      }
      case "details":
        break;
      case "effects":
        break;
      case "thread":
        break;
    }
    return context;
  }

  /** @inheritdoc */
  async _prepareContext( options ) {
    const context = super._prepareContext( options );
    foundry.utils.mergeObject(
      context,
      {
        item:                   this.document,
        system:                 this.document.system,
        options:                this.options,
        systemFields:           this.document.system.schema.fields,
        config:                 ED4E,
        isGM:                   game.user.isGM,
      },
    );

    context.enrichedDescription = await TextEditor.enrichHTML(
      this.document.system.description.value,
      {
        // Only show secret blocks to owner
        secrets:  this.document.isOwner,
        // rollData: this.document.getRollData
      }
    );
    return context;
  }

  // endregion

  // region Event Handlers

  static async _deleteEmbeddedItem( event, target ) {
    const item = target.closest( ".embedded-item" );
    if ( item ) {
      await this.item.system.removeItemFromMask( item );
    } else return;
  } 
  

  // region Drag and Drop

  /** @inheritDoc */
  async _onDropItem( event, item ) {
    await super._onDropItem( event, item );

    let changed = false;

    if ( item.type === "power" ) {
      await this.item.system.addPowerToMask( item );
    }
    else if ( item.type === "maneuver" ) {
      await this.item.system.addManeuverToMask( item );
    }

    if ( changed ) await this.render();
  }
  // endregion
}

