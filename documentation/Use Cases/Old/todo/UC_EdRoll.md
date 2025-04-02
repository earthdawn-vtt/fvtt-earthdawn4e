This Use Case covers the handling of Roll data. it is triggered by all use cases which roll any dice. Based on the input the triggering function provide this use case evaluates the result. Success, failure, extra successes are only the obvious validations, but this function does also handle the explosion of dice, the handling of additional dice like karma, devotions or similar options. 

Based on the input the information needed to show all relevant details are prepared together with the right chat message file.

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

    triggerAction1: UF_Rolls-createRoll
    triggerAction2: UF_Rolls-triggerRollStep 
    triggerAction3: UF_Rolls_triggerDiceIconRoll

    userFunction1: UF_Rolls-setChatFlavor
    userFunction2: UF_Rolls-numDice
    userFunction3: UF_Rolls-totalStrain
    userFunction4: UF_Rolls-getChatFlavor
    userFunction5: UF_Rolls-stepsFormula
    userFunction6: UF_Rolls-explodingDice
    userFunction7: UF_Rolls-addExtraDice
    userFunction8: UF_Rolls-addResourceDice
    userFunction9: UF_Rolls-addExtraSteps
    userFunction10: UF_Rolls-addSuccessClass
    userFunction11: UF_Rolls-getTooltipsRollData
    userFunction12: UF_Rolls-getTooltip
    userFunction13: UF_Rolls-render

    userFunction14: UF_Rolls-getFlavorTemplateData
    userFunction15: UF_Rolls-total
    userFunction16: UF_Rolls-isSuccess
    userFunction17: UF_Rolls-isFailure
    userFunction18: UF_Rolls-ruleOfOne
    userFunction19: UF_Rolls-numSuccesses
    userFunction20: UF_Rolls-numExtraSuccesses

    userFunction21: UF_Rolls-toMessage
    

    foundryCore1: toMessage
    foundryCore2: resetFormula
    foundryCore3: getResultLabel
    foundryCore4: getResultCSS

    dialog1: Roll Prompt

   
    ####################### Decisions #######################
  
    state fork_state1 <<fork>>
    state fork_state2 <<fork>>

    state join_state1 <<join>>
    state join_state2 <<join>>

    ######################## Colorations ######################

    triggerAction1:::fromOutside
    triggerAction2:::fromOutside
    triggerAction3:::fromOutside

    userFunction1:::userFunction
    userFunction1:::userFunction
    userFunction2:::userFunction
    userFunction3:::userFunction
    userFunction4:::userFunction
    userFunction5:::userFunction
    userFunction6:::userFunction
    userFunction7:::userFunction
    userFunction8:::userFunction
    userFunction9:::userFunction
    userFunction10:::userFunction
    userFunction11:::userFunction
    userFunction12:::userFunction
    userFunction13:::userFunction
    userFunction14:::userFunction
    userFunction15:::userFunction
    userFunction16:::userFunction
    userFunction17:::userFunction
    userFunction18:::userFunction
    userFunction19:::userFunction
    userFunction20:::userFunction
    userFunction21:::userFunction



    dialog1:::dialog

    foundryCore1:::foundryCore
    foundryCore2:::foundryCore
    foundryCore3:::foundryCore
    foundryCore4:::foundryCore

    ##################### StateDiagram ########################


triggerAction2 --> dialog1
triggerAction3 --> dialog1

triggerAction1 --> dialog1
dialog1 --> fork_state1

fork_state1 --> userFunction1: sets the predefined chat flavor
fork_state1 --> userFunction3

fork_state1 --> userFunction6: enhances all dice to be explodable
fork_state1 --> userFunction7: collects all extra dice (e.g. Karma)
fork_state1 --> userFunction10: ccs update class for success or failure

fork_state1 --> userFunction13

userFunction7 --> userFunction8
userFunction7 --> userFunction9

userFunction8 --> foundryCore2
userFunction9 --> foundryCore2

foundryCore2 --> join_state1

userFunction13 --> userFunction5: Combines all steps as one string
userFunction5 --> userFunction12

userFunction12 --> userFunction11

userFunction11 --> foundryCore3
userFunction11 --> foundryCore4

foundryCore3 --> join_state1
foundryCore4 --> join_state1

userFunction1 --> join_state1
userFunction3 --> join_state1
userFunction6 --> join_state1
userFunction10 --> join_state1


userFunction4 --> userFunction14
userFunction14 --> fork_state2

fork_state2 --> userFunction15
fork_state2 --> userFunction16
fork_state2 --> userFunction17

fork_state2 --> userFunction19


userFunction15 --> join_state2
userFunction16 --> join_state2
userFunction17 --> join_state2
userFunction18 --> join_state2
userFunction20 --> join_state2

fork_state2 --> userFunction2
userFunction2 --> userFunction18

userFunction19 --> userFunction20

join_state1 --> userFunction21

userFunction21 --> userFunction4

join_state2 --> foundryCore1

foundryCore1 --> [*]
```

### Related User Functions

[UF_Rolls-total](../User%20Functions/UF_Rolls/UF_Rolls-total.md)

[UF_Rolls-ruleOfOne](../User%20Functions/UF_Rolls/UF_Rolls-ruleOfOne.md)

[UF_Rolls-isSuccess](../User%20Functions/UF_Rolls/UF_Rolls-isSuccess.md)

[UF_Rolls-isFailure](../User%20Functions/UF_Rolls/UF_Rolls-isFailure.md)

[UF_Rolls-numDice](../User%20Functions/UF_Rolls/UF_Rolls-numDice.md)

[UF_Rolls-totalStrain](../User%20Functions/UF_Rolls/UF_Rolls-totalStrain.md)

[UF_Rolls-numSuccesses](../User%20Functions/UF_Rolls/UF_Rolls-numSuccesses.md)

[UF_Rolls-numExtraSuccesses](../User%20Functions/UF_Rolls/UF_Rolls-numExtraSuccesses.md)

[UF_Rolls-getChatFlavor](../User%20Functions/UF_Rolls/UF_Rolls-getChatFlavor.md)

[UF_Rolls-setChatFlavor](../User%20Functions/UF_Rolls/UF_Rolls-setChatFlavor.md)

[UF_Rolls-stepFormula](../User%20Functions/UF_Rolls/UF_Rolls-stepFormula.md)

[UF_Rolls-explodingDice](../User%20Functions/UF_Rolls/UF_Rolls-explodingDice.md)

[UF_Rolls-addExtraDice](../User%20Functions/UF_Rolls/UF_Rolls-addExtraDice.md)

[UF_Rolls-addResourceDice](../User%20Functions/UF_Rolls/UF_Rolls-addResourceDice.md)

[UF_Rolls-addExtraSteps](../User%20Functions/UF_Rolls/UF_Rolls-addExtraSteps.md)

[UF_Rolls-getFlavorTemplateData](../User%20Functions/UF_Rolls/UF_Rolls-getFlavorTemplateData.md)

[UF_Rolls-addSuccessClass](../User%20Functions/UF_Rolls/UF_Rolls-addSuccessClass.md)

[UF_Rolls-getTooltipsRollData](../User%20Functions/UF_Rolls/UF_Rolls-getTooltipsRollData.md)

[UF_Rolls-getTooltip](../User%20Functions/UF_Rolls/UF_Rolls-getTooltip.md)

[UF_Rolls-render](../User%20Functions/UF_Rolls/UF_Rolls-render.md)

[UF_Rolls-toMessage](../User%20Functions/UF_Rolls/UF_Rolls-toMessage.md)



### Related Test Coverage

- every Flavor file with every option. so one test per flavor should cover all.

are thread weaving und spellcasting different from ability? probably at least spellcasting because it triggers effect options like attack. thread weaving might not.

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Ability rolls | [[Test] - Ability Rolls](https://github.com/patrickmohrmann/earthdawn4eV2/issues/936) |
| arbitrary Rolls | [[Test] - Roll from Journal ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/932) |
| arbitrary Rolls | [[Test] - roll from Chat](https://github.com/patrickmohrmann/earthdawn4eV2/issues/933) |
| arbitrary Rolls | [[Test] - System Setting Step tables](https://github.com/patrickmohrmann/earthdawn4eV2/issues/386) |
| Attack rolls | [[Test] - Attack Rolls](https://github.com/patrickmohrmann/earthdawn4eV2/issues/937) |
| Attribute Rolls | [[Test] - Attribute Roll](https://github.com/patrickmohrmann/earthdawn4eV2/issues/938) |
| damage Rolls | [[Test] - Damage roll](https://github.com/patrickmohrmann/earthdawn4eV2/issues/939) |
| effect Rolls | [[Test] - effect roll](https://github.com/patrickmohrmann/earthdawn4eV2/issues/940) |
| Half magic Rolls | [[Test] - roll half magic](https://github.com/patrickmohrmann/earthdawn4eV2/issues/941) |
| Initiative Rolls | [[Test] - initiative roll](https://github.com/patrickmohrmann/earthdawn4eV2/issues/942) |
| Spellcasting Rolls | [[Test] - Spellcasting roll](https://github.com/patrickmohrmann/earthdawn4eV2/issues/943) |
| Thread weaving Rolls | [[Test] - weave threads](https://github.com/patrickmohrmann/earthdawn4eV2/issues/944) |
| Basic Rolls (rule of one, success, failure, exploding etc.) | [[Test] - Basic rolls ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/945) |


