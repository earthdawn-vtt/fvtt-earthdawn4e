import ED4E from "../../config.mjs";
import ActorSheetEd from "./common-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheet}
 */
export default class ActorSheetEdSentient extends ActorSheetEd {

  constructor( options = {} ) {
    super( options );
  }

  /** 
   * @override 
   */
  static DEFAULT_OPTIONS = {
    classes:  [ "earthdawn4e", "sheet", "actor" ],
    window:   {
      frame:          true,
      positioned:     true,
      icon:           false,
      minimizable:    true,
      resizable:      true,
    },
    form: {
      submitOnChange: true,
    },
    actions:  {
      attack:           ActorSheetEdSentient._onAttack,
      takeDamage:       ActorSheetEdSentient.takeDamage,
      knockDown:        ActorSheetEdSentient.knockdownTest,
      recovery:         ActorSheetEdSentient.rollRecovery,
      jumpUp:           ActorSheetEdSentient.jumpUp,
      initiative:       ActorSheetEdSentient.rollInitiative,
      rollable:         ActorSheetEdSentient.rollable,
      changeItemStatus: ActorSheetEdSentient.changeItemStatus,
    },
  };

  async _prepareContext() {
    // TODO: überprüfen was davon benötigt wird
    const context = {
      actor:                  this.document,
      system:                 this.document.system,
      items:                  this.document.items,
      options:                this.options,
      systemFields:           this.document.system.schema.fields,
      // enrichment:             await this.document._enableHTMLEnrichment(),
      // enrichmentEmbededItems: await this.document._enableHTMLEnrichmentEmbeddedItems(),
      config:                 ED4E,
    };


    context.enrichedDescription = await TextEditor.enrichHTML(
      this.document.system.description.value,
      {
        // Only show secret blocks to owner
        secrets:    this.document.isOwner,
        EdRollData: this.document.getRollData
      }
    );

    return context;
  }

  static async _onAttack( event, target ) {
    event.preventDefault();
    const attackType = target.dataset.attackType;
    return this.document.attack( attackType );
  }

  static async takeDamage( event, target ) {
    const takeDamage = await this.document.getPrompt( "takeDamage" );
    if ( !takeDamage || takeDamage === "close" ) return;

    this.document.takeDamage(
      takeDamage.damage,
      false,
      takeDamage.damageType,
      takeDamage.armorType,
      takeDamage.ignoreArmor,
    );
  }

  static async knockdownTest( event, target ) {
    event.preventDefault();
    const damageTaken = 0;
    this.document.knockdownTest( damageTaken );
  }

  static async rollRecovery( event, target ) {
    event.preventDefault();
    const recoveryMode = await this.document.getPrompt( "recovery" );
    this.document.rollRecovery( recoveryMode, {event: event} );
  }

  static async jumpUp( event, target ) {
    event.preventDefault();
    this.document.jumpUp( {event: event} );
  }

  static async rollInitiative( event, target ) {
    event.preventDefault();
    ui.notifications.info( "Initiative not done yet" );
    this.document.rollInitiative( {event: event} );
  }

  static async rollable( event, target ) {
    event.preventDefault();
    const li = target.closest( ".item-id" );
    const ability = this.document.items.get( li?.dataset?.itemId );

    if ( ability?.system?.roll instanceof Function ) return ability.system.roll();
    const rollType = target.dataset.rolltype;
    if ( rollType === "attribute" ) {
      const attribute = target.dataset.attribute;
      this.document.rollAttribute( attribute, {}, { event: event } );
    }  else if ( rollType === "equipment" ) {
      const li = target.closest( ".item-id" );
      const equipment = this.document.items.get( li.dataset.itemId );
      this.document.rollEquipment( equipment, { event: event } );
    }
  }

  /**
   * Handle changing the holding type of owned items.
   * @description itemStatus.value =
   * @param {Event} event     The originating click event.
   * @param {number} target
   * 1: owned,
   * 2: carried,
   * 3: equipped,
   * 4: mainHand,
   * 5: offHand,
   * 6: twoHanded,
   * 7: tail
   * @returns {Application}   The rendered item sheet.
   * @private
   * @userFunction              UF_PhysicalItems-onChangeItemStatus
   */
  // eslint-disable-next-line complexity
  static async changeItemStatus( event, target ) {
    event.preventDefault();

    // if left click is used, rotate the item normally
    const rotate = event.button === 0 || event.button === 2;
    // if shift+left click is used, unequip the item
    const unequip = rotate && event.shiftKey;
    // middle click is used to deposit the item
    const deposit = event.button === 1;
    // if right click is used, rotate status backwards
    const backwards = event.button === 2;

    const li = target.closest( ".item-id" );
    const item = this.document.items.get( li.dataset.itemId );

    if ( unequip ) return item.system.carry()?.then( _ => this.render() );
    if ( rotate ) return this.document.rotateItemStatus( item.id, backwards ).then( _ => this.render() );
    if ( deposit ) return item.system.deposit()?.then( _ => this.render() );
    return this;
  }
}
