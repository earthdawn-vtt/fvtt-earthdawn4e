import ED4E from "../../config/_module.mjs";
import ItemSheetEd from "./item-sheet.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Extend the basic ActorSheet with modifications
 */
export default class MaskItemSheetEd extends ItemSheetEd {

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
        const powerItems = await Promise.all(
          ( this.document.system.powerItems?.powers ?? [] ).map( async power => {
            const item = await fromUuid( power.uuid );
            if ( item ) {
              // Create enriched HTML link for the item
              const enrichedLink = await TextEditor.enrichHTML( `@UUID[${power.uuid}]{${item.name}}` );
              return {
                ...item,
                enrichedLink
              };
            }
            return null;
          } )
        );
        
        // Process maneuvers
        const maneuverItems = await Promise.all(
          ( this.document.system.powerItems?.maneuver ?? [] ).map( async maneuver => {
            const item = await fromUuid( maneuver.uuid );
            if ( item ) {
              // Create enriched HTML link for the item
              const enrichedLink = await TextEditor.enrichHTML( `@UUID[${maneuver.uuid}]{${item.name}}` );
              return {
                ...item,
                enrichedLink
              };
            }
            return null;
          } )
        );
        
        // Filter out any null values and assign to context
        context.powerItems = powerItems.filter( item => item !== null );
        context.maneuverItems = maneuverItems.filter( item => item !== null );
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

