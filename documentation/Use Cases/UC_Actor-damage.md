WIP

Strain is a specific type of physical damage which is spend during the activation of abilities or similar actions. Strain can never cause a wound, but is leathal damage

### Diagram (TODO)
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef foundryCore font-style:italic,font-weight:bold,fill: lightgreen
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue
    classDef userFunctionReturn font-style:italic,font-weight:bold,fill:aqua
    classDef dialog font-style:italic,font-weight:bold,fill:orange

    ###################### status #######################

    condition1: CONDITIONNAME1
    condition2: CONDITIONNAME1
    condition3: CONDITIONNAME1

    triggerAction1: TRIGGERACTION1
    triggerAction2: TRIGGERACTION2
    triggerAction3: TRIGGERACTION3

    userFunction1: USERFUNCTION1
    userFunction2: USERFUNCTION2
    userFunction3: USERFUNCTION3

    state1: STATE1
    state2: STATE2
    state3: STATE3

    dialog1: DIALOG1

    ####################### Decisions #######################

    state DECISION1 <<choice>>
    state DECISION2 <<choice>>
    state DECISION3 <<choice>>

    ######################## Colorations ######################

    triggerAction1:::fromOutside
    triggerAction2:::fromOutside
    triggerAction3:::fromOutside

    userFunction1:::userFunction
    userFunction2:::userFunction
    userFunction3:::userFunction

    dialog1:::dialog

    ##################### StateDiagram ########################

    
```

### Related User Functions

[UF_Actor-takeStrain](../User%20Functions/UF_Actor/UF_Actor-takeStrain.md)

[UF_YYYYYY-XXXXX](../User%20Functions/UF_YYYYYY-XXXXX.md)

[UF_YYYYYY-XXXXX](../User%20Functions/UF_YYYYYY-XXXXX.md)


### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Test case | [[Test] - activate none rollable ability](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |


