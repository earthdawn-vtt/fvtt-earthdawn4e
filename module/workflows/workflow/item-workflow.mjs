import Workflow from "./workflow.mjs";
import ItemEd from "../../documents/item.mjs";

/**
 * Base class for all workflows that are associated with an Item.
 * @abstract
 */
export default class ItemWorkflow extends Workflow {

  /**
   * The item that this workflow is associated with.
   * @type {ItemEd}
   */
  _item = null;

  /**
   * @override
   * @param {ItemEd} item The item that this workflow is associated with.
   * @param {WorkflowOptions} [options] See {@link Workflow#constructor}.
   */
  constructor( item, options = {} ) {
    if ( !( item instanceof ItemEd ) )
      throw new TypeError( "ItemWorkflow constructor expects an Item instance." );

    super( options );
    this._item = item;
  }

}