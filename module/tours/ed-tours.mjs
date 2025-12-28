import { delay } from "../utils.mjs";
export default class EdTour extends foundry.nue.Tour {
  static tours = [
    "systems/ed4e/module/tours/lang/actor-item-creation",
    "systems/ed4e/module/tours/lang/arbitrary-roll",
    "systems/ed4e/module/tours/lang/item-class",
    "systems/ed4e/module/tours/lang/sidebar-settings"
  ];
  static gmTours = [

  ];

  static async travelAgency(){
    const lang = game.i18n.lang === "de" ? "de" : "en";
    console.log( "Adding ED Tours" );
    for( let tour of this.tours ){
      const obj = await game.ed4e.tours.EdTour.fromJSON( `${tour.replace( "/lang/", `/${lang}/` ) }.json` );
      game.tours.register( obj.config.module, obj.id, obj );
    }
    if( !game.user.isGM ) return;

    for( let tour of this.gmTours ){
      const obj = await game.ed4e.tours.EdTour.fromJSON( `${tour.replace( "/lang/", `/${lang}/` ) }.json` );
      game.tours.register( obj.config.module, obj.id, obj );
    }
  }

  async _preStep() {
    // tabs of sidebar
    if( this.currentStep.activateTab ){
      ui.sidebar.activateTab( this.currentStep.activateTab );
    }
    else if( this.currentStep.activateLayer && canvas.activeLayer.options.name !== this.currentStep.activateLayer ){
      await canvas[this.currentStep.activateLayer].activate();
      await delay( 100 );
    }
    // tabs of documents
    else if( this.currentStep.appTab ){
      ui.activeWindow.activateTab( this.currentStep.appTab );
    }
    if( this.currentStep.action !== "none" ) {
      // Actor and Item Creation Tour Actions
      if ( this.currentStep.action === "createActor" ) {
        Actor.implementation.createDialog();  
      }
      else if ( this.currentStep.action === "createItem" ) {
        Item.implementation.createDialog();      
      }
      else if ( this.currentStep.action === "setAdvancementCircleTabActive" ) {
        ui.activeWindow.document.sheet.activateTab( "item-advancement-level-tab-1", {group: "advancement"} );
      }
      else if ( this.currentStep.action === "setAdvancementPoolTabActive" ) {
        ui.activeWindow.document.sheet.activateTab( "item-advancement-options-pools", {group: "advancement"} );
      }
      else if ( this.currentStep.action === "arbitraryRollStep14" ) {
        $( "#chat-message" ).val( "/s 14" );
      }
    }
  }

    

  // exit(){
  //     super.exit()
  // }

  async start() {
    if( this.config.preCommand ){
      const AsyncFunction = Object.getPrototypeOf( async () => { } ).constructor;
      const fn = new AsyncFunction( this.config.preCommand );
      await fn.call( this );
    }
    if( this.apps ){
      await this.apps.render( true, {focus: true} );
      while( !this.apps.rendered ) await delay( 50 );
    }
    if( this.apps || this.config.preCommand )
      while( !$( this.steps[this.stepIndex + 1].selector + ":visible" ).length ) await delay( 100 );

    const res = await super.start();
    // $( "#tooltip" ).show()
    return res;
  }

    

}