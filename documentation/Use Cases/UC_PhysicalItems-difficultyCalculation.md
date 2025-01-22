The calculation of difficulty is crucial for the earthdawn system. All action test are rolled against a difficulty. This use case describes how the difficulty is set.

in general there are three values which primarily influence the difficulty calculation:
* target difficulty
* group difficulty
* fixed difficulty

the target difficulty is a choice of the characteristic of the target(s).

the group difficulty is a choice how the difficulty shall be affected if more than one target is selected

fixed difficulty defines a difficulty for actions without a dedicated target defense.

### Diagram
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef foundryCore font-style:italic,font-weight:bold,fill: lightgreen
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue
    classDef userFunctionReturn font-style:italic,font-weight:bold,fill:aqua
    classDef dialog font-style:italic,font-weight:bold,fill:orange

    ###################### status #######################

    condition1: no target selected
    condition2: targets selected
    condition4: target difficulty "none"

    triggerAction1: trigger action

    userFunction1: getDifficulty

    userFunction1Return: getDifficulty Return


    state1: fixed difficulty
    state2: Difficulty 0
    state3: group Difficulty Setting
    state4: Target Difficulty
    state5: Calculated Difficulty


    ####################### Decisions #######################

    state targetNumber <<choice>>
    state fixedDifficulty <<choice>>


    ######################## Colorations ######################

    triggerAction1:::fromOutside

    userFunction1:::userFunction

    userFunction1Return:::userFunctionReturn

    ##################### StateDiagram ########################

    [*] --> triggerAction1
    triggerAction1 --> userFunction1

    userFunction1 --> targetNumber: how many targets are selected
    targetNumber --> condition1
    targetNumber --> condition4
    targetNumber --> condition2

    condition1 --> fixedDifficulty: fixed difficulty set?
    condition4 --> fixedDifficulty: fixed difficulty set?

    fixedDifficulty --> state1: yes
    fixedDifficulty --> state2: no

    condition2 --> state3
    state3 --> state4
    state4 --> state5

    state1 --> userFunction1Return
    state2 --> userFunction1Return
    state5 --> userFunction1Return

    userFunction1Return --> [*]
```

### Related User Functions

[UF_PhysicalItems-getAggregatedDefense](../User%20Functions/UF_Physicalitems/UF_Physicalitems-getAggregatedDefense.md)

[UF_PhysicalItems-getDifficulty](../User%20Functions/UF_Physicalitems/UF_Physicalitems-getDifficulty.md)

### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Test case | [[Test] - action with single target](https://github.com/patrickmohrmann/earthdawn4eV2/issues/862) | 
| Test case | [[Test] - action against multiple targets](https://github.com/patrickmohrmann/earthdawn4eV2/issues/863) |