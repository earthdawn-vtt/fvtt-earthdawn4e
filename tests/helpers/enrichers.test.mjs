// cspell:ignore unstub
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { EdRoll, EdRollOptions, toMessage, getDice } = vi.hoisted( () => {
  const toMessage = vi.fn();
  return {
    EdRoll:        vi.fn( function() { this.toMessage = toMessage; } ),
    EdRollOptions: vi.fn( function( data ) { Object.assign( this, data ); } ),
    toMessage,
    getDice:       vi.fn( () => "2d8" ),
  };
} );

vi.mock( "../../module/dice/ed-roll.mjs", () => ( { default: EdRoll } ) );
vi.mock( "../../module/data/roll/common.mjs", () => ( { default: EdRollOptions } ) );
vi.mock( "../../module/dice/step-tables.mjs", () => ( { default: getDice } ) );
vi.mock( "../../module/config/rolls.mjs", () => ( {} ) );

import { registerCustomEnrichers } from "../../module/helpers/enrichers.mjs";

describe( "Journal roll links", () => {
  let rollAction;

  beforeEach( () => {
    vi.clearAllMocks();
    vi.stubGlobal( "CONFIG", { TextEditor: { enrichers: [] } } );
    vi.stubGlobal( "document", {
      body: { addEventListener: vi.fn( ( type, listener ) => { rollAction = listener; } ) },
    } );
    registerCustomEnrichers();
  } );

  afterEach( () => {
    vi.unstubAllGlobals();
  } );

  it.each( [
    [ "/s 10", 10, "" ],
    [ "/s 10 ", 10, "" ],
    [ "/s 1", 1, "" ],
    [ "/s 25", 25, "" ],
    [ "/s 10 + 3", 10, "+ 3" ],
    [ "/s 10 + 0", 10, "+ 0" ],
  ] )( "passes a numeric step for %s without changing the dice modifier", async ( rollCmd, step, modifier ) => {
    const dataset = { rollCmd, rollFlavor: "Test roll", testType: "action" };
    const event = {
      target:          { closest: vi.fn( () => ( { dataset } ) ) },
      stopPropagation: vi.fn(),
    };

    await rollAction( event );

    expect( EdRollOptions ).toHaveBeenCalledWith( {
      step:       { base: step },
      chatFlavor: "Test roll",
      testType:   "action",
    } );
    const [ formula, , options ] = EdRoll.mock.calls[0];
    expect( typeof options.step.base ).toBe( "number" );
    expect( formula.split( ")" )[0].replaceAll( /\s/g, "" ) ).toBe( `(2d8${modifier.replaceAll( " ", "" )}` );
    expect( toMessage ).toHaveBeenCalledOnce();
    expect( event.stopPropagation ).toHaveBeenCalledOnce();
  } );

  it( "ignores clicks outside journal roll links", async () => {
    const event = { target: { closest: vi.fn( () => null ) }, stopPropagation: vi.fn() };

    await rollAction( event );

    expect( EdRoll ).not.toHaveBeenCalled();
    expect( event.stopPropagation ).not.toHaveBeenCalled();
  } );
} );
