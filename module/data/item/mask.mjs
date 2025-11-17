import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import MappingField from "../fields/mapping-field.mjs";
import ED4E from "../../config/_module.mjs";

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

  // region Schema

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
      powers: new fields.TypedObjectField(
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

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Mask",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: "mask",
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Checkers

  /**
   * Checks if the mask has a power with the given UUID.
   * @param {string} powerUuid The UUID of the power to check.
   * @returns {boolean} True if the mask has the power, false otherwise.
   */
  hasPower( powerUuid ) {
    return Object.values( this.powers ).some( power => power.uuid === powerUuid );
  }

  // endregion

  // region Methods

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

    if ( this.hasPower( power.uuid ) ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
      );
    } else {
      return this.parentDocument.update( {
        [`system.powers.${ power.id }`]: { uuid: power.uuid, },
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
    }
  }

  /**
   * Removes a power or maneuver from the mask.
   * @param {string} itemUuid The UUID of the item to remove from the mask
   * @param {string} itemType The type of the item to remove from the mask ("power" or "maneuver")
   * @returns {Promise<ItemEd|undefined>} The updated mask item or undefined if no action was taken
   */
  async removeItemFromMask( itemUuid, itemType ) {
    if ( ![ "power", "maneuver" ].includes( itemType ) ) return;

    const isPower = itemType === "power";
    const oldData = isPower ? this.powers : this.maneuvers;

    if ( isPower && this.hasPower( itemUuid ) ) {
      return this.parentDocument.update( {
        [ `system.powers.-=${ foundry.utils.parseUuid( itemUuid )?.id }` ]: null,
      } );
    }

    return this.parent.update( {
      [`system.${itemType}s`]: oldData.filter( entry => entry !== itemUuid )
    } );
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion

}