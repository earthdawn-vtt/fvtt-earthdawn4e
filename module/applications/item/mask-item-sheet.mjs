import ED4E from "../../config/_module.mjs";
import { getSetting } from "../../settings.mjs";
import { linkForUuid } from "../../utils.mjs";
import ItemSheetEd from "./item-sheet.mjs";
import DialogEd from "../api/dialog.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

export default class MaskItemSheetEd extends ItemSheetEd {

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes:  [ SYSTEM_TYPES.Item.mask ],
    actions:  {
      deleteChild:        MaskItemSheetEd._onDeleteChild,
    },
  };

  // region Static Properties

  /** @inheritDoc */
  static PARTS = {
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
      template:   "systems/ed4e/templates/item/item-partials/item-description.hbs",
      classes:    [ "general", "scrollable" ],
      scrollable: [ "" ],
    },
    "details": {
      template:   "systems/ed4e/templates/item/item-partials/item-details.hbs",
      classes:    [ "details", "scrollable" ],
      scrollable: [ "" ],
    },
    "effects": {
      template:   "systems/ed4e/templates/item/item-partials/item-details/item-effects.hbs",
      classes:    [ "effects", "scrollable" ],
      scrollable: [ "", ],
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
          ( Object.values( this.document.system.powers ) ?? [] ).map( async power => {
            const data = {...power};
            data.id = foundry.utils.parseUuid( power.uuid )?.id;
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

  /**
   * Deletes a child document.
   * @param {Event} event - The event that triggered the form submission.
   * @param {HTMLElement} target - The HTML element that triggered the action.
   * @returns {Promise<foundry.abstract.Document>} - A promise that resolves when the child is deleted.
   */
  static async _onDeleteChild( event, target ) {
    if ( !( getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) ) {
      const confirmDelete = await DialogEd.confirm( {
        rejectClose: false,
        content:     `<p>${
          game.i18n.format(
            "ED.Dialogs.DeletePower.confirmRemove",
            { type: game.i18n.localize( `ED.Dialogs.DeletePower.${ target.dataset.type }` ) }
          )
        }</p>`,
      } );
      if ( !confirmDelete ) return;
    }

    await this.item.system.removeItemFromMask( target.dataset.uuid, target.dataset.type );
  }
  
  // endregion

  // region Drag and Drop

  /** @inheritDoc */
  async _onDropItem( event, item ) {
    await super._onDropItem( event, item );

    let changed = false;

    if ( item.type === SYSTEM_TYPES.Item.power ) {
      await this.item.system.addPowerToMask( item );
    }
    else if ( item.type === SYSTEM_TYPES.Item.maneuver ) {
      await this.item.system.addManeuverToMask( item );
    }

    if ( changed ) await this.render();
  }
  // endregion
}

