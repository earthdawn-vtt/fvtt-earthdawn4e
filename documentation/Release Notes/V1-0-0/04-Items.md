# Items

## General information

all Items have the same structure with an image, the item name and the item description on top of the sheet. The lower part of the sheet starts with a navigator with at least a **General**, a **Details** and an **Effects** tab. Every item has the **Description** on the general tab and the **ED-ID** field on the details tab in addition to any other fields.

The Earthdawn system supports the following items types:
- physical items 
  - armor
  - Equipment
  - Shields
  - Weapons
- Knacks
  - abilities knacks
  - karma knacks
  - special maneuver knacks
- Vocations
  - disciplines
  - Questors
  - paths
- spell items
  - spells
  - spell knacks
  - binding secrets
- effects
- curses / Horror marks
- Abilities
  - devotions
  - skills
  - talents
- masks
- Namegiver
- poison / diseases
- ship weapons
- special abilities
- threads
- creature powers
  - Powers
  - Maneuvers

**Note:** Matrices are not a separate item type like they where in the previous system, but are either a talent or a physical item.

all Items will be described below in a separate chapter.

### ED-ID

the ED-ID or Earthdawn id is used as identifier. There are several entries in the System Settings for identifiers (ED-ID). If the identifier from the setting (e.g. *thread-weaving*) is noted down in the ED-ID field of an ability, this ability will be identified as thread weaving talent and the system can trigger based on these ids different workflows. For a complete list of all ED-IDs please see the settings section.

## Physical Items

### General information

All Physical items (armor, equipment, shields and weapons) have the following data values in common:
- cost (together with the denomination)
- weight
- availability
- description

#### equipment state

Besides the self explaining values, every physical item (armor, equipment, shield or weapon) has a status which defines the equipped state. the following states are possible:

- owned
- carried
- equipped
- main hand
- off hand
- two hands
- tail

armor, equipment and shields have the first three status options available, where the equipped status triggers calculations for:

- encumbrance
- Armor
- defense
- initiative

weapons on the other hand have all 7 states available. the 7th status is limited only to namegivers with a tail though. based on the equipped status for the weapon, this weapon will be used for attack (or similar actions) which require a weapon. Melee weapons for example will check if there is a two handed weapon, if not it will take the main hand equipped weapon to attack. Second weapon on the other hand can only work if there is a weapon in the off hand etc.

some items might be carried together with other items, this will be explained in detail on their particular section (see below)

the equipment status can be changed using several mouse click options.

left-click & right-click (change the item status up or down one position) 
shift-left-click (change the item status to carried)
middle-click (change the item status to owned)

#### Usable items

Items can be actually used like healing potions to provide some bonus to a specific action triggered by this item. Therefore every item has the option in the details tab to become a usable item. Usable items have the following additional data fields:

- arbitrary step
- action type
- Recovery parameter (used for healing potions or abilities requireing a recovery test)

in addition, all items except weapons (they have thes values by default) the target data fields become available:

- target defense
- fixed difficulty
- group difficulty setting

#### Weight Modifier

all all owned physical itms also have an option to modify its weight based on the **weight modifier** of the namegiver item. This option will change the item by adding the name of the namegiver behind the current name in brackets and multiply the current weight with the weight modifier of the namegiver item. This option can only be activated once (a Game master has the option to rest it though).

#### Blood Magic Damage

all phyiscal Items can cause blood magic damage (see blood magic damage for further information). 
### Armor

Every Actor can wear one piece of armor at any given time. Wearing Armor affects initiative, physical armor and mystical armor. Armor items have the following data fields:
- phyiscal armor
- mysticla armor
- physical armor forge bonus
- mystical armor forge bonus
- initiative penalty
- 

#### Piecemeal Armor

usually only one set of armor can be worn at any given time. This does not count for piecemeal armor. For a piecemeal armor there there is a setting in the details tab showing **piecemeal armor** and if this is checked, another field appears for the piecemeal armor size (which can range from one to three). any Actor can carry only one piece of piecemeal armor of the same size, and no more than a total of the added size of 5

#### Living Armor

Namegiver with the **living armor only** option checked will not be able to equip armor without the option **living** (this check is a system setting)

### Equipment

#### Ammunition

### Shields

Every Actor can wear one shield at any given time. Wearing Shield affects initiative, physical defense and mystical defense.

#### Shields and Bows

some shields can be carried together with bows, even though bows are considered a to be two handed. an option in the details tab **bow usage** enables this feature

#### Living Shields

Namegiver with the **living armor only** option checked will not be able to equip shields without the option **living** (this check is a system setting)

### Weapons

Every Actor can carry only one weapon at the time in his main hand (this includes two handed weapons), one in this off hand and maybe another one attached to his tail. Off hand weapons cannot be carried together with a two handed weapon of course.

Weapons have the following data fields available on the general tab (besides the description):
* Size. This value is responsible for the possible equipment state the weapon can be used with.

#### Tail Weapons

Tail weapons are restricted to weapons of size 1 or 2. In addition to the size, this option is only available for Actors with a namegiver with the **tail attack** option checked.

#### Bows and Crossbows

Bows and crossbows always count as two handed weapons, therefore they are handled like a two handed weapon regardless of their size.

## Knacks

### abilities knacks

### karma knacks

### special maneuver knacks

## Vocations

All vocation items contain an additional tab **advancement** which holds all information about the different optional abilities and the information of each circle / rank.

### disciplines 

Disciplines are the main vocation in Earthdawn. They are the only vocation with a Durability value. In addition the circle of the discipline is taken into account for the calculation of several data like karma or legend point cost of talents.

### Questors

Questor are another vocation similar to Disciplines, but they do not provide durability by default. The questor rank is used for the caluclation of the maximum devotion points

### paths

Paths are the third vocation which relys heavy on the roleplaying aspect. From the game persepctive it only provides some additional abilities and characteristic bonuses.

## spell items

### spells

### spell knacks

### binding secrets

## effects

## curses / Horror marks

## Abilities

all abilities share a set of data fields which are available on the general tab (besides description):
- rank
- strian
- attribute
- action
- tier

  ### devotions

  devotions are the abilities of questors. They work similar to other abilities but have a maximum of 12 ranks and might require the usage of a devotion point.

  ### skills

  Skills are none-mystical abilities. They work similar to other abilities but have a maximum of 10 ranks.

  ### talents

  Talents are the abilities of adepts. They work similar to other abilities with a maximum of 15 ranks. in addtion to the standard ability values, talents have a value for talent category (discipline, optional etc.)

## masks

## Namegiver

Characters and NPC actors can have an item of type namegiver to resemble their Namegiver Race. The Namegiver item has several data fields on the general tab besides the description:
* Attribute values (one for each attribute), these are responsible for the base attributes used during the <span style="color: red;">Character Generation<span>
* movement values (only those for available movement shall be filled)
* Weapon size (one hand minimum, one hand maximum, two hand minimum and two hand maximum)
* karma modifier

the details tab offers the following information which are more game mechanic related.
* weight modifier
* tail (yes / no)
* living armor only (yes / no)

## poison / diseases

## ship weapons

## special abilities

## threads

## creature powers

  ### Powers

  ### Maneuvers
