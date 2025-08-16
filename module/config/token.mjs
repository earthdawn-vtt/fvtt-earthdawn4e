export const prototypeToken = {
  character: {
    sight:       {enabled: true},
    actorLink:   true,
    disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
    bar2: {
      attribute: "karma"
    }
  },
  npc: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
    bar2: {
      attribute: "karma"
    }
  },
  creature: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
  },
  dragon: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
    bar2: {
      attribute: "karma"
    }
  },
  spirit: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
    bar2: {
      attribute: "karma"
    }
  },
  horror: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
    bar2: {
      attribute: "karma"
    }
  },
  trap: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
  },
  group: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
  },
  vehicle: {
    sight:       {enabled: true},
    actorLink:   false,
    disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    displayBars: 50,  // Always Display bar 1 and 2
    displayName: 30,  // Display nameplate on hover
    bar1:        {
      attribute: "healthRate"
    },
  }
};