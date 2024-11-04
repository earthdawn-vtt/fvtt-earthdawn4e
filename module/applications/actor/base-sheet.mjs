import ED4E from "../../config.mjs";

// noinspection JSClosureCompilerSyntax
/**
 * Extend the basic ActorSheet with modifications
 * @augments {ActorSheet}
 */
export default class ActorSheetEd extends ActorSheet {

  /**
   * @override
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject( super.defaultOptions, {
      classes: [ "earthdawn4e", "sheet", "actor", ],
      width:   800,
      height:  800,
      tabs:    [
        {
          navSelector:     ".actor-sheet-tabs",
          contentSelector: ".actor-sheet-body",
          initial:         "main",
        },
        {
          navSelector:     ".actor-sheet-spell-tabs",
          contentSelector: ".actor-sheet-spell-body",
          initial:         "spell-matrix-tab",
        },
      ],
      scrollY: [
        ".main",
      ],
    } );
  }

  /** @override */
  get template() {
    return `systems/ed4e/templates/actor/${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /*  Get Data            */
  /* -------------------------------------------- */
  async getData() {
    const systemData = super.getData();
    systemData.systemFields = this.document.system.schema.fields;
    systemData.enrichment = await this.actor._enableHTMLEnrichment();
    await this.actor._enableHTMLEnrichmentEmbeddedItems();
    systemData.config = ED4E;
    systemData.splitTalents = game.settings.get( "ed4e", "talentsSplit" );

    return systemData;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners( html ) {
    super.activateListeners( html );

    // View Item Sheets
    html.find( ".item-edit" ).click( this._onItemEdit.bind( this ) );

    // All listeners below are only needed if the sheet is editable
    if ( !this.isEditable ) return;

    // Attribute tests
    html.find( ".attribute-card__grid--item .rollable" ).click( this._onRollAttribute.bind( this ) );

    // Ability tests
    html.find( ".card__ability .rollable" ).click( this._onRollAbility.bind( this ) );

    // Equipment tests
    html.find( ".card__equipment .rollable" ).click( this._onRollEquipment.bind( this ) );

    // take strain
    html.find( ".card__ability .take-strain" ).click( this._onTakeStrain.bind( this ) );

    // toggle holding Tpye of an owned item
    html.find( ".item__status" ).mousedown( this._onChangeItemStatus.bind( this ) );

    // Owned Item management
    html.find( ".item-delete" ).click( this._onItemDelete.bind( this ) );

    // Actor Sheet Buttons
    html.find( ".action-buttons" ).click( event => {
      const action = event.currentTarget.dataset.action;
      const actionMapping = {
        "recovery":      () => this._onRecoveryRoll( event ),
        "takeDamage":    () => this._onTakeDamage( event ),
        "jumpUp":        () => this._onJumpUp( event ),
        "initiative":    () => this._onInitiative( event ),
        "halfMagic":     () => this._onHalfMagic( event ),
        "knockdownTest": () => this._onKnockDown( event ),
      };
      // Check if the action exists in the mapping and call it
      if ( actionMapping.hasOwnProperty( action ) ) {
        actionMapping[action]();
      }
    } );

    // Effect Management
    html.find( ".effect-add" ).click( this._onEffectAdd.bind( this ) );
    html.find( ".effect-edit" ).click( this._onEffectEdit.bind( this ) );
    html.find( ".effect-delete" ).click( this._onEffectDelete.bind( this ) );

    // Karma refresh button --> karma ritual
    html.find( ".button__Karma-refresh" ).click( this._onKarmaRefresh.bind( this ) );

    // item card description shown on item click
    html.find( ".card__name" ).click( event => this._onCardExpand( event ) );

    // Legend point Tracking
    html.find( ".legend-point__history" ).click( this._onLegendPointHistory.bind( this ) );

    html.find( ".item-upgrade__attribute" ).click( this._onAttributeEnhancement.bind( this ) );

    html.find( ".item-upgrade__ability" ).click( this._onAbilityEnhancement.bind( this ) );

    html.find( ".item-upgrade__class" ).click( this._onClassEnhancement.bind( this ) );
  }

  /* -------------------------------------------- */
  /*              Equipment Toggle                */
  /* -------------------------------------------- */

  /**
   * Handle changing the holding type of owned items.
   * @description itemStatus.value =
   * 1: owned,
   * 2: carried,
   * 3: equipped,
   * 4: mainHand,
   * 5: offHand,
   * 6: twoHanded,
   * 7: tail
   * @param {Event} event     The originating click event.
   * @returns {Application}   The rendered item sheet.
   * @private
   * @userFunction              UF_PhysicalItems-onChangeItemStatus
   */
  // eslint-disable-next-line complexity
  _onChangeItemStatus( event ) {
    event.preventDefault();

    // if left click is used, rotate the item normally
    const rotate = event.button === 0 || event.button === 2;
    // if shift+left click is used, unequip the item
    const unequip = rotate && event.shiftKey;
    // middle click is used to deposit the item
    const deposit = event.button === 1;
    // if right click is used, rotate status backwards
    const backwards = event.button === 2;

    const li = event.currentTarget.closest( ".item-id" );
    const item = this.actor.items.get( li.dataset.itemId );

    if ( unequip ) return item.system.carry()?.then( _ => this.render() );
    if ( rotate ) return this.actor.rotateItemStatus( item.id, backwards ).then( _ => this.render() );
    if ( deposit ) return item.system.deposit()?.then( _ => this.render() );
    return this;
  }

  /* -------------------------------------------- */
  /*             LP Tracking Trigger              */
  /* -------------------------------------------- */

  /**
   * @description               Open the Legend Point history of the actor
   * @param { Event } event     The originating click event.
   * @private
   */
  _onLegendPointHistory( event ) {
    event.preventDefault();
    this.actor.legendPointHistory( this.actor );
  }

  /**
   * @description             This function is used to upgrade attributes
   * @param {Event} event     The originating click event.
   * @private
   */
  async _onAttributeEnhancement( event ) {
    event.preventDefault();
    const attribute = event.currentTarget.dataset.attribute;
    await this.actor.system.increaseAttribute( attribute );
  }

  /**
   * @description             This function is used to upgrade abilities
   * @param {Event} event     The originating click event.
   * @private
   */
  async _onAbilityEnhancement( event ) {
    event.preventDefault();
    const li = event.currentTarget.closest( ".item-id" );
    const ability = this.actor.items.get( li.dataset.itemId );
    if ( typeof ability.system.increase === "function" ) ability.system.increase();
  }

  /**
   * @description             This function is used to upgrade Classes
   * @param {Event} event     The originating click event.
   * @private
   */
  async _onClassEnhancement( event ) {
    event.preventDefault();
    const li = event.currentTarget.closest( ".item-id" );
    const classItem = this.actor.items.get( li.dataset.itemId );
    classItem.system.increase();
  }


  /* -------------------------------------------- */
  /*                 Roll Trigger                 */
  /* -------------------------------------------- */

  /**
   * Handle rolling an attribute test.
   * @param {Event} event      The originating click event.
   * @private
   */
  _onRollAttribute( event ) {
    event.preventDefault();
    const input ={
      attribute:  event.currentTarget.dataset.attribute,
    };
    this.actor.callGetWorkflow( "rollAttribute", input, {} );
  }

  /**
   * Handle rolling an attribute test.
   * @param {Event} event      The originating click event.
   * @private
   */
  _onRollAbility( event ) {
    event.preventDefault();
    const li = event.currentTarget.closest( ".item-id" );
    const ability = this.actor.items.get( li.dataset.itemId );
    this.actor.rollAbility( ability, {}, { event: event } );
  }

  /**
   * Handle rolling an attribute test.
   * @param {Event} event      The originating click event.
   * @private
   * @userFunction              UF_PhysicalItems-onRollEquipment
   */
  _onRollEquipment( event ) {
    event.preventDefault();
    const li = event.currentTarget.closest( ".item-id" );
    const equipment = this.actor.items.get( li.dataset.itemId );
    this.actor.rollEquipment( equipment, { event: event } );
  }

  /**
   * @description             Take strain is used for non-rollable abilities which requires strain. player can click on the icon to take the strain damage
   * @param {Event} event     The originating click event
   * @private
   */
  _onTakeStrain( event ) {
    event.preventDefault();
    const li = event.currentTarget.closest( ".item-id" );
    const ability = this.actor.items.get( li.dataset.itemId );
    this.actor.takeStrain( ability.system.strain );
  }

  /* -------------------------------------------- */
  /*                Action Button                 */
  /* -------------------------------------------- */

  /**
   * Handles Recovery tests
   * @param {Event} event The originating click event.
   * @private
   */
  async _onRecoveryRoll( event ) {
    event.preventDefault();
    const recoveryMode = await this.actor.getPrompt( "recovery" );
    this.actor.rollRecovery( recoveryMode, {event: event} );
  }

  async _onTakeDamage( _ ) {
    const takeDamage = await this.actor.getPrompt( "takeDamage" );
    if ( !takeDamage || takeDamage === "close" ) return;

    this.actor.takeDamage(
      takeDamage.damage,
      false,
      takeDamage.damageType,
      takeDamage.armorType,
      takeDamage.ignoreArmor,
    );
  }

  _onJumpUp( event ) {
    event.preventDefault();
    this.actor.jumpUp( {event: event} );
  }

  _onInitiative( event ) {
    event.preventDefault();
    this.actor.rollInitiative( {event: event} );
  }

  _onHalfMagic( event ) {
    event.preventDefault();
    this.actor.rollHalfMagic( {event: event} );
  }

  _onKnockDown( event ) {
    event.preventDefault();
    const damageTaken = 0;
    this.actor.knockdownTest( damageTaken );
  }

  _onKarmaRefresh() {
    this.actor.karmaRitual();
  }


  /* -------------------------------------------- */
  /*                   Effects                    */
  /* -------------------------------------------- */

  /**
   * Handle creating an owned ActiveEffect for the Actor.
   * @param {Event} event     The originating click event.
   * @returns {Promise|null}  Promise that resolves when the changes are complete.
   * @private
   */
  _onEffectAdd( event ) {
    event.preventDefault();
    return this.actor.createEmbeddedDocuments( "ActiveEffect", [ {
      label:    "New Effect",
      icon:     "icons/svg/item-bag.svg",
      duration: { rounds: 1 },
      origin:   this.actor.uuid
    } ] );
  }

  /**
   * Handle deleting an existing Owned ActiveEffect for the Actor.
   * @param {Event} event                       The originating click event.
   * @returns {Promise<ActiveEffect>|undefined} The deleted item if something was deleted.
   * @private
   */
  _onEffectDelete( event ) {
    event.preventDefault();
    const itemId = event.currentTarget.parentElement.dataset.itemId;
    const effect = this.actor.effects.get( itemId );
    if ( !effect ) return;
    return effect.deleteDialog();
  }

  /**
   * Handle editing an existing Owned ActiveEffect for the Actor.
   * @param {Event}event    The originating click event.
   * @returns {any}         The rendered item sheet.
   * @private
   */

  _onEffectEdit( event ) {
    event.preventDefault();
    const itemId = event.currentTarget.parentElement.dataset.itemId;
    const effect = this.actor.effects.get( itemId );
    return effect.sheet?.render( true );
  }


  /* -------------------------------------------- */
  /*             Owned item Handler               */
  /* -------------------------------------------- */
  /**
   * Handle deleting an existing Owned Item for the Actor.
   * @param {Event} event                 The originating click event.
   * @returns {Promise<ItemEd>|undefined} The deleted item if something was deleted.
   * @private
   */
  async _onItemDelete( event ) {
    event.preventDefault();
    const itemId = event.currentTarget.parentElement.dataset.itemId;
    const item = this.actor.items.get( itemId );
    if ( !item ) return;
    return item.deleteDialog();
  }

  /**
   * Handle editing an existing Owned Item for the Actor.
   * @param {Event}event    The originating click event.
   * @returns {ItemSheetEd} The rendered item sheet.
   * @private
   */
  _onItemEdit( event ) {
    event.preventDefault();
    const itemId = event.currentTarget.parentElement.dataset.itemId;
    const item = this.actor.items.get( itemId );
    return item.sheet?.render( true );
  }

  _onCardExpand( event ) {
    event.preventDefault();

    const itemDescription = $( event.currentTarget )
      .parent( ".item-id" )
      .parent( ".card__ability" )
      .children( ".card__description" );

    itemDescription.toggleClass( "card__description--toggle" );
  }
}

