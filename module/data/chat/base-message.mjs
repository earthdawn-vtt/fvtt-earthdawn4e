import SystemDataModel from "../abstract/system-data-model.mjs";

export default class BaseMessageData extends SystemDataModel {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.BaseMessage",
  ];

  /**
   * Designates which upstream class in this class' inheritance chain is the base data model.
   * Any DEFAULT_OPTIONS of super-classes further upstream of the BASE_DATA_MODEL are ignored.
   * Hook events for super-classes further upstream of the BASE_DATA_MODEL are not dispatched.
   * @type {typeof BaseMessageData}
   * @see {ApplicationV2#BASE_APPLICATION}
   */
  static BASE_DATA_MODEL = BaseMessageData;

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    actions: {
      applyEffect:    this._onApplyEffect,
      scrollToSource: this._onScrollToSource,
    },
  };

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: "common",
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Static Methods

  /**
   * Iterate over the inheritance chain of this Application. Analogous to {@link ApplicationV2#inheritanceChain}
   * @see BaseMessageData.BASE_DATA_MODEL
   * @generator
   * @yields {typeof ApplicationV2}
   */
  static *inheritanceChain() {
    let cls = this;
    while ( cls ) {
      yield cls;
      if ( cls === this.BASE_DATA_MODEL ) return;
      cls = Object.getPrototypeOf( cls );
    }
  }

  // endregion

  // region Properties

  /**
   * The roll that generated this message. If multiple, only returns the first.
   * @type {EdRoll|undefined}
   */
  get roll() {
    return this.parent?.rolls[0];
  }

  /**
   * The actor who rolled the roll that generated this message, if any.
   * @type {Document | object | null}
   */
  get rollingActor() {
    return fromUuidSync( this.roll?.options.rollingActorUuid );
  }

  /**
   * The anchor HTML for scrolling to this message in the chat log.
   * @type {string}
   */
  get scrollToSourceLink() {
    return `<div class="text--left">
      <a class="source-message content-anchor"
              data-uuid="${ this.parent.uuid }" data-id="${ this.parent.id }"
              data-action="scrollToSource"
              data-tooltip="${ game.i18n.localize( " ED.ToolTips.scrollToSourceMessage" ) }">
      ${ game.i18n.localize( "ED.Chat.Button.scrollToSourceMessage" ) }
      </a>
    </div>`;
  }

  // endregion

  constructor( data, options ) {
    super( data, options );

    // Configure Options
    this.options = Object.freeze( this._initializeOptions( {} ) );
  }

  // region Initialization

  /**
   * Initialize the default options for this. Analogous to {@link ApplicationV2#_initializeApplicationOptions}
   * @param {object} options Options provided directly to the constructor
   * @param {object} [options.actions] - Action handlers defined for this Application.
   * @returns {object} Configured options for the application instance
   * @see {foundry.applications.types.ApplicationConfiguration#actions}
   * @protected
   */
  _initializeOptions( options ) {

    // Options initialization order
    const order = [ options ];
    for ( const cls of this.constructor.inheritanceChain() ) {
      order.unshift( cls.DEFAULT_OPTIONS );
    }

    // Intelligently merge with parent class options
    const applicationOptions = {};
    for ( const opts of order ) {
      for ( const [ k, v ] of Object.entries( opts ) ) {
        if ( ( k in applicationOptions ) ) {
          const v0 = applicationOptions[k];
          if ( Array.isArray( v0 ) ) applicationOptions[k].push( ...v );                // Concatenate arrays
          else if ( foundry.utils.getType( v0 ) === "Object" ) Object.assign( v0, v );   // Merge objects
          else applicationOptions[k] = foundry.utils.deepClone( v );                  // Override option
        }
        else applicationOptions[k] = foundry.utils.deepClone( v );
      }
    }

    return applicationOptions;
  }

  // endregion

  // region Event Handlers

  /**
   * Attach event listeners to the message HTML
   * @param {HTMLElement} element - The message HTML element
   * @returns {HTMLElement} The element to which listeners were attached
   * @protected
   */
  attachListeners( element ) {

    const click = this.#onClick.bind( this );
    element.addEventListener( "click", click, { passive: false } );

    return element;
  }

  /**
   * Centralized handling of click events which occur on or within the Application frame. Taken from {@link ApplicationV2}
   * @param { PointerEvent } event - The originating click event
   * @private
   */
  #onClick( event ) {
    const target = event.target;
    const actionButton = target.closest( "[data-action]" );
    if ( actionButton ) {
      this.#onClickAction( event, actionButton );
    }
  }

  /**
   * Handle a click event on an element which defines a [data-action] handler. Taken from {@link ApplicationV2}.
   * @param {PointerEvent} event      The originating click event
   * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
   */
  #onClickAction ( event, target ) {
    const action = target.dataset.action;

    if ( action in ui.chat.options.actions ) return;
    event.preventDefault();

    let handler = this.options.actions[ action ];

    // No defined handler
    if ( !handler ) this._onClickAction( event, target );

    // Defined handler
    let buttons = [ 0 ];
    if ( typeof handler === "object" ) {
      buttons = handler.buttons;
      handler = handler.handler;
    }
    if ( buttons.includes( event.buttons ) ) handler?.call( this, event, target );
  }

  /**
   * A generic event handler for action clicks which can be extended by subclasses.
   * Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have
   * no defined handler.
   * @param {PointerEvent} event      The originating click event
   * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
   * @protected
   */
  _onClickAction( event, target ) {
    console.warn( `The ${ target.dataset.action } action has not been implemented in ${ this.constructor.name }` );
  }

  /**
   * @type {ApplicationClickAction}
   * @this {BaseMessageData}
   */
  static async _onApplyEffect( event, button ) {
    const itemForEffects = /** @type {ItemEd} */ await fromUuid( button.dataset.itemForEffectsUuid );
    if ( !itemForEffects ) {
      throw new Error( `No item found for effects with UUID: ${ button.dataset.itemForEffectsUuid }` );
    }

    const effects = itemForEffects.targetEffects;
    const targets = Array.from( game.user.targets.map( target => target.document.actor ) );
    if ( targets.length === 0 ) {
      ui.notifications.warn( game.i18n.localize(
        "ED.Notifications.Warn.needTargetsToApplyFromChat",
      ) );
      return;
    }

    for ( const targetActor of targets ) {
      await targetActor.createActiveEffects( effects );
    }

  }

  /**
   * @type {ApplicationClickAction}
   * @this {BaseMessageData}
   */
  static async _onScrollToSource( event, button ) {
    this.parent.scrollToMessage( button.dataset.id );
  }

  // endregion

  // region Rendering

  /**
   * Render the HTML for the ChatMessage which should be added to the log. Analogous to {@link ChatMessage#getHTML}
   * @param {HTMLElement} html - The base HTML element which should be enhanced
   * @param {{}} context - The rendering context
   * @returns {Promise<HTMLElement>} A Promise which resolves to the rendered HTML
   */
  async alterMessageHTML( html, context ) {
    // Add character portrait to message
    this._addUserPortrait( html );

    // Add class for highlighting success/failure on roll messages
    if ( this.roll ) this.roll.addSuccessClass( html );

    return html;
  }

  /**
   * Add the user's avatar to the chat message.
   * @param {HTMLElement} element - The jQuery object for the chat message.
   */
  _addUserPortrait( element ) {

    const chatAvatarSetting = game.settings.get( "ed4e", "chatAvatar" );
    const isGM = this.parent.author.isGM;
    const avatar_img = this.parent.author.avatar;
    const token = canvas.tokens?.controlled[0];
    const token_img =  ( isGM || token?.document.isOwner ) ? token?.document.texture.src : undefined;
    const is_config_setting = chatAvatarSetting === "configuration";

    let avatar = is_config_setting ? avatar_img : undefined;
    avatar ??= token_img;
    avatar ??= isGM ? avatar_img : this.parent.author.character?.img;

    if ( avatar ) {
      const img = document.createElement( "img" );
      img.src = avatar;
      img.classList.add( "avatar" );
      element.querySelector( ".message-header" ).prepend( img );
    }
  }

  // endregion
  
}