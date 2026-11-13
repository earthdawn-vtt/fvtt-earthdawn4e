// Test Instructions
// Simulate selecting and deselecting spells without running Foundry, then check that
// the choices survive navigation and are passed on when advancement is completed.

/* eslint-disable jsdoc/require-jsdoc -- Test doubles do not expose a public API. */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted( () => {
  vi.stubGlobal( "foundry", {
    applications: { api: { ApplicationV2: class { static _appId = 0; } } },
    utils:        { expandObject: data => data, isEmpty: value => !value?.length },
  } );
} );

vi.mock( "../../../module/applications/api/application.mjs", () => ( {
  default: class {
    async _prepareContext() { return {}; }
    render = vi.fn();
    close = vi.fn();
  },
} ) );
vi.mock( "../../../module/data/item/templates/class.mjs", () => ( { default: class {} } ) );
vi.mock( "../../../module/applications/global/prompt-factory.mjs", () => ( {
  default: { continueButton: {}, completeButton: {} },
} ) );
vi.mock( "../../../module/helpers/document.mjs", () => ( { getAllDocuments: vi.fn().mockResolvedValue( [] ) } ) );
vi.mock( "../../../module/helpers/settings.mjs", () => ( { getSetting: () => true } ) );
vi.mock( "../../../module/config/system.mjs", () => ( { icons: {} } ) );

import ClassAdvancementDialog from "../../../module/applications/advancement/class-advancement.mjs";

const first = "Compendium.spells.Item.first";
const second = "Compendium.spells.Item.second";

describe( "Circle advancement spell selection", () => {
  let dialog;
  const submit = data => ClassAdvancementDialog.DEFAULT_OPTIONS.form.handler.call( dialog, {}, {}, { object: data } );

  beforeEach( () => {
    vi.stubGlobal( "CONFIG", { ED4E: {} } );
    dialog = new ClassAdvancementDialog( {
      actor:  { itemTypes: { spell: [] } },
      system: {
        hasMixin:              () => true,
        level:                 1,
        getCastingType:        async () => "wizardry",
        advancement:           { availableAbilityOptions: {}, levels: {} },
      },
    }, { resolve: vi.fn() } );
  } );

  afterAll( () => { vi.unstubAllGlobals(); } );

  it.each( [
    [ "one available checkbox", first, [ first ] ],
    [ "multiple checked spells", [ first, null, second ], [ first, second ] ],
    [ "all unchecked", [ null, false, "" ], [] ],
    [ "no available spells", undefined, [] ],
    [ "one unchecked checkbox", false, [] ],
    [ "duplicate UUIDs", [ first, first ], [ first ] ],
  ] )( "retains valid UUIDs for %s", async ( _, selectedSpells, expected ) => {
    dialog.selectedSpells.add( second );
    await submit( { selectedSpells } );
    expect( [ ...dialog.selectedSpells ] ).toEqual( expected );
    expect( dialog.render ).toHaveBeenCalledOnce();
  } );

  it( "keeps spells and the ability choice through rerendering, navigation, and completion", async () => {
    await submit( { selectedSpells: [ first, null, second ], selectedOption: "Item.ability" } );
    dialog.currentStep = 2;
    let context = await dialog._prepareContext();
    expect( context.selectedSpells ).toEqual( [ first, second ] );
    expect( [ ...context.spellsGained ] ).toEqual( [ first, second ] );
    await ClassAdvancementDialog._continue.call( dialog );
    expect( dialog.currentStep ).toBe( 3 );
    await ClassAdvancementDialog._goBack.call( dialog );
    expect( dialog.currentStep ).toBe( 2 );
    await submit( { selectedSpells: first } );
    context = await dialog._prepareContext();
    expect( context.selectedSpells ).toEqual( [ first ] );
    expect( dialog.selectedOption ).toBe( "Item.ability" );
    await ClassAdvancementDialog._complete.call( dialog );
    expect( dialog.resolve ).toHaveBeenCalledWith( {
      proceed: true, abilityChoice: "Item.ability", spells: new Set( [ first ] ),
    } );
    expect( dialog.close ).toHaveBeenCalledOnce();
  } );
} );