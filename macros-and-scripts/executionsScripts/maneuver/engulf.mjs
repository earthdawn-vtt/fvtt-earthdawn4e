/**
 * Execution Script for Active Effect - Engulf Maneuver Damage
 *
 * This script triggers a full damage workflow with a fixed step damage roll.
 * 
 * CONFIGURATION OPTIONS:
 * - step: The base damage step (1-20+)
 * - chatFlavor: Flavor text displayed in the chat message
 * - damageSourceType: Type of damage source (e.g., "arbitrary", "power", "spell", "weapon")
 * - armorType: Type of armor protection ("physical", "mystical", or "" for none)
 * - damageType: Type of damage applied ("standard" or "stun")
 * - ignoreArmor: Boolean to bypass armor protection entirely
 * - naturalArmorOnly: Boolean to only consider natural armor
 */

( async () => {
  const { CombatDamageWorkflow } = await import( "/systems/ed4e/module/workflows/workflow/_module.mjs" );
  const DamageRollOptions = ( await import( "/systems/ed4e/module/data/roll/damage.mjs" ) ).default;

  // ============ CONFIGURATION ============
  const actor = parent.actor ?? parent;
  const step = 14; // Base damage step
  const chatFlavor = "Engulf Maneuver Damage"; // Display text in chat
  const damageSourceType = "arbitrary"; // Damage source type
  const armorType = "physical"; // "physical", "mystical", or "" (none)
  const damageType = "standard"; // "standard" or "stun"
  // const ignoreArmor = true; // Uncomment to bypass armor
  // const naturalArmorOnly = true; // Uncomment to only use natural armor
  // =======================================

  const damageWorkflow = new CombatDamageWorkflow( actor, {
    sourceDocument: parent,
    rollToMessage:  true,
  } );

  // Override roll options to force fixed damage step without actor modifiers
  damageWorkflow._steps[0] = ( async function () {
    this._rollOptions = DamageRollOptions.fromData( {
      chatFlavor,
      damageSourceType,
      armorType,
      damageType,
      step: {
        base:      step,
      },
      sourceDocument: parent,
      karma:          { pointsUsed: 0, available: 0, step: 4 },
      devotion:       { pointsUsed: 0, available: 0, step: 3 },
    } );
  } ).bind( damageWorkflow );

  await damageWorkflow.execute();
} )();