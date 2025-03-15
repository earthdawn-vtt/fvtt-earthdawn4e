# Settings

the following chapter will describe all system settings

## General Settings

### Step Tables 

this system setting defines which step Tables are used

default: fourth edition

options: 

Affects: World

## Earthdawn Ids (ED-ID)

The ED-ID settings define identifier throughout the system. Each Item has an ED-ID field where one of these ids can be entered. The ED ID is used to identify items relevant for specific workflows or actions (e.g. "thread-weaving" identifies an thread weaving talent ). 

### List of ED-IDs:

#### Thread Weaving

default: thread-weaving

Related Workflow: Thread Weaving including weaving threads to patterns and spellcasting

#### Spellcasting

default spellcasting

Related Workflow: spellcasting workflow

#### Patterncraft

default patterncraft

Related Workflow: Learn new spells, Define max number of Spell knacks

#### Speak Language

default language-speak

Related Workflow: defines available languages for speaking

#### Read- and Write Language

default language-rw

Related Workflow: defines available languages for read and write

#### Versatility

default versatility

Related Workflow: defines the available amount of versatility talents

#### Questor Devotion

default questor-devotion

Related Workflow: a specific devotion which is linked to the questor rank

#### unarmed combat

default unarmed-combat

Related Workflow: identifies an ability to be used for unarmed combat attacks.

## Character Generation

These settings define options and values used for the Character Generation

### Automatically open Character Generation

if this setting is active (true) the character generation will be triggered if a new actor of type Character is created.

default: true

options: false

Affects: World

### Attribute Points

This setting allows the Game master to increase or reduce the available starting points for the Attributes. The maximum and minimum are not changed.

default: 25

options: any Number

Affects: World

### Max Ranks

This setting defines the maximum Rank a Talent, devotion or Skill might have during character generation.

default: 3

options: any Number

Affects: World

### Max Spell Circle

This setting defines the maximum Circle of Spells a spellcaster can choose from during character generation.

default: 2

options: any Number

Affects: World

## Game Mechanics

### Enforce living Armor

Some Namegiver (Obsidianer and Leafers) can only wear living armor. If this system setting is set to true it will not be possible for Actors with a Namegiver which has this set to active. 

default: true

options: false

Affects: World

### Use Encumbrance

this setting allows to turn of encumbrance in the game. Turning it off will ignore negative effects from heavy equipments.

default: true

options: false

Affects: World

### Languages

The game master can enter any language which shall be used in the game, this can include dialects as well. adding a new language is done by typing the Language name and pressing enter. Languages can also be removed (pressing the x on the language)

default: dwarven, sperethial, human, obsidimen, or'zet, troll, t'skrang, windling

options: any language

Affects: World

### Spellcasting Types

This setting defines the spellcasting types available in the game. For homebrew purposes this can be extended by entering another spellcasting type.

default: elementalist, illusionist, nethermancer, shaman, wizard

options: any 

Affects: World

### Talent Split

This setting automatically devides all talents based on their category (discipline, optional, others and versatility)

default: true

options: false

Affects: World

### minimum Difficulty

The rules define that every action roll as a minimum difficulty. The value of it is set in this setting

default: 2

options: any Number

Affects: World

### Chat Avatar

This setting allows the game master to show the selected token or configured avatar on each role that user is doing. 

default: configured Avatar

options: selected Token

Affects: World

## LP Tracking

### Use Legend point tracking

If this setting is active, LP tracking will be used for character progress. It is adviced to keep it or change it with care, since the lp tracking will only take place if it is active.

default: true

options: false

Affects: World

### Attribute Rules

There are three options to handle the LP tracking for Attributes described in the Players Guide.

default: Spend LP 

options: 
- one Attribute increase for free per circle of the main discipline.
- one Attribute increase for LP per circle of the main discipline.

Affects: World

### Talents required for advancing discipline circles

The players guide has two options available to choose from. There is an additional (House rule) available. The first two options are described in the players guide. the third option requires a number of talents to be at a certain rank equal to the new circle, with one of those talents to be of the previous circle. This house rule is similar to the Option "all talents to advance" but has a linear raise throughout all circles for the min Talent Rank.

default: Discipline Talents

options: 
- All talents to advance
- All Talents house rule (see above)

Affects: World

### Automatically remove Silver 

This setting will reduce the mentioned amount of Silver from the Actor if one is required (increase circle, learn spells and knacks). If the actor does not have enough silver it will remove all availabel silver. 

default: true

options: false

Affects: World

### maximum Talent Rank

This setting sets the limit to Talent Ranks

default: 15

options: any number

Affects: World

### maximum Devotion Rank

This setting sets the limit to Talent Ranks

default: 12

options: any number

Affects: World

### maximum Skill Rank

This setting sets the limit to Talent Ranks

default: 10

options: any number

Affects: World

### LP Cost for learning spells

if this setting is active, learning a new spell will cost legend points

default: LP cost = Circle = novice Tier Talent Rank (100, 200, 300, 500 etc.)

options: 
- circle * 100
- free

Affects: World

### Use patterncraft to learn new spells

If this setting is active, a successful patterncraft (talent with the ed-id patterncraft) is required to learn a spell.

default: true

options: false

Affects: World

### learn a free spell on advancing a Discipline circle

if this setting is active, one spell can be learned during the advancement of circles.

default: true

options: false

Affects: World
