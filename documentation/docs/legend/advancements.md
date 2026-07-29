---
title: Advancements
group: English
category: Legend
---
# Advancements

As already mentioned in [Legend Points](../legend/legend-points.md), many character abilities can be learned or improved by spending Legend Points (LP). In addition, there are Discipline, Path, and Questor advancements that do not require Legend Points.

## Attribute Increases

Attribute increases depend on the system setting "Cost for Attribute Increase". This setting defines whether attribute increases cost Legend Points and can be done at any time, or whether one attribute point per circle can be increased (with or without Legend Points). The default setting allows increasing attributes at any time by spending Legend Points.

- The system allows a maximum of three increases per attribute.
- Attributes can be increased in Edit mode regardless of this setting. In the attribute area on the General tab, there is an arrow button next to the three increase symbols. This button opens the standard increase dialog, which shows the cost and requirements for the increase.
- After a successful increase, the new attribute value is raised by one. The number of increases is shown on the symbol next to each attribute value.
- An entry is always created in the Legend Point overview.

## Talents

We make a difference for Talents when learning vs. improving them.

### Learning New Talents

Talents added to a character do not initially require Legend Points. Talents added without reference to a Discipline or Path trigger a few dialogues to determine the Talent's tier, origin, and category. If a Talent is added automatically through advancing a Discipline Circle or a Path Rank, these options need not be selected; instead, the Talent automatically takes on the parameters of the vocation.

### Talent Improvements

Talents can also be learned or improved with Legend Points. Unlike attributes, there are no related system settings. In Edit mode, the arrow-up button appears. Pressing the arrow opens the standard increase dialog showing cost and requirements. Costs are calculated from degree and origin Discipline (1st, 2nd, 3rd Discipline).

- Talents from second, third, or later Disciplines that are increased to rank 1 (when learning the new Discipline) have additional increased costs matching the values in the "Building Your Own Legend" chapter of the Player's Guide.
- Every improvement made through this mechanism is recorded in the Legend Point history. Improvements performed manually in the talent document are not.

## Skills

Just like with Talents, Skills can be learned and improved.

### Learning New Skills

Skills can simply be dragged onto a character document. They appear in the skills overview at rank 0.

### Skill Improvements

Skills are improved in Edit mode the same way as talents. Clicking the arrow-up button opens the increase overview. Skill increase costs match the table in the "Building Your Own Legend" chapter of the Player's Guide and are only modified by skill degree.

## Devotions

Devotion abilities are the same as Talents and Skills. They can be learned and improved.

### Learning New Devotion Powers

Devotion powers can simply be dragged onto a character document. They appear in the devotion powers overview at rank 0.

### Devotion Power Improvements

Devotion powers are improved in Edit mode just like talents. Activating the arrow-up button opens the increase overview. Devotion power increase costs follow the rules in the "Questors" book and are only modified by devotion degree.

## Talent Knacks

Talent knacks (whether talent knacks, karma knacks, or special maneuvers) can only be learned.

### Learning New Talent Knacks

Talent knacks can simply be dragged onto a character document. They appear below their parent talent. The parent talent is determined by the ED-ID provided in the knack. If the character is a player character, a learning dialog opens first, similar to the increase overview, showing requirements and costs. Legend Point costs depend on minimum rank. However, these costs can be overridden by the field "Legend Point Cost". If this field is filled, that value is always used.

Note: There is currently no validation for the maximum allowed number of knacks per talent. Minimum rank and prerequisites are also not checked.

## Spells

Spells can only be learned.

### Learning New Spells

Spells can be dragged onto the character document just like talents or knacks. If the character is a player character, a learning dialog opens. It follows the spell learning rules from the Player's Guide. The dialog allows simulating a teacher and spending recovery tests to learn additional spells. Costs depend on spell circle, as described in the Player's Guide.

## Spell Knacks

Spell knacks can only be learned.

### Learning New Spell Knacks

Spell knacks can simply be dragged onto the character document. They appear with spells. If the character is a player character, a learning dialog opens here as well and provides information about costs and requirements.

Note: There is currently no option to use spell knacks directly.

## Disciplines

Disciplines can be learned and improved.

### Learning New Disciplines

Disciplines added to a character do not initially require Legend Points. After being added, Disciplines are automatically set to circle 1. If a Discipline is added to a player character, a learning dialog opens here too, even though adding a Discipline itself does not cost Legend Points. Similar to the other learning dialogs, it provides an overview of learned abilities.

Along with the new Discipline, all Discipline talents from circle one are added. Origin Discipline and the circle at which each talent was learned is automatically set for all those talents.

When learned, Discipline order is automatically defined (second, third, fourth Discipline, etc.), based on which final Legend Point costs for talent improvements are calculated.

### Discipline Improvements

A Discipline can be increased in Edit mode. The learning dialog shows minimum requirements for circle advancement. The next dialog steps allow the player to select an optional talent. Finally, an overview of all newly added abilities is shown.

## Paths

Paths can be learned and improved.

### Learning a New Path

Each Path contains three items: one knack, one talent, and the Path itself. Only the Path needs to be added to the character. During the learning process, dialogs appear to add the corresponding Path knack and related talent to the character.

### Improving a Path

A Path can be improved in Edit mode exactly like a Discipline. Unlike Disciplines, a Path rank is directly tied to the Path talent, so Legend Points are required to increase the talent to the new rank as well. During the advancement process, you are asked whether the Path talent should be increased together with it. If yes, the talent improvement is processed at the same time.

## Questor

Questor ranks can be learned and improved.

### Becoming a Questor

A Questor always includes a Questor devotion power. If the character has no Questor devotion power yet, it is created when adding the Questor.

The system does not support multi-Questors.

### Improving Questor Rank

Questors can be increased in Edit mode. The Questor devotion power must have at least a rank equal to the new Questor rank. If not, the advancement process offers an option to increase the Questor devotion power directly.

## Threads

Threads to true patterns, whether for a thread item, another actor's true magical pattern, or a group pattern are increased in Edit mode in the "Links" tab. The arrow-up button triggers the increase process.
