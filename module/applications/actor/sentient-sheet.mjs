import ActorSheetEd from "./common-sheet.mjs";
import ED4E from "../../config/_module.mjs";


/**
 * Extend the basic ActorSheet with modifications
 */
export default class ActorSheetEdSentient extends ActorSheetEd {

  static {
    this.addSheetTabs( [
      { id: "general", },
      { id: "spells", },
      { id: "equipment", },
      { id: "notes", },
      { id: "specials", },
    ] );
  }

  /** @inheritdoc */
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
      attuneMatrix:     ActorSheetEdSentient._onAttuneMatrix,
      takeDamage:       ActorSheetEdSentient.takeDamage,
      knockDown:        ActorSheetEdSentient.knockdownTest,
      recovery:         ActorSheetEdSentient.rollRecovery,
      jumpUp:           ActorSheetEdSentient.jumpUp,
      initiative:       ActorSheetEdSentient.rollInitiative,
      rollable:         ActorSheetEdSentient.rollable,
      changeItemStatus: ActorSheetEdSentient.changeItemStatus,
    },
  };

  /** @inheritdoc */
  async _prepareContext( options ) {
    return await super._prepareContext( options );
  }

  /** @inheritdoc */
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );

    switch ( partId ) {
      case "general":
        break;
      case "spells":
        foundry.utils.mergeObject( context, {
          tabsSpells: this._getSpellTabs(),
          matrices:   this.document.getMatrices(),
        } );
        break;
      case "equipment":
        break;
      case "notes":
        break;
      case "specials":
        break;
    }

    return context;
  };

  /**
   * Get the sub-tabs for the spells section
   * @returns {{}}   The tabs object
   * @protected
   */
  _getSpellTabs() {
    this.tabGroups["spellsContent"] ??= "matrix";
    const labelPrefix = "ED.Actor.Tabs.Spells";

    const spellTabs = {
      matrix: { id: "matrix", group: "spellsContent", label: `${labelPrefix}.matrix` },
      all:    { id: "all", group: "spellsContent", label: `${labelPrefix}.all` },
    };

    const spellcastingTypes = new Set(
      this.document.itemTypes.spell.map( spell => spell.system.spellcastingType )
    );
    spellcastingTypes.forEach( type => {
      spellTabs[ type ] = {
        id:    type,
        group: "spellsContent",
        label: ED4E.spellcastingTypes[ type ],
      };
    } );

    for ( const tab of Object.values( spellTabs ) ) {
      tab.active = this.tabGroups[tab.group] === tab.id;
      tab.cssClass = tab.active ? "active" : "";
    }

    return spellTabs;
  };

  // Refactor together with the option to roll substitude abilities. dexterity should house all attack options and also tail attack if the namegiver has that set to true
  /**
   * Handle special attack button available to actors
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<Document>} - A promise that resolves to the attack roll result document.
   */
  static async _onAttack( event, target ) {
    event.preventDefault();
    const attackType = target.dataset.attackType;
    return this.document.attack( attackType );
  }

  /**
   * Handle attune matrix events on the actor sheet
   * @type {ApplicationClickAction}
   * @this {ActorSheetEdSentient}
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<void>}
   */
  static async _onAttuneMatrix( event, target ) {
    event.preventDefault();

    const firstMatrixUuid = target.closest( ".item-id" )?.dataset?.uuid;

    if ( await this.actor.reattuneSpells( firstMatrixUuid ) ) await this.render();
  }

  /**
   * Handle take damage action button on the actor sheet
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<Document>} - A promise that resolves to the damage roll result document.
   */
  static async takeDamage( event, target ) {
    const takeDamage = await this.document.getPrompt( "takeDamage" );
    if ( !takeDamage || takeDamage === "close" ) return;

    this.document.takeDamage( takeDamage.damage, {
      isStrain:     false,
      damageType:   takeDamage.damageType,
      armorType:    takeDamage.armorType,
      ignoreArmor:  takeDamage.ignoreArmor,
    } );
  }

  /**
   * Handle knockdown Button on the actor sheet.
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<Document>} - A promise that resolves to the knockdown test result document.
   */
  static async knockdownTest( event, target ) {
    event.preventDefault();
    const damageTaken = 0;
    this.document.knockdownTest( damageTaken );
  }

  /**
   * Handle recovery roll button on the actor sheet.
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<Document>} - A promise that resolves to the recovery roll result document.y
   */
  static async rollRecovery( event, target ) {
    event.preventDefault();
    const recoveryMode = await this.document.getPrompt( "recovery" );
    this.document.rollRecovery( recoveryMode, {event: event} );
  }

  /**
   * Handle jump up button on the actor sheet.
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<Document>} - A promise that resolves to the jump up result document.
   */
  static async jumpUp( event, target ) {
    event.preventDefault();
    this.document.jumpUp( {event: event} );
  }

  /**
   * Handle initiative roll button on the actor sheet.
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<Document>} - A promise that resolves to the initiative roll result document.
   */
  static async rollInitiative( event, target ) {
    event.preventDefault();
    ui.notifications.info( "Initiative not done yet" );
    this.document.rollInitiative( {event: event} );
  }

  /**
   * Handle roll trigger on the actor sheet.
   * @param {Event} event     The originating click event.
   * @param {HTMLElement} target  The target element that was clicked.
   * @returns {Promise<Document>} - A promise that resolves to the roll result document.
   */
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
   * @returns {ApplicationV2}   The rendered item sheet.
   * @private
   */
   
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
