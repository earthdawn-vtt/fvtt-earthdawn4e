import { expect, test } from "vitest";
import { get3eDice } from "../../../../module/dice/step-tables.mjs";

test( "step 5 returns '1d8' in 3e", () => {
  expect( get3eDice( 5 ) ).toBe( "1d8" );
} );