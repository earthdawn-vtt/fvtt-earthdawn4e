import { ItemDataModel } from "../../abstract.mjs";
import TargetTemplate from "./targeting.mjs";
import ED4E from "../../../config/_module.mjs";
import ThreadTemplate from "./threads.mjs";
import MatrixData from "../../common/matrix.mjs";

/**
 * Data model template with information on physical items.
 * @property {object} price                                 price group object
 * @property {number} price.value                           item cost
 * @property {string} price.denomination                    denomination type of the cost
 * @property {number} weight                                item weight
 * @property {number} amount                                amount of the item
 * @property {number} bloodMagicDamage                      number of Bloodmagic damage the actor is receiving
 * @property {object} usableItem                            usable item object
 * @property {boolean} usableItem.isUsableItem        usable item selector
 * @property {number} usableItem.arbitraryStep              arbitrary step
 * @property {string} usableItem.action                     action type of usable item
 * @property {number} usableItem.recoveryPropertyValue      recovery type value
 */
export default class PhysicalItemTemplate extends ItemDataModel.mixin(
  TargetTemplate,
  ThreadTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.PhysicalItem",
  ];

  /**
   * The order in which this items status is cycled. Represents the default order.
   * Should be defined in the extending class, if different.
   * @type {[string]}
   * @protected
   */
  static _itemStatusOrder = [ "owned", "carried", "equipped" ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      price: new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          // label:    this.labelKey( "PhysicalItems.Price.value",
          // hint:     this.hintKey( "PhysicalItems.Price.value"
          label:    this.labelKey( "PhysicalItems.Price.value" ),
          hint:     this.hintKey( "PhysicalItems.Price.value" )
        } ),
        denomination: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          trim:     true,
          initial:  "silver",
          choices:  ED4E.denomination,
          label:    this.labelKey( "PhysicalItems.Price.denomination" ),
          hint:     this.hintKey( "PhysicalItems.Price.denomination" )
        } )
      },
      {
        label: this.labelKey( "PhysicalItems.price" ),
        hint:  this.hintKey( "PhysicalItems.price" )
      } ),
      weight: new fields.SchemaField( {
        value: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          label:    this.labelKey( "PhysicalItems.Weight.value" ),
          hint:     this.hintKey( "PhysicalItems.Weight.value" )
        } ),
        multiplier: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  1,
          label:    this.labelKey( "PhysicalItems.Weight.multiplier" ),
          hint:     this.hintKey( "PhysicalItems.Weight.multiplier" )
        } ),
        calculated: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    this.labelKey( "PhysicalItems.Weight.calculated" ),
          hint:     this.hintKey( "PhysicalItems.Weight.calculated" )
        } ),
      } ),
      availability: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        trim:     true,
        initial:  "average",
        choices:  ED4E.availability,
        label:    this.labelKey( "PhysicalItems.availability" ),
        hint:     this.hintKey( "PhysicalItems.availability" )

      } ),
      amount: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  1,
        integer:  true,
        label:    this.labelKey( "PhysicalItems.amount" ),
        hint:     this.hintKey( "PhysicalItems.amount" )
      } ),
      bloodMagicDamage: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "PhysicalItems.bloodMagicDamage" ),
        hint:     this.hintKey( "PhysicalItems.bloodMagicDamage" )
      } ),
      usableItem: new fields.SchemaField( {
        isUsableItem: new fields.BooleanField( {
          required: true,
          label:    this.labelKey( "PhysicalItems.UsableItem.selector" ),
          hint:     this.hintKey( "PhysicalItems.UsableItem.selector" )
        } ),
        arbitraryStep: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "PhysicalItems.UsableItem.arbitraryStep" ),
          hint:     this.hintKey( "PhysicalItems.UsableItem.arbitraryStep" )
        } ),
        action: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          choices:  ED4E.action,
          initial:  "standard",
          label:    this.labelKey( "PhysicalItems.UsableItem.action" ),
          hint:     this.hintKey( "PhysicalItems.UsableItem.action" )
        } ),
        // recovery property value shall be a drop down menu with several options discribed in #26
        recoveryPropertyValue: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          max:      5,
          initial:  0,
          choices:  ED4E.recoveryProperty,
          integer:  true,
          label:    this.labelKey( "PhysicalItems.UsableItem.recoveryPropertyValue" ),
          hint:     this.hintKey( "PhysicalItems.UsableItem.recoveryPropertyValue" )
        } ),
      },
      {
        label: this.labelKey( "PhysicalItems.usableItem" ),
        hint:  this.hintKey( "PhysicalItems.usableItem" )
      } ),
      itemStatus: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    false,
        initial:  "owned",
        choices:  ED4E.itemStatus,
        label:    this.labelKey( "PhysicalItems.itemStatus" ),
        hint:     this.hintKey( "PhysicalItems.itemStatus" )
      } ),
      matrix: MatrixData.asEmbeddedDataField(),
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    // TODO: return object instead of array? to have meaningful keys and you dont have to remember the positions of the values in the array
    return [
      this.parent.usableItem.labels.arbitraryStep,
      this.parent.usableItem.labels.action,
      this.parent.usableItem.labels.recoveryPropertyValue
    ];
  }

  /**
   * Whether the is currently carried (not just owned).
   * @type {boolean}
   */
  get carried() {
    return this.itemStatus === "carried";
  }

  /**
   * Whether the item is currently equipped (not just carried).
   * @type {boolean}
   */
  get equipped() {
    return this.itemStatus === "equipped";
  }

  get statusIndex() {
    return this.constructor._itemStatusOrder.indexOf( this.itemStatus );
  }

  /**
   * Returns the next item status in the sequence. If the item status is undefined
   * it will return the first in the sequence.
   * @type {string}
   */
  get nextItemStatus() {
    const statusOrder = this.constructor._itemStatusOrder;
    // if itemStatus is null or undefined `currentStatusIndex + 1` will result in NaN (Not a Number)
    // NaN || 0 will return 0
    return statusOrder[ ( this.statusIndex + 1 || 0 ) % statusOrder.length ];
  }

  /**
   * Returns the previous item status in the sequence. If the item status is undefined
   * it will return the first in the sequence.
   * @type {string}
   */
  get previousItemStatus(){
    const statusOrder = this.constructor._itemStatusOrder;
    const prevIndex = ( this.statusIndex - 1 ) || 0;
    // if itemStatus is null or undefined `currentStatusIndex - 1` will result in NaN (Not a Number)
    // NaN || 0 will return 0
    // if the previous index is negative, it will return the last index of the array
    return statusOrder[ ( prevIndex < 0 ? ( statusOrder.length - 1 ) : prevIndex ) % statusOrder.length ];
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */


  /**
   * Set the item status to "carried".
   * @returns {Promise} The updated Item instance.
   * @userFunction            UF_PhysicalItems-carry
   */
  async carry() {
    return this.parent.update( {
      "system.itemStatus": "carried"
    } );
  }

  /**
   * Set the item status to "owned".
   * @returns {Promise} The updated Item instance.
   * @userFunction            UF_PhysicalItems-deposit
   */
  async deposit() {
    return this.parent.update( {
      "system.itemStatus": "owned"
    } );
  }
}