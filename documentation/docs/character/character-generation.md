---
title: Character Generation
group: English
category: Character
---
The Earthdawn system for Foundry VTT offers a comprehensive character generation flow to help players start quickly.

Character generation is split into multiple steps:

1. Select Namegiver
2. Select Vocation and distribute talent ranks
3. Distribute attribute points
4. Select spells (optional)
5. Distribute skill ranks
6. Select languages
7. Select starting equipment

## Requirements

To create a character in the Earthdawn system, the following requirements apply.

First, players need permission to create an actor in the world. By default, only the GM can do this. To grant this permission to players, open User Permission Configuration in Foundry VTT system settings and enable Create Actor. If the GM does not want to keep this option enabled permanently, the setting should be reset after character generation.

Warning: This permission allows players to create any number of actors, and in public worlds this must not remain enabled carelessly.

![Permission setting](../../../assets/manual/german/char-gen-permission-setting.png)

The next important requirement is that players have access (at least Observer access) to the corresponding compendium packs or items in the world. This means that automatic character generation only works when players can access the items required for it (for example Namegivers, Disciplines, Talents, Skills, Spells, and so on).

![Compendium permissions](../../../assets/manual/german/char-gen-compendium-permissions.png)

If both requirements are met, players can start character generation either from Create Actor in the Actor Directory or via the chat command `/char`.

## Character Generation Configuration (Information for GMs)

Character generation has several configurable system settings:

### Character Generation Enabled?

This configuration is enabled by default. As a result, whenever an actor of type Character is created, character generation starts automatically. If this configuration is disabled, character generation must be started manually with the chat command `/char`.

### Available Attribute Points

This setting defines how many attribute points are available during character generation. The default is 25 points, as defined in the Player's Guide.

### Maximum Ranks

This setting defines how many ranks can be distributed to talents or skills. By default, maximum rank is set to 3.

### Maximum Spell Circle

This configuration defines which spells are available during character generation by limiting spell circle. By default, the maximum circle is set to 2.

![Character generation system settings](../../../assets/manual/german/char-gen-system-settings.png)

## Character Generation in Detail

When started, a dialog opens where character generation takes place. At the bottom, buttons guide you through each step. The Finish button only becomes active once all required steps are completed. After clicking it, the dialog closes and the new actor is created.

### Namegiver

In the first step, select the character's Namegiver from the menu in the lower part of the dialog.

### Vocation

In the second step, first choose the vocation type. Should it be Adept (default) or Questor? You can switch between both options and will then see the corresponding choices (Disciplines or Questors).

#### Disciplines

If you choose Adept, you can select a Discipline. Each Discipline contains Discipline talents, optional talents, and possibly free talents. You can then distribute talent ranks to Discipline talents and one optional talent.

##### Namegiver Talents

Some Namegivers have their own talents (Humans have Versatility and Windlings have Astral Sight). These talents can receive ranks in addition to Discipline and Optional talents.

#### Questor

If you want to play a Questor, you can select one option from the available list. Then you can choose a devotion power and assign one rank to that power. The Questor devotion power is automatically created after character generation and set to rank 1.

### Attributes

In the third step, attribute points are distributed among attributes. Distribution is done via the + and - buttons beside each attribute. This also updates the character's characteristics automatically. The lower part of the dialog shows both the current value and the resulting characteristic value for each increase or decrease. Unspent attribute points are granted as bonus karma points.

### Spells

If you selected a Discipline that uses spells, this is where you choose spells. Simply click each spell to select it.

### Skills

In the next step, choose the character's skills. At least one rank must be assigned to an Artisan skill, 2 ranks to Knowledge skills, and 3 ranks to Language skills. Language skills are preselected and can only be improved, not reduced or removed. In addition, 8 free skill ranks are available for free distribution.

To distribute ranks, click the + or - icon beside each skill as in other steps.

### Languages

In the next step, determine the character's languages. You can select as many languages as you have ranks in Read and Write and Foreign Languages.

### Equipment

In the final step, you receive the character's starting equipment. These are the items corresponding to basic equipment from the Character Generation chapter of the Player's Guide. Additional equipment must be added manually after character generation.
