This use case covers all items which are dropped onto an actor document (Sheet). The [UF_ActorItems-preCreate](../User%20Functions/UF_AssignLpPrompt-preCreate.md) is responsible for triggering this use case or not. Based on the Actor type several items are able to be dropped to an actor sheet and some aren't. If an item type is not foreseen for the target actor type, a warning message appears, informing the user. If, on the other hand, the item can be added to the target actor type, two functions might be triggered.
1. validateDropItem
2. _showOptionsPrompt

ValidateDropItem is responsible for validation of Legendpoints.
_showOptionsPrompt is required for additional user interaction when the item is added to the actor (choosing a talent category, or tier etc.)

### Diagram
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef foundryCore font-style:italic,font-weight:bold,fill: lightgreen
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue
    classDef userFunctionReturn font-style:italic,font-weight:bold,fill:aqua
    classDef dialog font-style:italic,font-weight:bold,fill:orange

    ###################### status #######################

    condition1: conditional If
    condition2: talents added during circle increase
    condition3: talent with edid "versatility"

    triggerAction1: triggerd Creation
    triggerAction2: manual creation (drop)
    lpTracking: UC_LpTracking-History

    ed4eDropItem: ed4eDropItem
    ed4eDropItem(Return): ed4eDropItem(Return)
    addItemLpTransaction: addItemLpTransaction
    validateDropItem: validateDropItem
    validateDropItem(Return): validateDropItem(Return)
    showOptionsPrompt: showOptionsPrompt
    showOptionsPrompt(Return): showOptionsPrompt(Return)

    _preCreate: _preCreate
    createItem(_preCreate): createItem(_preCreate)
    updateSource: updateSource

    dialog: Dialog tier Selection

    ####################### Decisions #######################

    state requireInteraction <<choice>>
    state itemType <<choice>>
    state bookingResultVersatility <<choice>>

    ######################## Colorations ######################

    triggerAction1:::fromOutside
    triggerAction2:::fromOutside
    lpTracking:::fromOutside

    ed4eDropItem:::userFunction
    addItemLpTransaction:::userFunction
    validateDropItem:::userFunction
    showOptionsPrompt:::userFunction

    validateDropItem(Return):::userFunctionReturn
    showOptionsPrompt(Return):::userFunctionReturn
    ed4eDropItem(Return):::userFunctionReturn

    _preCreate:::foundryCore
    createItem(_preCreate):::foundryCore
    updateSource:::foundryCore

    dialog:::dialog

    ##################### StateDiagram ########################

    triggerAction1 --> _preCreate
    triggerAction2 --> _preCreate

    _preCreate --> condition1: 

    condition1 --> requireInteraction: interaction required based on item parameter
        requireInteraction --> condition2: no interaction needed
            condition2 --> updateSource: tier<br> category<br> identifier<br> level reference
            
        requireInteraction --> condition3: edid = versatility<br> & type = talent
            condition3 --> updateSource: talent Category = versatility
           
        requireInteraction --> ed4eDropItem: yes

            ed4eDropItem --> validateDropItem
            validateDropItem --> validateDropItem(Return)
            
            validateDropItem(Return) --> itemType: interaction required? <br> based on item type
                itemType --> showOptionsPrompt: yes
                itemType --> updateSource: no

            showOptionsPrompt --> showOptionsPrompt(Return)

            showOptionsPrompt(Return) --> ed4eDropItem(Return)
            
            ed4eDropItem(Return) --> bookingResultVersatility
            bookingResultVersatility --> addItemLpTransaction
            
            
            bookingResultVersatility --> dialog: Versatility option
                dialog  --> updateSource: talent category = versatility <br> tier selection
            addItemLpTransaction --> updateSource: talent category

            updateSource --> createItem(_preCreate)

            addItemLpTransaction --> lpTracking
```

### Related User Functions

[UF_ActorItems-ed4eDropItem](../User%20Functions/UF_ActorItems/UF_ActorItems-ed4eDropItem.md)

[UF_ActorItems-validateDropItem](../User%20Functions/UF_ActorItems/UF_ActorItems-validateDropItem.md)

[UF_LpTracking-showOptionsPrompt](../User%20Functions/UF_LpTracking/UF_LpTracking-showOptionsPrompt.md)

[UF_ActorItems-preCreate](../User%20Functions/UF_ActorItems/UF_ActorItems-preCreate.md)

[UF_ActorItems-createEmbeddedDocuments](../User%20Functions/UF_ActorItems/UF_ActorItems-createEmbeddedDocuments.md)

[UF_ActorItems-findSourceTalent](../User%20Functions/UF_ActorItems/UF_ActorItems-findSourceTalent.md)

[UF_ActorItems-countKnacksForTalent](../User%20Functions/UF_ActorItems/UF_ActorItems-countKnacksForTalent.md)


### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| add skill | [[Test] - add skill to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/846) |
| add knack | [[Test] - add knack to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/845) |
| add devotion | [[Test] - add devotion to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/844) |
| add talents | [[Test] - add talent to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/835) |
| add talent with edid versatility | [[Test] - add talent with edid "versatility" to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/842) |
| add disciplines | [[Test] - add discipline to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/843) |
| add spell | [[Test] - add spells to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/841) |
| -- Later -- add binding secret | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| -- Later -- add physical item --> with thread items| [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| -- Later -- add spell knack | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| -- Later -- add thread item | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| -- Later -- add effect | [[Test] - add effect to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/851) |
| -- Later -- add special ability | [[Test] - add special ability to character](https://github.com/patrickmohrmann/earthdawn4eV2/issues/849) |
| -- Later -- add path | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| -- Later -- add questor | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |


