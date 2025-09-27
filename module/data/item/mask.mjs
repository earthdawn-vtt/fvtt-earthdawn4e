import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import MappingField from "../fields/mapping-field.mjs";
import ED4E from "../../config/_module.mjs";
import { getSetting } from "../../settings.mjs";

/**
 * Data model template with information on mask items.
 * @property {object} attributes                  Attributes group object
 * @property {number} attributes.dexterityStep             dexterity step modifications
 * @property {number} attributes.strengthStep              strength step modifications
 * @property {number} attributes.toughnessStep             toughness step modifications
 * @property {number} attributes.perceptionStep            perception step modifications
 * @property {number} attributes.willpowerStep             willpower step modifications
 * @property {number} attributes.charismaStep              charisma step modifications
 * @property {object} movement                  movement group object
 * @property {number} movement.walk             movement type walk modifications
 * @property {number} movement.fly              movement type fly modifications
 * @property {number} movement.swim             movement type swim modifications
 * @property {number} movement.burrow           movement type burrow modifications
 * @property {number} movement.climb            movement type climb modifications
 * @property {object} defenses                  Defenses group object
 * @property {number} defenses.physical           physical defense modifications
 * @property {number} defenses.mystical           mystical defense modifications
 * @property {number} defenses.social            social defense modifications
 * @property {object} armor                     Armor group object
 * @property {number} armor.physical            physical armor modifications
 * @property {number} armor.mystical              mystic armor modifications
 * @property {object} healthBonuses               Health bonuses group object
 * @property {number} healthBonuses.recoveryTestsResource     recovery tests modifications
 * @property {number} healthBonuses.deathThreshold            death threshold modifications
 * @property {number} healthBonuses.unconsciousThreshold      unconscious threshold modifications
 * @property {number} healthBonuses.woundThreshold            wound threshold modifications
 * @property {object} combatBonuses              Combat bonuses group object
 * @property {number} combatBonuses.attackStep          attack steps modifications
 * @property {number} combatBonuses.damageStep          damage steps modification
 * @property {number} combatBonuses.knockDownStep             knock down step modifications
 * @property {number} combatBonuses.actions                   number of attacks
 * @property {number} combatBonuses.initiativeStep            initiative step modifications
 * @property {number} challengingRate           changes to the challenging rate
 * @property {object[]} powers                    Object of powers to be added to the mask target
 * @property {string} powers.uuid               UUID of the power item
 * @property {number} powers.step               Step of the power item
 * @property {object[]} maneuvers                 Object of maneuvers to be added to the mask target
 */
export default class MaskData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Mask",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      attributes: new MappingField( new fields.SchemaField( {
        step: new fields.NumberField( {
          min:      0,
          initial:  0,
          integer:  true,
        } )
      } ), {
        initialKeys:     ED4E.attributes,
        initialKeysOnly: true,
      } ),
      movement: new fields.SchemaField( {
        walk: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        fly: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        swim: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        burrow: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } ),
        climb: new fields.NumberField( {
          required: true,
          nullable: true,
          integer:  true,
        } )
      } ),
      characteristics: new fields.SchemaField( {
        defenses: new MappingField( new fields.SchemaField( {
          value: new fields.NumberField( {
            min:      0,
            initial:  0,
            integer:  true,
          } ),
        } ), {
          initialKeys:     [ "physical", "mystical", "social" ],
          initialKeysOnly: true,
        } ),
        armor: new MappingField( new fields.SchemaField( {
          value: new fields.NumberField( {
            min:      0,
            initial:  0,
            integer:  true,
          } ) ,
        } ), {
          initialKeys:     [ "physical", "mystical" ],
          initialKeysOnly: true,
        } ),
        health: new fields.SchemaField( {
          death: new fields.NumberField( {
            min:      0,
            initial:  0,
            integer:  true,
          } ),
          unconscious: new fields.NumberField( {
            min:      0,
            initial:  0,
            integer:  true,
          } ),
          woundThreshold: new fields.NumberField( {
            min:      0,
            initial:  0,
            integer:  true,
          } ),
        } ),
        recoveryTestsResource: new fields.SchemaField( {
          value: new fields.NumberField( {
            min:      0,
            initial:  0,
            integer:  true,

          } ),
        } ),
      }, ),
      initiative: new fields.NumberField( {
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      damageStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      attackStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      actions: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      knockDownStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      challenge: new fields.SchemaField( {
        rate: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
      } ),
      powers: new fields.ArrayField(
        new fields.SchemaField( {
          uuid: new fields.DocumentUUIDField( {
            type:     "Item",
            embedded: false
          } ),
          step: new fields.NumberField( {
            required: true,
            nullable: false,
            initial:  0,
            integer:  true
          } )
        } ),
        {
          required: true,
          initial:  []
        }
      ),
      maneuvers: new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
          embedded: false
        } ), {
          required:        true,
          initial:         [],
        } ),
    } );
  }

  // Methods

  /**
   * Adds a power to the mask.
   * @param {ItemEd} power The power to add to the mask.
   * @returns {Promise<ItemEd|undefined>} The updated mask item or undefined if the power was not added.
   */
  async addPowerToMask( power ) {
    if ( power.type !== "power" ) {
      ui.notifications.error(
        game.i18n.localize( "ED.Notifications.Error.maskAddNotAPower" ),
      );
      return;
    }

    if ( this.powers.some( entry => entry.uuid === power.uuid ) ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
      );
      return;
    } else {
      const newPowers = [
        ...this.powers,
        {
          uuid: power.uuid,
          step: 0,
        },
      ];
      return this.parent.update( {
        "system.powers": newPowers,
      } );
    }
  }

  /**
   * Adds a power to the mask.
   * @param {Item} power The power to add to the mask.
   * @returns {Promise<Item|undefined>} The updated mask item or undefined if the power was not added.
   */
  async addManeuverToMask( power ) {
    if ( power.type !== "maneuver" ) {
      ui.notifications.error(
        game.i18n.localize( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
      );
      return;
    }

    if ( !this.maneuvers.has( power.uuid ) ) {
      const newManeuvers = Array.from( this.maneuvers );
      newManeuvers.push( power.uuid );
      return this.parent.update( {"system.maneuvers": newManeuvers } );
    } else  {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
      );
      return;
    }
  }

  async removeItemFromMask( item, event = null ) {
    const itemType = item.dataset.type;
    console.log( "Item type: ", itemType );
    
    if ( itemType === "power" ) {
      const powerIndex = Number( item.dataset.index );
      console.log( "PowerIndex: ", powerIndex );
      if ( isNaN( powerIndex ) || powerIndex < 0 || !item ) return;

      if ( event && getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) {
      // Create a new array without the specified power
        const newPowers = [ ...this.powers ];
        newPowers.splice( powerIndex, 1 );
        return this.parent.update( {"system.powers": newPowers} );
      } 
  
      // Import the DialogEd class
      const DialogEd = ( await import( "../../applications/api/dialog.mjs" ) ).default;
      
      const type = `${game.i18n.localize( "ED.Dialogs.DeletePower.power" )}`;
      
      const content = `<h4>${game.i18n.localize( "AreYouSure" )}</h4>
                       <p>${game.i18n.format( "SIDEBAR.DeleteWarning", { type } )}</p>`;
      
      // Create buttons similar to other dialogs in PromptFactory
      const buttons = [
        {
          action:  "yes",
          label:   game.i18n.localize( "Yes" ),
          icon:    "fa-light fa-check",
          class:   "yes default",
          default: true
        },
        {
          action:  "no",
          label:   game.i18n.localize( "No" ),
          icon:    "fa-light fa-times",
          class:   "no button-cancel",
          default: false
        }
      ];
      
      // Use DialogEd.wait like in your PromptFactory
      const result = await DialogEd.wait( {
        id:       "delete-power-prompt",
        uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
        classes:  [ "earthdawn4e", "delete-power-prompt" ],
        window:   {
          title:       `${game.i18n.format( "DOCUMENT.Delete", { type } )}`,
          minimizable: false
        },
        content:     content,
        modal:       false,
        buttons:     buttons,
        rejectClose: false,
      
      } );
      
      // Handle the dialog result
      if ( result === "yes" ) {
      // Create a new array without the specified power
        const newPowers = [ ...this.powers ];
        newPowers.splice( powerIndex, 1 );
        return this.parent.update( {"system.powers": newPowers} );
      }
    } else if ( itemType === "maneuver" ) {
      const maneuverIndex = Number( item.dataset.index );
      console.log( "ManeuverIndex: ", maneuverIndex );
      if ( isNaN( maneuverIndex ) || maneuverIndex < 0 || !item ) return;

      if ( event && getSetting( "quickDeleteEmbeddedOnShiftClick" ) && event.shiftKey ) {
        // Create a new array without the specified maneuver
        const newManeuvers = Array.from( this.maneuvers );
        newManeuvers.splice( maneuverIndex, 1 );
        return this.parent.update( {"system.maneuvers": newManeuvers} );
      } 
  
      // Import the DialogEd class
      const DialogEd = ( await import( "../../applications/api/dialog.mjs" ) ).default;
      
      const type = `${game.i18n.localize( "ED.Dialogs.DeletePower.maneuver" )}`;
      
      const content = `<h4>${game.i18n.localize( "AreYouSure" )}</h4>
                       <p>${game.i18n.format( "SIDEBAR.DeleteWarning", { type } )}</p>`;
      
      // Create buttons similar to other dialogs in PromptFactory
      const buttons = [
        {
          action:  "yes",
          label:   game.i18n.localize( "Yes" ),
          icon:    "fa-light fa-check",
          class:   "yes default",
          default: true
        },
        {
          action:  "no",
          label:   game.i18n.localize( "No" ),
          icon:    "fa-light fa-times",
          class:   "no button-cancel",
          default: false
        }
      ];
      
      // Use DialogEd.wait like in your PromptFactory
      const result = await DialogEd.wait( {
        id:       "delete-maneuver-prompt",
        uniqueId: String( ++foundry.applications.api.ApplicationV2._appId ),
        classes:  [ "earthdawn4e", "delete-maneuver-prompt" ],
        window:   {
          title:       `${game.i18n.format( "DOCUMENT.Delete", { type } )}`,
          minimizable: false
        },
        content:     content,
        modal:       false,
        buttons:     buttons,
        rejectClose: false,
      } );
      
      // Handle the dialog result
      if ( result === "yes" ) {
        // Create a new array without the specified maneuver
        const newManeuvers = Array.from( this.maneuvers );
        newManeuvers.splice( maneuverIndex, 1 );
        return this.parent.update( {"system.maneuvers": newManeuvers} );
      }
    }
  }
}