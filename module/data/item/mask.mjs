import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";
import MappingField from "../fields/mapping-field.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import * as ACTORS from "../../config/actors.mjs";

/**
 * @import { MaskSystemData } from "./_types.mjs";
 */

/**
 * Data model for mask items.
 * @augments {ItemDataModel<MaskSystemData>}
 * @mixes ItemDescriptionTemplate
 * @see {@link MaskSystemData} The system data model for mask items.
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
          required: true,
          initial:  0,
          integer:  true,
        } )
      } ), {
        initialKeys:     ACTORS.attributes,
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
            initial:  0,
            integer:  true,
          } ),
        } ), {
          initialKeys:     ACTORS.defense,
          initialKeysOnly: true,
        } ),
        armor: new MappingField( new fields.SchemaField( {
          value: new fields.NumberField( {
            initial:  0,
            integer:  true,
          } ) ,
        } ), {
          initialKeys:     ACTORS.armor,
          initialKeysOnly: true,
        } ),
        health: new fields.SchemaField( {
          death: new fields.NumberField( {
            initial:  0,
            integer:  true,
          } ),
          unconscious: new fields.NumberField( {
            initial:  0,
            integer:  true,
          } ),
          woundThreshold: new fields.NumberField( {
            initial:  0,
            integer:  true,
          } ),
        } ),
        recoveryTestsResource: new fields.SchemaField( {
          value: new fields.NumberField( {
            initial:  0,
            integer:  true,

          } ),
        } ),
      }, ),
      initiative: new fields.NumberField( {
        initial:  0,
        integer:  true,
      } ),
      damageStep: new fields.NumberField( {
        required: true,
        nullable: false,
        initial:  0,
        integer:  true,
      } ),
      attackStep: new fields.NumberField( {
        required: true,
        nullable: false,
        initial:  0,
        integer:  true,
      } ),
      actions: new fields.NumberField( {
        required: true,
        nullable: false,
        initial:  0,
        integer:  true,
      } ),
      knockdownStep: new fields.NumberField( {
        required: true,
        nullable: false,
        initial:  0,
        integer:  true,
      } ),
      challenge: new fields.SchemaField( {
        rate: new fields.NumberField( {
          required: true,
          nullable: false,
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
      type: SYSTEM_TYPES.Item.mask,
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
    if ( power.type !== SYSTEM_TYPES.Item.power ) {
      ui.notifications.error(
        _loc( "ED.Notifications.Error.maskAddNotAPower" ),
      );
      return;
    }

    if ( this.hasPower( power.uuid ) ) {
      ui.notifications.warn(
        _loc( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
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
    if ( power.type !== SYSTEM_TYPES.Item.maneuver ) {
      ui.notifications.error(
        _loc( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
      );
      return;
    }

    if ( !this.maneuvers.has( power.uuid ) ) {
      const newManeuvers = Array.from( this.maneuvers );
      newManeuvers.push( power.uuid );
      return this.parent.update( {"system.maneuvers": newManeuvers } );
    } else  {
      ui.notifications.warn(
        _loc( "ED.Notifications.Warn.maskAddAlreadyInMask" ),
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
    if ( ![ SYSTEM_TYPES.Item.power, SYSTEM_TYPES.Item.maneuver ].includes( itemType ) ) return;

    const isPower = itemType === SYSTEM_TYPES.Item.power;
    const oldData = isPower ? this.powers : this.maneuvers;

    if ( isPower && this.hasPower( itemUuid ) ) {
      return this.parentDocument.update( {
        [ `system.powers.${ foundry.utils.parseUuid( itemUuid )?.id }` ]: _del,
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