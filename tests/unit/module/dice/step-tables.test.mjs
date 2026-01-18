import { describe, expect, it, } from "vitest";
import { get3eDice } from "../../../../module/dice/step-tables.mjs";

describe( "3rd edition step table", () => {

  it.for( [
    { step: 1, expected: "1d6 - 3" },
    { step: 5, expected: "1d8" },
    { step: 100, expected: "13d12 + 1d8 + 1d6" },
  ] )( "returns correct dice for steps in the range of [1;100]: $step => $expected", ( { step, expected } ) => {
    expect( get3eDice( step ) ).toBe( expected );
  } );

  it.each( [
    -1,
    0,
    101,
    150,
  ] )( "throws an error for steps outside the range of [1;100]: %i", ( step ) => {
    const errorMessageRegex = /(?=.*step)(?=.*1)(?=.*100)/i ;
    expect( () => get3eDice( step ) ).toThrow( errorMessageRegex );
  } );

} );
