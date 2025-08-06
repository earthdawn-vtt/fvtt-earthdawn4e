# V0.8.2 Migration Module

This folder contains all migration logic for converting documents from the legacy earthdawn4e system (v0.8.2 era) to the current ed4e system structure.

## Files

### `type-transformations.mjs`
Handles all type transformations from earthdawn4e-legacy to ed4e types:
- **Simple type mappings**: Direct 1:1 type transforms (e.g., `armor` → `armor`, `pc` → `character`)
- **Complex type logic**: Context-dependent transformations based on system properties
  - `discipline` → `discipline`/`path`/`questor` (based on `discipline` property)
  - `knack` → `knackAbility`/`knackKarma`/`knackManeuver`/`spellKnack` (based on `knackType` property)
  - `attack` → `maneuver`/`power` (based on `powerType` property)
  - `creature`/`npc` → `creature`/`dragon`/`horror`/`spirit`/`trap`/`npc` (based on `actorType` property)

### `document-migrations.mjs`
Main coordinator for all document migrations:
- **Legacy structure cleanup**: Converts old `.data` structure to `.system`
- **Field migration coordination**: Orchestrates field-level migrations
- **Document-type migration coordination**: Orchestrates document-type-specific migrations
- **Type-specific transformations**: Handles major type changes (spellmatrix → talent, etc.)
- **Data preservation**: Maintains original data for reference and debugging

### `field-migrations/`
Contains individual field migration classes for specific field transformations:
- `action.mjs` - Action field are slugified
- `attribute.mjs` - Attribute field migrations
- `description.mjs` - Description field transformations
- `difficulty.mjs` - Difficulty field migrations
- `level.mjs` - Level field transformations
- `tier.mjs` - Tier field migrations
- `availability.mjs` - Availability field migrations
- `price.mjs` - Price field transformations
- `weight.mjs` - Weight field migrations
- `usable-items.mjs` - Usable items field migrations
- `knack-restriction.mjs` - Knack restriction field migration (restriction → restrictions array)

### `document-type-migrations/`
Contains complex document-type-specific migration classes:

#### `document-type-migrations/item/`
Item-type-specific migration classes:
- `armor.mjs` - Armor-specific migrations (image migration, etc.)
- `weapon.mjs` - Weapon-specific migrations (subtype detection, ammunition setup, etc.)
- `discipline.mjs` - Discipline-specific migrations (advancement structure creation, tier mapping, talent parsing)
- `talent.mjs` - Talent-specific migrations (image migration, etc.)
- `spell.mjs` - Spell-specific migrations (image migration, etc.)
- `matrix.mjs` - Spell matrix-specific migrations (spellmatrix → talent transformation)
- `knack.mjs` - Knack-specific migrations (type transformation, image migration, restriction handling)
- `power.mjs` - Power-specific migrations (image migration, etc.)
- `devotion.mjs` - Devotion-specific migrations (image migration, etc.)
- `equipment.mjs` - Equipment-specific migrations (image migration, etc.)
- `mask.mjs` - Mask-specific migrations (image migration, etc.)
- `namegiver.mjs` - Namegiver-specific migrations (image migration, etc.)
- `shield.mjs` - Shield-specific migrations (image migration, etc.)
- `skill.mjs` - Skill-specific migrations (image migration, etc.)
- `reputation.mjs` - Reputation-specific migrations
- `image.mjs` - Shared image migration utility (replaces earthdawn4e paths with generic icons)
- `abilities.mjs` - Abilities-specific migrations
- `defenses.mjs` - Defenses-specific migrations
- `edid.mjs` - EDID-specific migrations
- `roll-type-Migration.mjs` - Roll type migration utility

#### `document-type-migrations/actor/`
Actor-type-specific migration classes:
- `character.mjs` - Character-specific migrations (pc → character)
- `none-character.mjs` - Non-character actor migrations (npc, creature)

## Migration Flow

1. **Type Transformation** (via `TypeTransformationManager`)
   - Simple type mappings applied first
   - Complex type logic for context-dependent transformations
   
2. **Document Migration** (via `MigrationManager`)
   - Legacy structure cleanup (`.data` → `.system`)
   - **Field-level migrations** (using classes in `field-migrations/`)
   - **Document-type migrations** (using classes in `document-type-migrations/`)
   - **Type-specific transformations** (major type changes)
   - Metadata addition

## Migration Order

For each document being migrated:
1. **Field migrations** - Applied to all documents regardless of type
2. **Document-type migrations** - Applied based on original document type
3. **Type-specific transformations** - Major type changes with data restructuring

## Integration

- Type transformations are registered with `TypeTransformationManager` during system initialization
- Document migrations are registered with `MigrationManager` for both Items and Actors
- Field migrations and document-type migrations are coordinated through `document-migrations.mjs`
- All managers are initialized through `initializeMigrations()` called during the system's `init` hook
- Image migration utility provides consistent replacement of old earthdawn4e image paths across all item types

## Usage

This module is automatically loaded and registered when the ed4e system initializes via the `init` hook. No manual intervention is required - migrations are triggered automatically when Foundry detects documents from the earthdawn4e-legacy system.

## Key Features

- **Comprehensive image migration**: All old earthdawn4e image paths replaced with generic bag icons
- **Advanced discipline migration**: Complete conversion of legacy disciplines to new advancement system with 15 levels, tier mapping, and talent parsing
- **Flexible knack handling**: Supports both original `knack` type and pre-transformed knack types (`knackKarma`, `knackAbility`, etc.)
- **Robust validation**: Handles edge cases like undefined restrictions arrays and invalid data types
- **Debug logging**: Comprehensive logging system for troubleshooting migration issues
