/**
 * Return the dice term for a given step, based on the edition setting for step tables.
 * @param { number } step The step that is to be rolled.
 * @returns { string } A dice term that can be used in for a Roll in the Foundry api.
 */
export default function getDice( step ) {
  let dice = "";
  // minimum step must be at least 1
  if ( step < 0 ) {
    // eslint-disable-next-line no-param-reassign
    step = 1;
  }
  const edition = game.settings.get( "ed4e", "stepTable" );

  if ( edition === "fourth" ) {
    const stepTable = [
      "0",
      "1d4-2",
      "1d4-1",
      "1d4",
      "1d6",
      "1d8",
      "1d10",
      "1d12",
      "2d6",
      "1d8+1d6",
      "2d8",
      "1d10+1d8",
      "2d10",
      "1d12+1d10",
      "2d12",
      "1d12+2d6",
      "1d12+1d8+1d6",
      "1d12+2d8",
      "1d12+1d10+1d8",
      "1d20+2d6",
      "1d20+1d8+1d6",
    ];
    if ( step <= 20 ) {
      dice = stepTable[step];
    } else {
      let i = step;
      let loops = 0;
      while ( i > 20 ) {
        loops += 1;
        i -= 11;
      }
      // 1d20 + 2d6
      dice = loops + "d20+" + stepTable[i];
    }
  } else if ( edition === "third" ) {
    dice = get3eDice( step );
  } else if ( edition === "first" ) {
    dice = get1eDice( step );
  } else if ( edition === "classic" ) {
    dice = getCeDice( step );
  }
  return dice;
}

/**
 * @description step table of the third edition
 * @param { number } step The step that is to be rolled.
 * @returns { string } A dice term that can be used in for a Roll in the Foundry api.
 */
export function get3eDice( step ) {
  const stepsTable = [
    "0",
    "1d6 - 3",
    "1d6 - 2",
    "1d6 - 1",
    "1d6",
    "1d8",
    "1d10",
    "1d12",
    "2d6",
    "1d8 + 1d6",
    "2d8",
    "1d10 + 1d8",
    "2d10",
    "1d12 + 1d10",
    "2d12",
    "1d12 + 2d6",
    "1d12 + 1d8 + 1d6",
    "1d12 + 2d8",
    "1d12 + 1d10 + 1d8",
    "1d12 + 2d10",
    "2d12 + 1d10",
    "3d12",
    "2d12 + 2d6",
    "2d12 + 1d8 + 1d6",
    "2d12 + 2d8",
    "2d12 + 1d10 + 1d8",
    "2d12 + 2d10",
    "4d12",
    "3d12 + 2d6",
    "3d12 + 1d8 + 1d6",
    "3d12 + 2d8",
    "3d12 + 1d10 + 1d8",
    "3d12 + 2d10",
    "4d12 + 1d10",
    "5d12",
    "3d12 + 1d10",
    "4d12 + 2d6",
    "4d12 + 1d8 + 1d6",
    "4d12 + 2d8",
    "4d12 + 1d10 + 1d8",
    "4d12 + 2d10",
    "5d12 + 1d10",
    "6d12",
    "5d12 + 2d6",
    "5d12 + 1d8 + 1d6",
    "5d12 + 2d8",
    "5d12 + 1d10 + 1d8",
    "5d12 + 2d10",
    "6d12 + 1d10",
    "7d12",
    "6d12 + 2d6",
    "6d12 + 1d8 + 1d6",
    "6d12 + 2d8",
    "6d12 + 1d10 + 1d8",
    "6d12 + 2d10",
    "7d12 + 1d10",
    "8d12",
    "7d12 + 2d6",
    "7d12 + 1d8 + 1d6",
    "7d12 + 2d8",
    "7d12 + 1d10 + 1d8",
    "7d12 + 2d10",
    "8d12 + 1d10",
    "9d12",
    "8d12 + 2d6",
    "8d12 + 1d8 + 1d6",
    "8d12 + 2d8",
    "8d12 + 1d10 + 1d8",
    "8d12 + 2d10",
    "9d12 + 1d10",
    "10d12",
    "9d12 + 2d6",
    "9d12 + 1d8 + 1d6",
    "9d12 + 2d8",
    "9d12 + 1d10 + 1d8",
    "9d12 + 2d10",
    "10d12 + 1d10",
    "11d12",
    "10d12 + 2d6",
    "10d12 + 1d8 + 1d6",
    "10d12 + 2d8",
    "10d12 + 1d10 + 1d8",
    "10d12 + 2d10",
    "11d12 + 1d10",
    "12d12",
    "11d12 + 2d6",
    "11d12 + 1d8 + 1d6",
    "11d12 + 2d8",
    "11d12 + 1d10 + 1d8",
    "11d12 + 2d10",
    "12d12 + 1d10",
    "13d12",
    "12d12 + 2d6",
    "12d12 + 1d8 + 1d6",
    "12d12 + 2d8",
    "12d12 + 1d10 + 1d8",
    "12d12 + 2d10",
    "13d12 + 1d10",
    "14d12",
    "13d12 + 2d6",
    "13d12 + 1d8 + 1d6",
  ];
  if ( step > 100 || step < 1 ) {
    ui.notifications.error( "This Step Table does Not Support That Number" );
    return false;
  }
  return stepsTable[step];
}

/**
 * @description step table of the first edition
 * @param { number } step The step that is to be rolled.
 * @returns { string } A dice term that can be used in for a Roll in the Foundry api.
 */
function get1eDice( step ) {
  const stepsTable = [
    "0",
    "1d4 - 2",
    "1d4 - 1",
    "1d4",
    "1d6",
    "1d8",
    "1d10",
    "1d12",
    "2d6",
    "1d8 + 1d6",
    "1d10 + 1d6",
    "1d10 + 1d8",
    "2d10",
    "1d12 + 1d10",
    "1d20 + 1d4",
    "1d20 + 1d6",
    "1d20 + 1d8",
    "1d20 + 1d10",
    "1d20 + 1d12",
    "1d20 + 2d6",
    "1d20 + 1d8 + 1d6",
    "1d20 + 1d10 + 1d6",
    "1d20 + 1d10 + 1d8",
    "1d20 + 2d10",
    "1d20 + 1d12 + 1d10",
    "1d20 + 1d10 + 1d8 + 1d4",
    "1d20 + 1d10 + 1d8 + 1d6",
    "1d20 + 1d10 + 2d8",
    "1d20 + 2d10 + 1d8",
    "1d20 + 1d12 + 1d10 + 1d8",
    "1d20 + 1d10 + 1d8 + 2d6",
    "1d20 + 1d10 + 2d8 + 1d6",
    "1d20 + 2d10 + 1d8 + 1d6",
    "1d20 + 2d10 + 2d8",
    "1d20 + 3d10 + 1d8",
    "1d20 + 1d12 + 2d10 + 1d8",
    "2d20 + 1d10 + 1d8 + 1d4",
    "2d20 + 1d10 + 1d8 + 1d6",
    "2d20 + 1d10 + 2d8",
    "2d20 + 2d10 + 1d8",
    "2d20 + 1d12 + 1d10 + 1d8",
    "2d20 + 1d10 + 1d8 + 2d6",
    "2d20 + 1d10 + 2d8 + 1d6",
    "2d20 + 2d10 + 1d8 + 1d6",
    "2d20 + 2d10 + 2d8",
    "2d20 + 3d10 + 1d8",
    "2d20 + 1d12 + 2d10 + 1d8",
    "2d20 + 2d10 + 2d8 + 1d4",
    "2d20 + 2d10 + 2d8 + 1d6",
    "2d20 + 2d10 + 3d8",
    "2d20 + 3d10 + 2d8",
    "2d20 + 1d12 + 2d10 + 2d8",
    "2d20 + 2d10 + 2d8 + 2d6",
    "2d20 + 2d10 + 3d8 + 1d6",
    "2d20 + 3d10 + 2d8 + 1d6",
    "2d20 + 3d10 + 3d8",
    "2d20 + 4d10 + 2d8",
    "2d20 + 1d12 + 3d10 + 2d8",
    "3d20 + 2d10 + 2d8 + 1d4",
    "3d20 + 2d10 + 2d8 + 1d6",
    "3d20 + 2d10 + 3d8",
    "3d20 + 3d10 + 2d8",
    "3d20 + 1d12 + 2d10 + 2d8",
    "3d20 + 2d10 + 2d8 + 2d6",
    "3d20 + 2d10 + 3d8 + 1d6",
    "3d20 + 3d10 + 2d8 + 1d6",
    "3d20 + 3d10 + 3d8",
    "3d20 + 4d10 + 2d8",
    "3d20 + 1d12 + 3d10 + 2d8",
    "3d20 + 3d10 + 3d8 + 1d4",
    "3d20 + 3d10 + 3d8 + 1d6",
    "3d20 + 3d10 + 4d8",
    "3d20 + 4d10 + 3d8",
    "3d20 + 1d12 + 3d10 + 3d8",
    "3d20 + 3d10 + 3d8 + 2d6",
    "3d20 + 3d10 + 4d8 + 1d6",
    "3d20 + 4d10 + 3d8 + 1d6",
    "3d20 + 4d10 + 4d8",
    "3d20 + 5d10 + 3d8",
    "3d20 + 1d12 + 4d10 + 3d8",
    "4d20 + 3d10 + 3d8 + 1d4",
    "4d20 + 3d10 + 3d8 + 1d6",
    "4d20 + 3d10 + 4d8",
    "4d20 + 4d10 + 3d8",
    "4d20 + 1d12 + 3d10 + 3d8",
    "4d20 + 3d10 + 3d8 + 2d6",
    "4d20 + 3d10 + 4d8 + 1d6",
    "4d20 + 4d10 + 3d8 + 1d6",
    "4d20 + 4d10 + 4d8",
    "4d20 + 5d10 + 3d8",
    "4d20 + 1d12 + 4d10 + 3d8",
    "4d20 + 4d10 + 4d8 + 1d4",
    "4d20 + 4d10 + 4d8 + 1d6",
    "4d20 + 4d10 + 5d8",
    "4d20 + 5d10 + 4d8",
    "4d20 + 1d12 + 4d10 + 4d8",
    "4d20 + 4d10 + 4d8 + 2d6",
    "4d20 + 4d10 + 5d8 + 1d6",
    "4d20 + 5d10 + 4d8 + 1d6",
    "4d20 + 5d10 + 5d8",
    "4d20 + 6d10 + 4d8",
  ];
  if ( step > 100 || step < 1 ) {
    ui.notifications.error( "This Step Table Does Not Support That Number" );
    return false;
  }
  return stepsTable[step];
}

/**
 * @description step table of the classic edition
 * @param { number } step The step that is to be rolled.
 * @returns { string } A dice term that can be used in for a Roll in the Foundry api.
 */
export function getCeDice( step ) {
  const stepsTable = [
    "0",
    "1d4 - 2",
    "1d4 - 1",
    "1d4",
    "1d6",
    "1d8",
    "1d10",
    "1d12",
    "2d6",
    "1d8 + 1d6",
    "1d10 + 1d6",
    "1d10 + 1d8",
    "2d10",
    "1d12 + 1d10",
    "2d12",
    "1d20 + 1d6",
    "1d20 + 1d8",
    "1d20 + 1d10",
    "1d20 + 1d12",
    "1d20 + 2d6",
    "1d20 + 1d8 + 1d6",
    "1d20 + 1d10 + 1d6",
    "1d20 + 1d10 + 1d8",
    "1d20 + 2d10",
    "1d20 + 1d12 + 1d10",
    "1d20 + 1d10 + 1d8 + 1d4",
    "1d20 + 1d10 + 1d8 + 1d6",
    "1d20 + 1d10 + 2d8",
    "1d20 + 2d10 + 1d8",
    "1d20 + 1d12 + 1d10 + 1d8",
    "1d20 + 1d10 + 1d8 + 2d6",
    "1d20 + 1d10 + 2d8 + 1d6",
    "1d20 + 2d10 + 1d8 + 1d6",
    "1d20 + 2d10 + 2d8",
    "1d20 + 3d10 + 1d8",
    "1d20 + 1d12 + 2d10 + 1d8",
    "2d20 + 1d10 + 1d8 + 1d4",
    "2d20 + 1d10 + 1d8 + 1d6",
    "2d20 + 1d10 + 2d8",
    "2d20 + 2d10 + 1d8",
    "2d20 + 1d12 + 1d10 + 1d8",
    "2d20 + 1d10 + 1d8 + 2d6",
    "2d20 + 1d10 + 2d8 + 1d6",
    "2d20 + 2d10 + 1d8 + 1d6",
    "2d20 + 2d10 + 2d8",
    "2d20 + 3d10 + 1d8",
    "2d20 + 1d12 + 2d10 + 1d8",
    "2d20 + 2d10 + 2d8 + 1d4",
    "2d20 + 2d10 + 2d8 + 1d6",
    "2d20 + 2d10 + 3d8",
    "2d20 + 3d10 + 2d8",
    "2d20 + 1d12 + 2d10 + 2d8",
    "2d20 + 2d10 + 2d8 + 2d6",
    "2d20 + 2d10 + 3d8 + 1d6",
    "2d20 + 3d10 + 2d8 + 1d6",
    "2d20 + 3d10 + 3d8",
    "2d20 + 4d10 + 2d8",
    "2d20 + 1d12 + 3d10 + 2d8",
    "3d20 + 2d10 + 2d8 + 1d4",
    "3d20 + 2d10 + 2d8 + 1d6",
    "3d20 + 2d10 + 3d8",
    "3d20 + 3d10 + 2d8",
    "3d20 + 1d12 + 2d10 + 2d8",
    "3d20 + 2d10 + 2d8 + 2d6",
    "3d20 + 2d10 + 3d8 + 1d6",
    "3d20 + 3d10 + 2d8 + 1d6",
    "3d20 + 3d10 + 3d8",
    "3d20 + 4d10 + 2d8",
    "3d20 + 1d12 + 3d10 + 2d8",
    "3d20 + 3d10 + 3d8 + 1d4",
    "3d20 + 3d10 + 3d8 + 1d6",
    "3d20 + 3d10 + 4d8",
    "3d20 + 4d10 + 3d8",
    "3d20 + 1d12 + 3d10 + 3d8",
    "3d20 + 3d10 + 3d8 + 2d6",
    "3d20 + 3d10 + 4d8 + 1d6",
    "3d20 + 4d10 + 3d8 + 1d6",
    "3d20 + 4d10 + 4d8",
    "3d20 + 5d10 + 3d8",
    "3d20 + 1d12 + 4d10 + 3d8",
    "4d20 + 3d10 + 3d8 + 1d4",
    "4d20 + 3d10 + 3d8 + 1d6",
    "4d20 + 3d10 + 4d8",
    "4d20 + 4d10 + 3d8",
    "4d20 + 1d12 + 3d10 + 3d",
    "4d20 + 3d10 + 3d8 + 2d6",
    "4d20 + 3d10 + 4d8 + 1d6",
    "4d20 + 4d10 + 3d8 + 1d6",
    "4d20 + 4d10 + 4d8",
    "4d20 + 5d10 + 3d8",
    "4d20 + 1d12 + 4d10 + 3d8",
    "4d20 + 4d10 + 4d8 + 1d4",
    "4d20 + 4d10 + 4d8 + 1d6",
    "4d20 + 4d10 + 5d8",
    "4d20 + 5d10 + 4d8",
    "4d20 + 1d12 + 4d10 + 4d8",
    "4d20 + 4d10 + 4d8 + 2d6",
    "4d20 + 4d10 + 5d8 + 1d6",
    "4d20 + 5d10 + 4d8 + 1d6",
    "4d20 + 5d10 + 5d8",
    "4d20 + 6d10 + 4d8",
  ];
  if ( step > 100 || step < 1 ) {
    ui.notifications.error( "This Step Table Does Not Support That Number" );
    return false;
  }
  return stepsTable[step];
}