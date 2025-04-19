/**
 * @augments DialogV2
 */
export default class Dialog extends foundry.applications.api.DialogV2 {

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes:  [ "ed4e" ],
    position: {
      width:  400,
      height: "auto",
    },
  };

}