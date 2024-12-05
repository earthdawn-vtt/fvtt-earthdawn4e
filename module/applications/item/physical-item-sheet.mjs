import ItemSheetEd from "./item-sheet.mjs";

/**
 * Extend the basic ActorSheet with modifications
 * @augments {ItemSheet}
 */
export default class PhysicalItemSheetEd extends ItemSheetEd {
  
  constructor( options = {} ) {
    super( options );
  }

  /**
   * @override
   */

  static DEFAULT_OPTIONS = {
    actions:  {
      tailorToNamegiver:  PhysicalItemSheetEd.tailorToNamegiver,
    },
  };

  static async tailorToNamegiver( event, target ) {
    this.document.tailorToNamegiver( this.document.parent.namegiver );
  }
}

