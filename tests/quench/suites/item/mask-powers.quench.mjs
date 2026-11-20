/**
 * Test Instructions
 * Switch a mask between edit and play modes, then save changes to a power and a mask field.
 * Check that both changes are saved, no extra power appears, and an unknown power can be removed
 * using the sheet's delete action without removing the linked power.
 */

import { getSetting, setSetting } from "../../../../module/helpers/settings.mjs";
import { deleteDocuments } from "../../helpers/cleanup.mjs";

/**
 * Registers tests for editing mask powers.
 * @param {object} context The Quench test context.
 * @param {Function} context.describe Registers a suite.
 * @param {Function} context.it Registers a test.
 * @param {Function} context.expect Asserts a result.
 */
export default ( { describe, it, expect } ) => {
  describe( "Editing a mask with linked powers", () => {
    it( "preserves linked powers when saving and deleting an unknown power", async () => {
      const power = await Item.create( { name: "Test Power", type: "power" } );
      const quickDeleteSetting = "quickDeleteEmbeddedOnShiftClick";
      const quickDelete = getSetting( quickDeleteSetting );
      let mask;
      let sheet;

      try {
        mask = await Item.create( {
          name:   "Test Mask",
          type:   "mask",
          system: {
            powers: {
              storedPower:  { uuid: power.uuid, step: 2 },
              unknownPower: { step: 3 },
            },
          },
        } );

        sheet = mask.sheet;
        await sheet.render( { force: true } );
        for ( const checked of [ true, false, true ] ) {
          const toggle = sheet.element.querySelector( ".mode-slider" );
          expect( toggle ).to.exist;
          toggle.checked = checked;
          await sheet._onChangeSheetMode( { currentTarget: toggle } );
          await sheet.render();
        }

        const powerStep = sheet.element.querySelector( "input[name='system.powers.storedPower.step']" );
        expect( powerStep ).to.exist;
        powerStep.value = "5";
        await sheet.submit();
        await sheet.render();

        const damageStep = sheet.element.querySelector( "input[name='system.damageStep']" );
        expect( damageStep ).to.exist;
        damageStep.value = "6";
        await sheet.submit();
        await sheet.render();

        expect( mask.system.damageStep ).to.equal( 6 );
        expect( Object.keys( mask.system.powers ) ).to.have.members( [ "storedPower", "unknownPower" ] );
        expect( mask.system.powers.storedPower.uuid ).to.equal( power.uuid );
        expect( mask.system.powers.storedPower.step ).to.equal( 5 );

        const removeUnknown = sheet.element.querySelector( "[data-power-key='unknownPower'][data-action='deleteChild']" );
        expect( removeUnknown ).to.exist;
        try {
          if ( !quickDelete ) await setSetting( quickDeleteSetting, true );
          const shiftClick = new MouseEvent( "click", { shiftKey: true } );
          await sheet.options.actions.deleteChild.call( sheet, shiftClick, removeUnknown );
        } finally {
          if ( !quickDelete ) await setSetting( quickDeleteSetting, quickDelete );
        }

        expect( Object.keys( mask.system.powers ) ).to.deep.equal( [ "storedPower" ] );
        expect( mask.system.powers.storedPower.uuid ).to.equal( power.uuid );
        expect( mask.system.powers.storedPower.step ).to.equal( 5 );
      } finally {
        await sheet?.close();
        await deleteDocuments( mask, power );
      }
    } );
  } );
};
