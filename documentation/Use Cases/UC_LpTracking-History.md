This use case covers the tracking of Legend points of an actor, every add, edit or deletion will be tracked. Two different overviews are available in the History prompt, showing an History of all earned legend Points and another history shows all spendings of legend points. Each of the tabs have a check to show deletions as well. if this is checked, the deleted history entries will be shown.

### Diagram
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow

    state1: Legend Point History
    state2: spendings
    state3: earnings
    state4: update spendings
    state5: update earnings

    interaction1: spend LP
    interaction2: revert spending
    interaction3: award LP

    interaction1:::fromOutside
    interaction2:::fromOutside
    interaction3:::fromOutside

    [*] --> state1
    state1 --> state2
    interaction3 --> state5: add Lp Transaction
    state5 --> state3
    state1 --> state3
    interaction1 --> state4: add Lp Transaction
    state4 --> state2
    interaction2 --> state4: add Lp Transaction
    state2 --> [*]
    state3 --> [*]
    
```

### Related User Functions

[UF_LpTracking-addLpTransaction](../User%20Functions/UF_LpTracking/UF_LpTracking-addLpTransaction.md)

[UF_LpTracking-legendpointHistory](../User%20Functions/UF_LpTracking/UF_LpTracking-legendpointHistory.md)

[UF_LpTracking-toggleTransactionDetails](../User%20Functions/UF_LpTracking/UF_LpTracking-toggleTransactionDetails.md)

[UF_LpTracking-status](../User%20Functions/UF_LpTracking/UF_LpTracking-status.md)

### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Add Legend Points | [[Test] - add legend points manually](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1317) |
| Add Legend Points | [[Test] - add legend points manually](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1317) |
| Add Legend Points | [[Test] - add legend points manually](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1317) |
| Add Legend Points | [[Test] - add legend points manually](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1317) |









 



