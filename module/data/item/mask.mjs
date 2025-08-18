import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";

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
 * @property {number} combatBonuses.attackStepsBonus          attack steps modifications
 * @property {number} combatBonuses.damageStepsBonus          damage steps modification
 * @property {number} combatBonuses.knockDownStep             knock down step modifications
 * @property {number} combatBonuses.actions                   number of attacks
 * @property {number} combatBonuses.initiativeStep            initiative step modifications
 * @property {number} challengingRate           changes to the challenging rate
 * @property {object} powerItems                Object of powers and maneuvers
 * @property {object} powerItems.powers                    Object of powers
 * @property {object} powerItems.maneuvers                 Object of maneuvers
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
      attributes: new fields.SchemaField( {
        dexterityStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        strengthStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        toughnessStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        perceptionStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        willpowerStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        charismaStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      movement: new fields.SchemaField( {
        walk: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        fly: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        swim: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        burrow: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        climb: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      defenses: new fields.SchemaField( {
        physical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        mystical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        social: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
      } ),
      armor: new fields.SchemaField( {
        physical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        mystical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      healthBonuses: new fields.SchemaField( {
        deathThreshold: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        unconsciousThreshold: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        woundThreshold: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        recoveryTestsResource: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      combatBonuses: new fields.SchemaField( {
        attackStepsBonus: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        damageStepsBonus: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        initiativeStep: new fields.NumberField( {
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
      } ),
      challengingRate: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      powerItems: new fields.SchemaField( {
        powers: new fields.ArrayField(
          new fields.SchemaField( {
            uuid: new fields.DocumentUUIDField( {
              type: "Item"
            } ),
            edid: new fields.StringField( {
              required: true,
              nullable: false,
              initial:  "none"
            } ),
            bonus: new fields.NumberField( {
              required: true,
              nullable: false,
              initial:  0,
              integer:  true
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
        maneuver: new fields.ArrayField(
          new fields.SchemaField( {
            uuid: new fields.DocumentUUIDField( {
              type: "Item"
            } ),
            edid: new fields.StringField( {
              required: true,
              nullable: false,
              initial:  "none"
            } ),
          } ),
          {
            required: true,
            initial:  []
          }
        )
      } ),
    } );
  }

  // Methods

  /**
   * Adds a power to the mask.
   * @param {Item} power The power to add to the mask.
   * @returns {Promise<Item|undefined>} The updated mask item or undefined if the power was not added.
   */
  async addPowerToMask( power ) {
    if ( power.type !== "power" ) {
      ui.notifications.error(
        game.i18n.localize( "ED.Notifications.Error.maskAddNotAPower" ),
      );
      return;
    }

    let currentPowers = this.powerItems.powers;
    if ( currentPowers instanceof Set ) {
      currentPowers = Array.from( currentPowers ).map( uuid => ( {
        uuid:  uuid,
        bonus: 0,
        step:  0
      } ) );
    } else if ( !Array.isArray( currentPowers ) ) {
      currentPowers = [];
    }

    // Check if the power is already in the mask
    const existingPower = currentPowers.find( existingPower => existingPower.uuid === power.uuid );
    if ( existingPower ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
      );
      return;
    }

    // Add the power to the mask with default bonus and step values
    const newPowers = [ ...currentPowers, {
      uuid:  power.uuid,
      edid:  power.system.edid,
      bonus: 0,
      step:  0
    } ];

    return this.parent.update( {
      "system.powerItems.powers": newPowers,
    } );
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

    // Migrate old data format if needed
    let currentManeuvers = this.powerItems.maneuver;
    if ( currentManeuvers instanceof Set ) {
      // Convert old Set format to new Array format
      currentManeuvers = Array.from( currentManeuvers ).map( uuid => ( {
        uuid:  uuid,
      } ) );
    } else if ( !Array.isArray( currentManeuvers ) ) {
      currentManeuvers = [];
    }

    // Check if the maneuver is already in the mask
    const existingManeuver = currentManeuvers.find( existingManeuver => existingManeuver.uuid === power.uuid );
    if ( existingManeuver ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
      );
      return;
    }

    // Add the maneuver to the mask with default bonus and step values
    const newManeuvers = [ ...currentManeuvers, {
      uuid:  power.uuid,
      edid:  power.system.edid,
    } ];

    return this.parent.update( {
      "system.powerItems.maneuver": newManeuvers,
    } );
  }
}