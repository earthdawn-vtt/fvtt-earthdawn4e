import { preLocalize } from "../utils.mjs";


// region Movement

/**
 * The various types of movement of moving entities.
 * @enum {string}
 */
export const movementTypes = {
  burrow: "ED.Config.MovementTypes.burrow",
  climb:  "ED.Config.MovementTypes.climb",
  fly:    "ED.Config.MovementTypes.fly",
  swim:   "ED.Config.MovementTypes.swim",
  walk:   "ED.Config.MovementTypes.walk"
};
preLocalize( "movementTypes", { sort: true } );

/**
 * The valid units of measure for movement distances in the game system.
 * By default, this uses the imperial units of feet and miles.
 * @enum {string}
 */
export const movementUnits = {
  in: "ED.Config.MovementUnits.inch",
  ft: "ED.Config.MovementUnits.feet",
  yd: "ED.Config.MovementUnits.yard",
  mi: "ED.Config.MovementUnits.mile",
};
preLocalize( "movementUnits" );

// endregion


// region Area

/**
 * Information needed to represent different area of effect target types.
 * @typedef {object} AreaTargetDefinition
 * @property {string} label        Localize(d) label for this type.
 * @property {string} template     Type of `MeasuredTemplate` create for this target type.
 * @property {string} [reference]  Reference to a rule page describing this area of effect.
 * @property {string[]} [sizes]    List of available sizes for this template. Options are chosen from the list: "angle",
 *                                 "radius", "width", "height", "length", "thickness". No more than 3 dimensions may
 *                                 be specified.
 */

/**
 * Types for effects that cover an area.
 * @enum {AreaTargetDefinition}
 */
export const areaTargetDefinition = {
  circle:   {
    label:    "ED.Config.AreaTargets.circle",
    template: "circle",
    sizes:    [ "radius" ],
  },
  cone:     {
    label:    "ED.Config.AreaTargets.cone",
    template: "cone",
    sizes:    [ "angle", "radius" ],
  },
  cube:     {
    label:    "ED.Config.AreaTargets.cube",
    template: "rect",
    sizes:    [ "width" ],
  },
  cylinder: {
    label:    "ED.Config.AreaTargets.cylinder",
    template: "circle",
    sizes:    [ "radius", "height" ],
  },
  line:     {
    label:    "ED.Config.AreaTargets.line",
    template: "ray",
    sizes:    [ "length", "width" ],
  },
  radius:   {
    label:    "ED.Config.AreaTargets.radius",
    template: "circle",
  },
  sphere:   {
    label:    "ED.Config.AreaTargets.sphere",
    template: "circle",
    sizes:    [ "radius" ],
  },
  square:   {
    label:    "ED.Config.AreaTargets.square",
    template: "rect",
    sizes:    [ "width" ],
  },
  wall:     {
    label:    "ED.Config.AreaTargets.wall",
    template: "ray",
    sizes:    [ "length", "thickness", "height" ],
  },
};
preLocalize( "areaTargetDefinition", { key: "label", sort: true } );

// endregion


// region Distance



/**
 * The types of range that are used for measuring actions and effects.
 * @enum {string}
 */
export const rangeTypes = {
  self:  "ED.Config.RangeTypes.self",
  touch: "ED.Config.RangeTypes.touch",
  spec:  "ED.Config.RangeTypes.special",
  any:   "ED.Config.RangeTypes.any",
};
preLocalize( "rangeTypes" );

/**
 * The valid units of measure for the range of an action or effect. A combination of {@link movementUnits}
 * and {@link rangeTypes}.
 * @enum {string}
 */
export const distanceUnits = {
  ...movementUnits,
  ...rangeTypes,
};
preLocalize( "distanceUnits" );

// endregion


// region Time

/**
 * Time periods that accept a numeric value.
 * @enum {string}
 */
export const scalarTimePeriods = {
  turn:   "ED.Config.ScalarTimePeriods.turn",
  round:  "ED.Config.ScalarTimePeriods.round",
  minute: "ED.Config.ScalarTimePeriods.minute",
  hour:   "ED.Config.ScalarTimePeriods.hour",
  day:    "ED.Config.ScalarTimePeriods.day",
  week:   "ED.Config.ScalarTimePeriods.week",
  month:  "ED.Config.ScalarTimePeriods.month",
  year:   "ED.Config.ScalarTimePeriods.year"
};
preLocalize( "scalarTimePeriods" );

/**
 * Time periods for spells that don't have a defined ending.
 * @enum {string}
 */
export const permanentTimePeriods = {
  perm: "ED.Config.PermanentTimePeriods.perm"
};
preLocalize( "permanentTimePeriods" );

/**
 * Time periods that don't accept a numeric value.
 * @enum {string}
 */
export const specialTimePeriods = {
  inst: "ED.Config.SpecialTimePeriods.inst",
  spec: "ED.Config.SpecialTimePeriods.special"
};
preLocalize( "specialTimePeriods" );

/**
 * The various lengths of time over which effects can occur.
 * @enum {string}
 */
export const timePeriods = {
  ...specialTimePeriods,
  ...permanentTimePeriods,
  ...scalarTimePeriods
};
preLocalize( "timePeriods" );

// endregion


// region Magic

export const spellEnhancementUnits = {
  ...movementUnits,
  ...scalarTimePeriods,
};
preLocalize( "spellEnhancementUnits" );

// endregion