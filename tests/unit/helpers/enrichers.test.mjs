/**
 * Test Instructions
 * Run with npm test -- --run tests/unit/helpers/enrichers.test.mjs.
 * These tests turn journal roll text into a link and click it, checking that the
 * complete dice expression, numeric step, description and test type reach the roll.
 * Invalid formulas stay as text. Foundry validation and chat output are mocked;
 * the step-to-dice conversion uses the real fourth-edition table.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { EdRoll, EdRollOptions, toMessage, validate } = vi.hoisted( () => {
  const toMessage = vi.fn();
  return {
    EdRoll:        vi.fn( function() { this.toMessage = toMessage; } ),
    EdRollOptions: vi.fn( function( data ) { Object.assign( this, data ); } ),
    toMessage,
    validate:      vi.fn(),
  };
} );

vi.mock( "../../../module/dice/ed-roll.mjs", () => ( { default: EdRoll } ) );
vi.mock( "../../../module/data/roll/common.mjs", () => ( { default: EdRollOptions } ) );
vi.mock( "../../../module/helpers/settings.mjs", () => ( { getSetting: () => "fourth" } ) );
vi.mock( "../../../module/i18n/localization.mjs", () => ( { preLocalize: vi.fn() } ) );

import { registerCustomEnrichers } from "../../../module/helpers/enrichers.mjs";
import * as ROLLS from "../../../module/config/rolls.mjs";

describe( "Journal roll links", () => {
  let rollAction;
  let enricher;

  beforeEach( () => {
    vi.clearAllMocks();
    validate.mockReturnValue( true );
    vi.stubGlobal( "CONFIG", { TextEditor: { enrichers: [] } } );
    vi.stubGlobal( "Roll", { validate } );
    vi.stubGlobal( "_loc", key => key === "ED.Journal.TextEnricher.step" ? "Step" : "Click to roll" );
    vi.stubGlobal( "document", {
      body:          { addEventListener: vi.fn( ( type, listener ) => { rollAction = listener; } ) },
      createElement: vi.fn( tag => ( { tagName: tag, dataset: {}, append: vi.fn() } ) ),
    } );
    registerCustomEnrichers();
    enricher = CONFIG.TextEditor.enrichers[0];
  } );

  afterEach( () => {
    vi.unstubAllGlobals();
  } );

  it.each( [
    [ "@Roll( /s 13)(Damage)", 13, "(1d12+1d10)", "Damage", "arbitrary" ],
    [ "@Roll( /s 13)(Acid Damage)", 13, "(1d12+1d10)", "Acid Damage", "arbitrary" ],
    [ "@Roll(/s 10)(Action)", 10, "(2d8)", "Action", "arbitrary" ],
    [ "@Roll(/s 10)(Effect)", 10, "(2d8)", "Effect", "arbitrary" ],
    [ "@Roll(/s 10)(Damage)(damage)", 10, "(2d8)", "Damage", "effect" ],
    [ "@Roll(/s 10)", 10, "(2d8)", "", "arbitrary" ],
    [ "@Roll(/s 10 )", 10, "(2d8)", "", "arbitrary" ],
    [ "@Roll(/s 1)", 1, "(1d4-2)", "", "arbitrary" ],
    [ "@Roll(/s 25)", 25, "(1d20+2d12)", "", "arbitrary" ],
    [ "@Roll(/s 10 + 3)", 10, "(2d8) + 3", "", "arbitrary" ],
    [ "@Roll(/s 10 + 0)", 10, "(2d8) + 0", "", "arbitrary" ],
    [ "@Roll(/s 10 + 3 + 4 - 2)", 10, "(2d8) + 3 + 4 - 2", "", "arbitrary" ],
    [ "@Roll(/s 10 - 2 + 1d6)", 10, "(2d8) - 2 + 1d6", "", "arbitrary" ],
    [ "@Roll(/s 9 * 2)", 9, "(1d8+1d6) * 2", "", "arbitrary" ],
    [ "@Roll(/s 10 + (3 * (2 + 1)))", 10, "(2d8) + (3 * (2 + 1))", "", "arbitrary" ],
    [ "@Roll(/s 14)(Falling damage)", 14, "(2d12)", "Falling damage", "arbitrary" ],
    [ "@Roll( /s 13 + 1 )(Acid Damage)(damage)", 13, "(1d12+1d10) + 1", "Acid Damage", "effect" ],
    [ "@Roll(/s 10 + 3 + 2)(Attack!)(action)", 10, "(2d8) + 3 + 2", "Attack!", "action" ],
    [ "@Roll(/s 10)(Healing)(effect)", 10, "(2d8)", "Healing", "effect" ],
    [ "@Roll(/s 10)()(damage)", 10, "(2d8)", "", "effect" ],
    [ "@Roll(/s 10)(damage)", 10, "(2d8)", "damage", "arbitrary" ],
    [ "@rOlL(/S 10 + 2) (Damage: \u2603 50%!) (DAMAGE)", 10, "(2d8) + 2", "Damage: \u2603 50%!", "effect" ],
  ] )( "enriches and rolls the complete expression in %s", async ( text, step, formula, flavor, testType ) => {
    const match = text.matchAll( enricher.pattern ).next().value;
    expect( match?.[0] ).toBe( text );
    const link = await enricher.enricher( match, {} );
    expect( link.dataset ).toEqual( { rollCmd: match.groups.rollCmd.trim(), rollFlavor: flavor, testType } );
    const label = link.append.mock.calls[0][1];
    expect( label ).not.toContain( "undefined" );
    if ( flavor ) expect( label ).toContain( flavor );

    const event = { target: { closest: vi.fn( () => link ) }, stopPropagation: vi.fn() };
    await rollAction( event );

    expect( ROLLS.testTypes[testType] ).toBeDefined();
    expect( validate ).toHaveBeenLastCalledWith( formula );
    expect( EdRollOptions ).toHaveBeenCalledWith( {
      step: { base: step }, chatFlavor: flavor, testType,
    } );
    expect( EdRoll ).toHaveBeenCalledWith( formula, {}, expect.any( EdRollOptions ) );
    expect( toMessage ).toHaveBeenCalledOnce();
    expect( event.stopPropagation ).toHaveBeenCalledOnce();
  } );

  it.each( [
    [ "/s 10 + 3 + 4 - 2", "+3+4-2" ],
    [ "/s 10 - 2 + 1d6", "-2+1d6" ],
  ] )( "keeps every modifier when clicking %s", async ( rollCmd, modifiers ) => {
    const dataset = { rollCmd, rollFlavor: "Damage", testType: "effect" };
    await rollAction( { target: { closest: () => ( { dataset } ) }, stopPropagation: vi.fn() } );

    const [ formula ] = EdRoll.mock.calls[0];
    expect( formula.replaceAll( /\s/g, "" ) ).toContain( modifiers );
    expect( EdRollOptions ).toHaveBeenCalledWith( {
      step: { base: 10 }, chatFlavor: "Damage", testType: "effect",
    } );
  } );
  it( "keeps description markup and quotes as text", async () => {
    const text = "@Roll(/s 10)(<img src=\"x\"> & \"damage\")";
    const match = text.matchAll( enricher.pattern ).next().value;
    const link = await enricher.enricher( match, {} );

    expect( link.dataset.rollFlavor ).toBe( "<img src=\"x\"> & \"damage\"" );
    expect( link.append.mock.calls[0][1] ).toContain( "<img src=\"x\"> & \"damage\"" );
    expect( document.createElement.mock.calls.map( ( [ tag ] ) => tag ) ).toEqual( [ "a", "i" ] );
    expect( link.innerHTML ).toBeUndefined();
  } );

  it( "leaves a rejected complete expression unenriched", async () => {
    validate.mockReturnValue( false );
    const text = "@Roll(/s 10 + 3 + invalid)(Damage)(damage)";
    const match = text.matchAll( enricher.pattern ).next().value;

    expect( match[0] ).toBe( text );
    expect( await enricher.enricher( match, {} ) ).toBeNull();
    expect( validate ).toHaveBeenCalledWith( "(2d8) + 3 + invalid" );
    expect( document.createElement ).not.toHaveBeenCalled();
  } );

  it.each( [ "/s 0", "/s 9007199254740992", "/s 10 trailing text", "/s 10d6" ] )(
    "does not roll an invalid step command %s", async rollCmd => {
      const link = { dataset: { rollCmd } };
      await rollAction( { target: { closest: () => link }, stopPropagation: vi.fn() } );

      expect( EdRoll ).not.toHaveBeenCalled();
    }
  );

  it( "validates again when a link is clicked", async () => {
    validate.mockReturnValue( false );
    const link = { dataset: { rollCmd: "/s 10 + invalid" } };
    await rollAction( { target: { closest: () => link }, stopPropagation: vi.fn() } );

    expect( EdRoll ).not.toHaveBeenCalled();
    expect( toMessage ).not.toHaveBeenCalled();
  } );

  it( "ignores clicks outside journal roll links", async () => {
    const event = { target: { closest: vi.fn( () => null ) }, stopPropagation: vi.fn() };
    await rollAction( event );

    expect( EdRoll ).not.toHaveBeenCalled();
    expect( event.stopPropagation ).not.toHaveBeenCalled();
  } );

  it( "keeps separate roll links and following text separate", async () => {
    const text = "First @Roll(/s 10)(Hit)(action), then @Roll(/s 14 + 2)(Burn)(damage).";
    const matches = Array.from( text.matchAll( enricher.pattern ) );

    expect( matches.map( match => match[0] ) ).toEqual( [
      "@Roll(/s 10)(Hit)(action)", "@Roll(/s 14 + 2)(Burn)(damage)",
    ] );
  } );
} );
