# Building your own Legend

This chapter covers the same chapter form the Players Guide but will not go into details of the rules itself, those have to be referenced in the Players Guide itself. Legend Points are in general only relevant for Actors of type Character. 

## Earning Legend Points

One of the Goals in Earthdawn is the collection of legend points. They are used for Character progress and define the might of a character. The following use case describes how legend points can be assigned to characters by using an build in dialog. [UC_ChatCommands-TriggerLpAward](../Use%20Cases/UC_ChatCommands-TriggerLpAward.md)

In addition to the above mentioned method of assigning legend points, it is although possible to assign legend points manually to individual characters. This process is described in the following use case in detail [UC_LpTracking-addLegendPointsManually](../Use%20Cases/UC_LpTracking-addLegendPointsManually.md).

all those legend point transactions will be visible in the legend point history, accessable from the legend tab of each character. there are three tabs in the legend point history dialog. One for all earnings, another one for all spendings and the third shows a combined list of everything ordered chronologically. The earnings tab shows not only all earned legend points, but also has the option to manually add legend points. In addition, it is possible to adapt the fiels of the description and the amount after an entry was made. Those changes should be done with care since they overwrite the data and will not be revertable afterwards. <br>
the second tab shows everything, legend points were spend for. For better overview/tracking it is possible to sort the entries either by date/time, by item Type or by each item itself. if it is not sorted by date/time, the overview will change slightly by folding every sorted group for a better navigation.
Everything about the legend point history can be found in this use case [UC_LpTracking-history](../Use%20Cases/UC_LpTracking-history.md).


## Spending Legend Points

Legend points can be spend for different purposes, increasing abilities, adding knacks or forging group patterns. from a system point of view there is a differentiation between items which can be upgraded, like talents or threads and those which will const only once legend points when added.
the upgradeable items are:
* talents
* skills
* devotions
* attributes
* threads

the one-time cost items are:
* spells
* spell knacks
* knack abilities
* karma knacks
* karma maneuver

there are several items and/or workflows which are not relevant for the system in regards of legend point tracking, like disciplines, paths and devotinos. Those items are mentioned in the next [Chapter-Advancement](#Chapter-Advancement). 

### upgradables:

the most important upgradeable items are for sure talents. They are grouped together with devotions and skills and are handled in the following use case. Note, that all of those ability items will be added a rank 0 to the actor and therefore not directly triggering an event to spend legend points (the only exception is for abilities added from character generation).
[UC_LpTracking-abilities](../Use%20Cases/UC_LpTracking-abilities.md)


the next upgradables are the attributes. Their upgrade process is described in detail in the following use case. The use case is highly dependend on several system settings, which are referenced in the use case as well. 
[UC_LpTracking-attributes](../Use%20Cases/UC_LpTracking-attributes.md)

the last upgradable is... STILLLLL NOT IMPLEMENTED!
[UC_LpTracking-threads](../Use%20Cases/UC_LpTracking-threads.md)

### one-timer:


[UC_LpTracking-knacks](../Use%20Cases/UC_LpTracking-knacks.md)

[UC_LpTracking-spells](../Use%20Cases/UC_LpTracking-spells.md)


<a name="Chapter-Advancement"></a>

## Advancing Discipline Circles, Path- and Questor Ranks

[UC_LpTracking-classes](../Use%20Cases/UC_LpTracking-classes.md)

## Legendary Status

[UC_LpTracking-status](../Use%20Cases/UC_LpTracking-status.md)

## Adventuring Groups





































# OLD STUFF

Building your own legend covers the following use cases:
* [UC_LpTracking-Attributes](#UC_LpTracking-Attributes)
* [UC_LpTracking-addAbility](#UC_LpTracking-addAbility)
* [UC_LpTracking-upgradeAbility](#UC_LpTracking-upgradeAbility)
* [UC_LpTracking-Knacks](#UC_LpTracking-Knacks)
* [UC_LpTracking-Spells](#UC_LpTracking-Spells)
* [UC_LpTracking-Classes](#UC_LpTracking-Classes)
* [UC_LpTracking-History](#UC_LpTracking-History)
* [UC_LpTracking-Threads](#UC_LpTracking-Threads)


each one of the above will be described in detail in the following chapters.

<a name="UC_LpTracking-History"></a>
### UC_LpTracking-History

The Use Case UC_LpTracking-History covers the tracking of Legend points of an actor, every add, edit or deletion will be tracked. Two different overviews are available in the History prompt, showing an History of all earned legend Points and another History shows all spendings of legend Points. Each of the tabs have a check to show deletions as well. if this is checked, the deleted history entries will be shown.

#### Diagram
```mermaid
stateDiagram-v2
    state1: History Spend
    state2: History Earned
    interaction1: Edit History
    interaction5: Add History
    interaction2: Delete History
    interaction3: assign Lp
    interaction4: trigger Lp spending
    [*] --> interaction4
    [*] --> interaction3
    state1 --> [*]
    state2 --> [*]
    interaction1 --> state2
    interaction3 --> state2
    interaction5 --> state2
    interaction4 --> state1
    interaction2 --> state1
    

```

##### Related User Functions

* [UF-LpTracking_assignLp](#UF-LpTracking_assignLp)
* [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction)
* [UF_LpTracking-legendPointHistoryLog](#UF_LpTracking-legendPointHistoryLog)
* [UF_LpTracking-legendPointHistorySpend](#UF_LpTracking-legendPointHistorySpend)
* [UF_LpTracking-legendPointHistoryEarned](#UF_LpTracking-legendPointHistoryEarned)
* [UF_LpTracking-deleteLegendPointHistoryEntries](#UF_LpTracking-deleteLegendPointHistoryEntries)
* [UF_LpTracking-editLegendPointHistoryEntries](#UF_LpTracking-editLegendPointHistoryEntries)


<a name="UC_LpTracking-Attributes"></a>
### UC_LpTracking-Attributes

this covers enhancing attribute values. First the system setting for maximum Attribute enhancements and the setting for the type of Attribute enhancement options will be checked and evaluated if the attribute is able to be enhanced. A validation prompt will appear and show the relevant information (based on the setting). On confirmation the Attribute will be enhanced and the Legendpoints will be booked.

#### Diagram
```mermaid
---
title: upgrade Attributes
---
stateDiagram-V2
state1: trigger upgrade Attribute
state2: validate Legend points
state3: trigger Lp spending
state4: increase Attribute
systemSetting1: Setting - max Attribute Enhances
systemSetting2: Setting - Attribute Enhancement Option

errorState1: no more enhances possible
errorState2: not enough legend points
errorState3: already enhanced an attribute this circle


state maxEnhancement <<choice>>
state enhancesVsCircle <<choice>>
state attributeEnhancementOption <<choice>>
state validateLp <<choice>>

[*] --> state1
state1 --> maxEnhancement
systemSetting1 --> maxEnhancement
maxEnhancement --> errorState1: max enhancement reached
note right of errorState1
    Ui notification
end note
maxEnhancement --> attributeEnhancementOption: max enhancement not reached
systemSetting2 --> attributeEnhancementOption
attributeEnhancementOption --> state2: Buy Attribute Points any time
attributeEnhancementOption --> enhancesVsCircle: only 1 enhancement per circle
enhancesVsCircle --> errorState3: already enhanced 1 attribute this circle
note right of errorState3
    Ui notification
end note
enhancesVsCircle --> state2
state2 --> validateLp
validateLp --> errorState2: not enough Lp
note right of errorState2
    Ui notification
end note
validateLp --> state3: enough Lp
state3 --> state4
state4 --> [*]
```

##### Related User Functions
* [UF_LpTracking-upgradeAttribute](#UF_lpTracking-upgradeAttribute)
* [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction)
* [UF_LpTracking-lpValidationPrompt](#UF_LpTracking-lpValidationPrompt)
* [UF_Setting-lpTrackingAttributeMaxEnhancement](https://github.com/patrickmohrmann/earthdawn4eV2/wiki/en-FS-System-Settings#UF_Setting-lpTrackingAttributeMaxEnhancement)
* [UF_Setting-lpTrackingAttributes](https://github.com/patrickmohrmann/earthdawn4eV2/wiki/en-FS-System-Settings#UF_Setting-lpTrackingAttributes)


<a name="UC_LpTracking-addAbility"></a>
### UC_LpTracking-addAbility

this functionality is responsible for adding devotions, skills or talents to the actor. All Items will be added to the actor with Rank 0, so there is no Legend points required. An entry will be created nonetheless with Legend points amount = 0, for consistency purpose. 

Skills and devotions will be added to the actor without a prompt or required interaction.

Talents on the other hand create a prompt which requests the user to chose which talent category the talent shall be added to (discipline, optional, free, other) and which Tier this talent shall get (novice, journeyman, warden or master).

if the actor has a talent with the ed-id "versatility" a check will be done, to see if the number of talents with the talent category of "versatility" is lower than the rank of the sum of all talents with the ed-id "versatility". In that case another option will be available in the prompt allowing the user to learn the new talent as a versatility talent (for those talents there is no novice option for the tier selection)

#### Diagram
```mermaid
---
title: add/upgrade Ability
---
stateDiagram-V2

    state1: _onDropItem
    state2: validate Legend Points
    state3: trigger Lp spendings
    state4: add ability
    state5: versatility evaluation
    state6: upgrade ability

    state versatility <<choice>>
    state versatilityEvaluation <<choice>>
    state validateLp <<choice>>
    state fromAdvancement <<choice>>

    errorState1: not enough Lp
    errorState2: not enough free ranks

    [*] --> state1
    state1 --> versatility
    versatility --> state5: talent learned via versatility?
    versatility --> state2
    state5 --> versatilityEvaluation
    versatilityEvaluation --> errorState2: not enough ranks
    note right of errorState2
        ui notification
    end note
    versatilityEvaluation --> state2
    state2 --> validateLp
    validateLp --> errorState1: not enough Lp
    note right of errorState1
        ui notification
    end note
    validateLp --> state3

    state3 --> state4
    state4 --> fromAdvancement
    fromAdvancement --> state6: trigger upgrade Ability 
    state6 --> [*]
    fromAdvancement --> [*]
```

##### Related User Functions

* [UF_LpTracking-versatilityCheck](#UF_LpTracking-versatilityCheck)
* [UF_LpTracking-addAbility](#UF_LpTracking-addAbility)
* [UF_LpTracking-lpValidationPrompt](#UF_LpTracking-lpValidationPrompt)
* [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction)
* [_onDropItem - Foundry Core](https://foundryvtt.com/api/classes/client.ActorSheet.html#_onDropItem)



<a name="UC_LpTracking-upgradeAbility"></a>
### UC_LpTracking-upgradeAbility

This use case is responsible for upgrading devotions, skills and talents. all abilities have an upgrade button (arrow up) on the list view which will start the upgrade process, by checking if the ability has not yet reached the maximum level (devotions 12, skills 10 and talents 15). A prompt will appear after this check with information about the required and current legend points. A Button "spend Lp" will upgrade the ability by spending the required Legend Points if they are available, otherwise it will not increase the ability. The Free button will enhance the ability without spending any legend points. An LpTransactionData will be created in either case.

#### Diagram

```mermaid
---
title: upgrade Ability
---
stateDiagram-V2

    state1: upgrade Ability
    state2: validate Legend Points
    state3: trigger Lp spendings
    state4: increase Ability

    state maxRank <<choice>>
    state validateLp <<choice>>

    errorState1: max Rank reached
    errorState2: not enough Lp

[*] --> state1
state1 --> maxRank: check ability type max
maxRank --> errorState1
note right of errorState1
    ui notifictaoin
end note
maxRank --> state2
state2 --> validateLp
validateLp --> errorState2: not enough Lp
note right of errorState2
    ui notifictaoin
end note
validateLp --> state3
state3 --> state4
state4 --> [*]
```


##### Related User Functions

* [UF_LpTracking-upgradeAbility](#UF_LpTracking-upgradeAbility)
* [UF_LpTracking-lpValidationPrompt](#UF_LpTracking-lpValidationPrompt)
* [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction)


<a name="UC_LpTracking-Knacks"></a>
### UC_LpTracking-Knacks

Adding Knacks to the actor is done by dropping a knack item to the Actor. Several checks will start:
1: is the talentIdentifier matching one talent with the same identifier of the actor?
2: is the rank of the previously found talent at least as high as the minimum required rank of the knack?
3: is the number of knacks with the same talentIdentifier lower than the parent talents rank?
if all those checks are done, a validation prompt opens showing the user the required and current legend points and provide him with the option to spend LP, add the knack for free or cancel the operation. Both confirmation will create an LpTransactionData.

#### Diagram

```mermaid
---
title: add Knack
---
stateDiagram-V2

    state1: _onDropItem
    state2: validate Legend Points
    state3: trigger Lp spendings
    state4: add Knack
    state5: Source Talent
    state6: Source Talent Rank
    state7: Source Talent Knacks

    state validateLp <<choice>>
    state sourceTalentRank <<choice>>
    state sourceTalent <<choice>>
    state sourceTalentKnacks <<choice>>

    errorState1: not enough Lp
    errorState2: Source talent not available
    errorState3: Source talent Rank not high enough
    errorState4: this talent has already to many knacks

    [*] --> state1
    state1 --> state5
    state5 --> sourceTalent
    sourceTalent --> errorState2: talent not avilable
    note right of errorState2
        ui notification
    end note
    sourceTalent --> state6 
    state6 -->sourceTalentRank
    sourceTalentRank --> errorState3: Rank not high enough
    note right of errorState3
        ui notification
    end note
    sourceTalentRank --> state7
    state7 --> sourceTalentKnacks
    sourceTalentKnacks --> errorState4: to many knacks
     note right of errorState4
        ui notification
    end note
    sourceTalentKnacks --> state2
    state2 --> validateLp
    validateLp --> errorState1: not enough LP
    note right of errorState1
        ui notification
    end note
    validateLp --> state3
    state3 --> state4
    state4 --> [*]
```


##### Related User Functions

* [UF_LpTracking-lpValidationPrompt](#UF_LpTracking-lpValidationPrompt)
* [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction)
* [UF_LpTracking-addKnack](#UF_LpTracking-addKnack)
* [UF_LpTracking-evaluateSourceTalent](#UF_LpTracking-evaluateSourceTalent)

<a name="UC_LpTracking-Spells"></a>
### UC_LpTracking-Spells

This use case covers the learning of new spells functionality. If a spell item is dropped to an actor of type character, a prompt will open to chose one of the grimoire items of the character (see [Grimoire Items](https://github.com/patrickmohrmann/earthdawn4eV2/wiki/FS-Grimoire-Items) ). the Prompt provides information about the current and required legend points. The Prompt can be confirmed with a free button (not using any LP) or the confirm button (only possible if enough LP are available) or the interaction can be cancelled.

#### Diagram
```mermaid
stateDiagram-v2
    state1: drop a Spell to the actor
    state2: trigger patterncraft test
    stateEnd: add spell to Grimoire

    state patterncraftTest <<choice>>
    state enoughLp <<choice>>

    errorState1: patterncraft test not successful
    errorState2: not enough Lp
    
    [*] --> state1
    state1 --> enoughLp
    enoughLp --> state2
    enoughLp --> errorState2: not enough LP
    note right of errorState2
        ui notification
    end note
    state2 --> patterncraftTest: success or not
    patterncraftTest --> errorState1: not enough LP
    note right of errorState1
        ui notification
    end note
    patterncraftTest --> stateEnd
    stateEnd --> [*]
```


##### Related User Functions


* [UF_LpTracking-validateDropItem](#UF_LpTracking-validateDropItem)
* [UF_LpTracking-showLpOptionsPrompt](#UF_LpTracking-showLpOptionsPrompt)
* [UF_LpTracking-ed4eDropItem](#UF_LpTracking-ed4eDropItem)
* [updateSource - Foundry Core](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#updateSource)
* [_onDropItem - Foundry Core](https://foundryvtt.com/api/classes/client.ActorSheet.html#_onDropItem)
* [_preCreate - Foundry Core](https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html#_preCreate)


<a name="UC_LpTracking-Classes"></a>
### UC_LpTracking-Classes

This Use Case handles the increase of Class Items (Disciplines, Paths and Questors). The increase is triggered by the upgrade icon in the Character Sheet (arrow up) on the respective class item. The trigger will first decide which class item shall be enhanced and then checks if the item itself is not at the max Rank/Circle.

For discipline items the system settings for Talent increases will be taken into account and the current talents of the actor - linked to the discipline - will be checked against this setting. Furthermore it will be checked if the actor has enough Legend points to at least upgrade the discipline talent of the next circle. 
If all those checks are done, a prompt appears to request the user to select the optional talent for this circle. The optional Talent options will be collected from the pools of the class item. Chosen Talents will not appear again in that list. Confirming this prompt will add all discipline- and free - talents as well as all effects and special abilities of that circle in addition to the chosen optional Talent to the actor. All talents will get the tier updated to the new level. In addition the field for the source Class and the level added to the actor will be set.  
In addition to that, the circle of the class item will be increased by one and all free talents of this discipline will be upgraded to be on the same level.

For Path items, there will be only one check, which is, to verify, if the path talent is at least as high as the new level. If this check is done, a prompt will appear requesting the user to choose the talent from the list. Confirming the prompt will add the chosen talent as well as any other ability of effect from the pools area of that rank to the actor. 
In addition the rank of the path will be increased by one.

for Questor items, there will be only one check, which is, to verify, if the questor devotion is at least as high as the new level. If this check is done, a prompt will appear requesting the user to choose the devotion from the list. Confirming the prompt will add the chosen devotion as well as any other ability of effect from the pools area of that rank to the actor. 
In addition the rank of the path will be increased by one.

#### Diagram
```mermaid
stateDiagram-v2
    state1: discipline
    state2: path
    state3: questor
    state4: enough LP 
    state5: system Settings
    state6: choose Talent Option
    state7: add Abilities and Effects
    state8: increase free talents
    state9: choose Talent option
    state11: choose Devotion
    
    
    state enoughLp <<choice>>
    state classType <<choice>>
    state talentRequirement <<choice>>
    state knackLevel <<choice>>
    state questor <<choice>>



    errorState2: not enough legend points
    errorState3: not all Talents are high enough
    errorState4: pathTalent not high enough
    errorState5: questor Devotion not high enough

    [*] --> classType
    classType --> state1
    classType --> state2
    classType --> state3 

    state1 --> state5: enhancemen Options

    state5 --> talentRequirement
    talentRequirement --> state4
    talentRequirement --> errorState3
    note right of errorState3
        Ui notification
    end note
    
    state4
    state4 --> enoughLp
    enoughLp --> state6
    enoughLp --> errorState2
    note right of errorState2
        Ui notification
    end note
    state6 --> state8
    state8 --> state7
    state7 --> [*]


    state2 --> knackLevel: path Talent high enough
    knackLevel --> state9
    knackLevel --> errorState4
    note right of errorState4
        Ui notification
    end note
    state9 --> state7
  

    state3 --> questor: questor Devotion high enough
    questor --> state11
    questor --> errorState5
    note right of errorState5
        Ui notification
    end note
    state11 --> state7
```


##### Related User Functions (TBD)

* [UF_LpTracking-upgradeDiscipline](#UF_LpTracking-upgradeDiscipline)
* [UF_LpTracking-upgradePath](#UF_LpTracking-upgradePath)
* [UF_LpTracking-upgradeQuestor](#UF_LpTracking-upgradeQuestor)
* [UF_LpTracking-addAbility](#UF_LpTracking-addAbility)
* [UF_LpTracking-upgradeAbility](#UF_LpTracking-upgradeAbility)
* [UF_LpTracking-checkDuplicateAbilityName](#UF_LpTracking-checkDuplicateAbilityName)
* [UF_LpTracking-upgradeFreeTalents](#UF_LpTracking-upgradeFreeTalents)
* [UF_Setting-lpTrackingAllTalents](#UF_Setting-lpTrackingAllTalents)



<a name="UC_LpTracking-Threads"></a>
### UC_LpTracking-Threads


#### Diagram


##### Related User Functions

* [UF-LpTracking_assignLp](#UF-LpTracking_assignLp)
* [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction)
* [UF_LpTracking-legendPointHistoryLog](#UF_LpTracking-legendPointHistoryLog)
* [UF_LpTracking-legendPointHistorySpend](#UF_LpTracking-legendPointHistorySpend)
* [UF_LpTracking-legendPointHistoryEarned](#UF_LpTracking-legendPointHistoryEarned)
* [UF_LpTracking-deleteLegendPointHistoryEntries](#UF_LpTracking-deleteLegendPointHistoryEntries)
* [UF_LpTracking-editLegendPointHistoryEntries](#UF_LpTracking-editLegendPointHistoryEntries)
* [UF_LpTracking-XXXXXX](#UF_LpTracking-XXXXXX)

<a name="UC_<TOPIC>-<UCNAME>"></a>
### UC_<TOPIC>-<UCNAME>


#### Diagram


##### Related User Functions

* [UF_<TOPIC>-<UFAME>](#UF_<TOPIC>-<UFAME>)
* [UF_<TOPIC>-<UFAME>](#UF_<TOPIC>-<UFAME>)
* [UF_<TOPIC>-<UFAME>](#UF_<TOPIC>-<UFAME>)
* [UF_<TOPIC>-<UFAME>](#UF_<TOPIC>-<UFAME>)
* [UF_<TOPIC>-<UFAME>](#UF_<TOPIC>-<UFAME>)


# User Functions

<a name="UF_<TOPIC>-<UFAME>"></a>
## UF_<TOPIC>-<UFAME>

<a name="UF_LpTracking_assignLp"></a>
## UF-LpTracking_assignLp

this functionality is triggered by the chat command /lp (GM only) and will create a prompt with a field for the Legend Points, another field for a dedicated description, and the option to assign Actors of type Character. 

The Actors shown in this list are:
* all Actors which are configured to an active user (selected by default)
* all Actors which are configured to an inactive user 
* all Actors which are owned by a player but are not configured yet.

confirming the prompt will create one TransactionData for every selected Actor (see [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction) )

<a name="UF_LpTracking-addLpTransaction"></a>
## UF_LpTracking-addLpTransaction

this functionality creates an entry in either actor.system.lp.earnings or actor.system.lp.spendings. In addition every entry of either paths will as well be create an entry in actor.system.lp.log. 

Each entry contains the following data:
amount
date
description

spendings have a few **additional** data:
type
name
value.before
value.after
itemUuid


<a name="UF_LpTracking-legendPointHistoryLog"></a>
## UF_LpTracking-legendPointHistoryLog

keeps the LpTransactionData organized by date. it is a combination of type "earnings" and "spendings"

<a name="UF_LpTracking-legendPointHistorySpend"></a>
## UF_LpTracking-legendPointHistorySpend

all LpTransactionData with the type "earnings" sorted by date.

<a name="UF_LpTracking-legendPointHistoryEarned"></a>
## UF_LpTracking-legendPointHistoryEarned

all LpTransactionData with the type "spendings" sorted by date and grouped by itemUuid (or name if no uuid is available. e.g. attributes)

<a name="UF_LpTracking-deleteLegendPointHistoryEntries"></a>
## UF_LpTracking-deleteLegendPointHistoryEntries

reverts the selected History entry (only for spendings). it is only possible to delete the last entry per itemUuid (or name if no uuid is available. e.g. attributes). the revert creates another LpTransactionData entry in [UF_LpTracking-addLpTransaction](#UF_LpTracking-addLpTransaction) which has the type "log". this entry shows the reverted data for:
* amount
* value.before
* value.after

description has the entry "revert"

<a name="UF_LpTracking-editLegendPointHistoryEntries"></a>
## UF_LpTracking-editLegendPointHistoryEntries

it is possible to edit legend Point history entries in earnings. Description and Amount can be edited.

<a name="UF_LpTracking-upgradeAttribute"></a>
## UF_LpTracking-upgradeAttribute

upgrade an attribute value

<a name="UF_LpTracking-lpValidationPrompt"></a>
## UF_LpTracking-lpValidationPrompt

every process upgrading or adding and item or value of an actor of type character will trigger the **Validation Prompt** to enable the user to upgrade the chosen item or value and provide all necessary information about that increase. In addition it provides the option to add or increase as free.

<a name="UF_LpTracking-lpValidationPrompt"></a>
## UF_LpTracking-versatilityCheck

this function creates a simple prompt for the user to check if he wants to add this ability as a versatility talent or not.
**Note** this option shall only appear if the actor has an ability with the ed-id **versatility**

<a name="UF_LpTracking-lpValidationPrompt"></a>
## UF_LpTracking-addAbility

this function adds a new ability to the actor with rank 0 by default. if this ability was added during an advancement process the rank will be set to 1 instead causing the [UC_LpTracking-upgradeAbility](#UC_LpTracking-upgradeAbility) process.


<a name="UF_LpTracking-upgradeAbility"></a>
## UF_LpTracking-upgradeAbility

upgrading devotions, skills or talents as well as checking for the maximum rank

<a name="UF_LpTracking-addKnack"></a>
## UF_LpTracking-addKnack

add a knack to the actor beneath the source Talent

<a name="UF_LpTracking-addKnack"></a>
## UF_LpTracking-evaluateSourceTalent

to add a knack to the actor, it has to be checked if:
1. the actor owns a talent with the same source Talent id
2. the rank of that talent has to be at least equal to the min Rank of the knack
3. the source talent has less than its ranks in related knacks

<a name="UF_LpTracking-upgradeDiscipline"></a>
## UF_LpTracking-upgradeDiscipline

This functionality upgrades the discipline items if:
1. talents are at the right level (see [UF_Setting-lpTrackingAllTalents](#UF_Setting-lpTrackingAllTalents) )
2. enough LP are available to at least increase the discipline Talent to rank 1


<a name="UF_LpTracking-upgradePath"></a>
## UF_LpTracking-upgradePath

This functionality upgrades the paths items if the linked path Talent rank is at least one level higher then the current path level.


<a name="UF_LpTracking-upgradeQuestor"></a>
## UF_LpTracking-upgradeQuestor

This functionality upgrades the questors items if the linked questor devotion rank is at least one level higher then the current questor level.

<a name="UF_LpTracking-checkDuplicateAbilityName"></a>
## UF_LpTracking-checkDuplicateAbilityName

the choices to the user of the optional Talents or devotions available at each level of a class item shall filter out already chosen abilities (no matter the parent discipline, path or questor item).

<a name="UF_LpTracking-upgradeFreeTalents"></a>
## UF_LpTracking-upgradeFreeTalents

free talents shall always be on the same level as the discipline level. this functionality upgrades those items.
