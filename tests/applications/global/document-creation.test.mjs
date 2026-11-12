// cspell:ignore unstub
/* eslint-disable jsdoc/require-jsdoc -- Test doubles do not expose a public API. */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { CharacterGenerationData, waitPrompt, createActor, getSetting, confirm } = vi.hoisted( () => {
  vi.stubGlobal( "foundry", {
    applications: { api: {
      ApplicationV2:              class {},
      HandlebarsApplicationMixin: base => base,
      DialogV2:                   { confirm: vi.fn() },
    } },

    utils: { expandObject: data => ( { ...data } ), mergeObject: ( base, data ) => ( { ...base, ...data } ) },
  } );
  foundry.applications.ux = { FormDataExtended: class { constructor( form ) { this.object = { ...form.values }; } } };
  return {
    CharacterGenerationData: vi.fn( function( data ) { Object.assign( this, data ); } ),
    waitPrompt:              vi.fn(),
    createActor:             vi.fn(),
    getSetting:              vi.fn(),
    confirm:                 foundry.applications.api.DialogV2.confirm,
  };
} );

vi.mock( "../../../module/data/actor/templates/namegiver.mjs", () => ( {
  default: class { static LOCALIZATION_PREFIXES = []; static metadata = {}; },
} ) );
vi.mock( "../../../module/data/other/character-generation.mjs", () => ( { default: CharacterGenerationData } ) );
vi.mock( "../../../module/applications/actor/character-generation-prompt.mjs", () => ( { default: { waitPrompt } } ) );
vi.mock( "../../../module/documents/actor.mjs", () => ( { default: { create: createActor } } ) );
vi.mock( "../../../module/data/advancement/lp-tracking.mjs", () => ( { default: class {} } ) );
vi.mock( "../../../module/applications/global/prompt-factory.mjs", () => ( { default: {} } ) );
vi.mock( "../../../module/applications/api/dialog.mjs", () => ( { default: {} } ) );
vi.mock( "../../../module/helpers/settings.mjs", () => ( { getSetting } ) );
vi.mock( "../../../module/helpers/document.mjs", () => ( { getSingleGlobalItemByEdid: vi.fn() } ) );
vi.mock( "../../../module/helpers/earthdawn.mjs", () => ( {
  getArmorValueFromAttribute: vi.fn(), getAttributeStepFromValue: vi.fn(), getDefenseValueFromAttribute: vi.fn(),
} ) );
vi.mock( "../../../module/config/actors.mjs", () => ( {} ) );
vi.mock( "../../../module/config/document-data.mjs", () => ( {} ) );
vi.mock( "../../../module/config/items.mjs", () => ( {} ) );
vi.mock( "../../../module/config/legend.mjs", () => ( {} ) );

import DocumentCreateDialog from "../../../module/applications/global/document-creation.mjs";
import PcData from "../../../module/data/actor/pc.mjs";

// Foundry owns model validation and rendering; exercise the production dialog-to-wizard handoff here.
describe( "Actor creation name handoff", () => {
  let dialog;
  let event;
  let implementation;

  beforeEach( () => {
    vi.clearAllMocks();
    waitPrompt.mockResolvedValue( null );
    confirm.mockResolvedValue( true );
    getSetting.mockReturnValue( true );
    implementation = vi.fn( function( data ) { this.toObject = () => ( { ...data } ); } );
    implementation.defaultName = vi.fn( () => "New Character" );
    implementation.create = vi.fn().mockResolvedValue( {} );
    dialog = {
      createData:          { name: "Stale name", type: "character" },
      form:                { values: { name: "Bob", type: "character" } },
      _updateCreationData: data => data,
      documentCls:         { implementation },
      resolve:             vi.fn(),
      close:               vi.fn(),
    };
    event = { preventDefault: vi.fn(), stopPropagation: vi.fn(), stopImmediatePropagation: vi.fn() };
  } );

  afterAll( () => { vi.unstubAllGlobals(); } );

  it( "reads the current form name instead of the stale creation cache", async () => {
    await DocumentCreateDialog._createDocument.call( dialog, event );

    expect( CharacterGenerationData ).toHaveBeenCalledWith( { name: "Bob" } );
    expect( waitPrompt.mock.calls[0][0] ).toBeInstanceOf( CharacterGenerationData );
    expect( waitPrompt.mock.calls[0][0].name ).toBe( "Bob" );
    expect( implementation.create ).not.toHaveBeenCalled();
    expect( dialog.close ).toHaveBeenCalledOnce();
  } );

  it( "passes the normal default name when the actor name is blank", async () => {
    dialog.form.values.name = "";
    await DocumentCreateDialog._createDocument.call( dialog, event );

    expect( waitPrompt.mock.calls[0][0].name ).toBe( "New Character" );
  } );

  it.each( [ "declined", "disabled" ] )( "keeps normal actor creation when the wizard is %s", async ( mode ) => {
    confirm.mockResolvedValue( false );
    getSetting.mockReturnValue( mode === "declined" );
    await DocumentCreateDialog._createDocument.call( dialog, event );

    expect( implementation.create ).toHaveBeenCalledWith( dialog.form.values, { renderSheet: true } );
    expect( waitPrompt ).not.toHaveBeenCalled();
  } );

  it( "leaves model defaults available when generation is started directly", async () => {
    await PcData.characterGeneration();

    expect( waitPrompt ).toHaveBeenCalledOnce();
    expect( waitPrompt.mock.calls[0][0]?.name ).toBeUndefined();
  } );

  it( "does not create an actor when the wizard is canceled", async () => {
    expect( await PcData.characterGeneration( { name: "Bob" } ) ).toBeUndefined();
    expect( createActor ).not.toHaveBeenCalled();
  } );
} );
