Tests in Earthdawn are considered to be one of two types. Either an **Action Test** or an **Effect Test**. With a virtual Table top in mind, there is also the option to just have an **arbitrary Test** which could be either. All three types are classified by the rollType configuration, which is based on the abilities, items or settings of such. Talents-, Skills- and Devotions tests are by default allways Action tests, Recovery and Damage Tests on the other hand are usually Effect tests. Arbitrary tests are neither of the above, but just rolls of a certain step number.

## Action Tests

Action Tests cover the following tests:
* Abilities
* Attacks
* Powers
* Attributes
* Half magic
* Spellcasting
* Thread weaving

those tests require a Difficulty Number (short DN) to cover all possibilities like special maneuvers or triggering effects or damage rolls. 

To have the DN, a target needs to be selected. Since it is easy for users to just roll any ability etc. it is not prohibited to just roll an ability without a target DN, in these cases, the system is just not supporting all related options.

Action tests rolled against a DN provide success and extra success or a failure information. 

Action Tests have a minimum DN of 2 no matter the amount of penalties.

### Diagram
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef foundryCore font-style:italic,font-weight:bold,fill: lightgreen
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue
    classDef userFunctionReturn font-style:italic,font-weight:bold,fill:aqua
    classDef dialog font-style:italic,font-weight:bold,fill:orange
    classDef subUseCase font-style:italic,font-weight:bold,fill:violet

    ###################### status #######################

    triggerAction1: Initiate Test

    userFunction1: UF_Rolls-rollAttribute
    userFunction2: UF_Rolls-rollAbility
    userFunction3: UF_Rolls-rollEquipment
    userFunction4: UF_Rolls-rollPower
    userFunction5: UF_Rolls-rollAttack
    userFunction6: UF_Rolls-rollHalfMagic

    userFunction7: UF_Rolls-processRoll

    userFunction8: UF_Rolls-processRollType

    foundryCore1: toMessage

    userFunction10: UF_ActorDocument-takeDamage
    userFunction11: UF_ActorDocument-useResource

    subUseCase1: UC_EdRoll

    dialog1: Roll Prompt

    state1: Ability Test
    state2: Spellcasting Tests
    state3: thread weaving Tests
    state4: Attacks Test
    state5: Attributes Test
    state6: Halfmagic Test
    state7: equipment tests
    state8: Power Tests

    state9: strain
    state10: karma & Devotion

    ####################### Decisions #######################

    state DECISION1 <<choice>>
    state DECISION2 <<choice>>

    state fork_state1 <<fork>>

    state join_state1 <<join>>

    ######################## Colorations ######################

    triggerAction1:::fromOutside

    userFunction1:::userFunction
    userFunction2:::userFunction
    userFunction3:::userFunction
    userFunction4:::userFunction
    userFunction5:::userFunction
    userFunction6:::userFunction
    userFunction7:::userFunction
    userFunction8:::userFunction

    userFunction10:::userFunction
    userFunction11:::userFunction

    subUseCase1:::subUseCase

    dialog1:::dialog

    foundryCore1:::foundryCore

    ##################### StateDiagram ########################

    [*] --> triggerAction1
    triggerAction1 --> DECISION1: which rollType?
    DECISION1 --> state1
    DECISION1 --> state2
    DECISION1 --> state3
    DECISION1 --> state4
    DECISION1 --> state5
    DECISION1 --> state6
    DECISION1 --> state7
    DECISION1 --> state8
    
    state1 --> userFunction2
    state2 --> userFunction2
    state3 --> userFunction2

    state5 --> userFunction1

    state4 --> userFunction5

    state6 --> userFunction6

    state8 --> userFunction4

    state7 --> userFunction3

    userFunction1 --> dialog1
    userFunction2 --> dialog1 
    userFunction3 --> dialog1
    userFunction4 --> dialog1
    userFunction5 --> dialog1
    userFunction6 --> dialog1

    dialog1 --> subUseCase1
    subUseCase1 --> userFunction7

    userFunction7 --> fork_state1

    fork_state1 --> DECISION2

    fork_state1 --> state9
    fork_state1 --> state10

    state9 --> userFunction10
    state10 --> userFunction11

    DECISION2 --> userFunction8: special processesor required?
    DECISION2 --> join_state1
    userFunction8 --> join_state1


    userFunction10 --> join_state1
    userFunction11 --> join_state1

    join_state1 --> foundryCore1
    foundryCore1 --> [*]
```

### Related User Functions

[UF_Rolls-explodingDice](../User%20Functions/UF_Rolls/UF_Rolls-explodingDice.md)

[UF_Rolls-rollAttribute](../User%20Functions/UF_Rolls/UF_Rolls-rollAttribute.md)

[UF_Rolls-rollAbility](../User%20Functions/UF_Rolls/UF_Rolls-rollAbility.md)

[UF_Rolls-rollEquipment](../User%20Functions/UF_Rolls/UF_Rolls-rollEquipment.md)

[UF_Rolls-rollHalfMagic](../User%20Functions/UF_Rolls/UF_Rolls-rollHalfMagic.md)

[UF_Rolls-rollPower](../User%20Functions/UF_Rolls/UF_Rolls-rollPower.md)

[UF_Rolls-rollAttack](../User%20Functions/UF_Rolls/UF_Rolls-rollAttack.md)



### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Roll Halfmagic | [[Test] - roll half magic](https://github.com/patrickmohrmann/earthdawn4eV2/issues/922) |
| Roll Halfmagic | [[Test] - roll half magic for multi disciplines](https://github.com/patrickmohrmann/earthdawn4eV2/issues/923) |
| Roll Attribute | [[Test] - roll Attributes](https://github.com/patrickmohrmann/earthdawn4eV2/issues/924) |
| Roll Talent | [[Test] - roll Talent](https://github.com/patrickmohrmann/earthdawn4eV2/issues/925) |
| Roll Skill | [[Test] - roll skill](https://github.com/patrickmohrmann/earthdawn4eV2/issues/926) |
| Roll Devotion | [[Test] - roll devotion](https://github.com/patrickmohrmann/earthdawn4eV2/issues/927) |
| Roll Power | [[Test] - roll power](https://github.com/patrickmohrmann/earthdawn4eV2/issues/928) |
| Roll Attack | [[Test] - roll attack](https://github.com/patrickmohrmann/earthdawn4eV2/issues/929) |
| Roll Equipment | [[Test] - roll Equipment](https://github.com/patrickmohrmann/earthdawn4eV2/issues/930) |
| Cast Spells | [[Test] - cast a Spell](https://github.com/patrickmohrmann/earthdawn4eV2/issues/931) |




