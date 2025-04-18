const { Token } = foundry.canvas.placeables;

export default class TokenEd extends Token {

  #black = 0x000000;

  /** @inheritDoc */
  _drawBar( number, bar, data ) {
    if ( data?.attribute === "healthRate" ) {
      return this._drawHealthBar( number, bar, data );
    }
    if ( data?.attribute === "karma" ) {
      return this._drawKarmaBar( number, bar, data );
    }
    return super._drawBar( number, bar, data );
  }

  /**
   * @description             Draw a health bar for the Token representing a rate of damage points.
   * @param {number} number   Index of the Bar being drawn
   * @param {PIXI.Graphics} bar      PIXI.Graphics instance for the Bar
   * @param {object} data     Data object for the Bar
   * @returns {undefined}     Returns undefined.
   * @userFunction            UF_TokenResources-drawHealthBar
   */
  _drawHealthBar( number, bar, data ) {
    const value = Number( data.value );
    const percentage = Math.clamp( value, 0, data.max ) / data.max;

    // Determine sizing
    const { width } = this.document.getSize();
    const barWidth = width;
    const barHeight = Math.max( canvas.dimensions.size / 12, 8 ) * ( this.document.height >= 2 ? 1.6 : 1 );
    const strokeWidth = Math.clamp( barHeight / 8, 1, 2 );

    // Determine the color to use
    const noDamageColor = Color.fromString( "#7fff00" ); // green
    const deathColor = Color.from( "#f90a00" );// red
    let color = noDamageColor.mix( deathColor, percentage );

    // Set up the bar container
    this._resetBar( bar, barWidth, barHeight, strokeWidth );

    // Draw the bar
    bar
      .beginFill( color, 1.0 )
      .lineStyle( strokeWidth, this.#black, 1.0 )
      .drawRoundedRect( 0, 0, percentage * barWidth, barHeight, 2 );

    // Position the bar
    this._setBarPosition( bar, number, barHeight );

    return undefined;
  }

  /**
   * @description             Draw a karma bar for the Token representing a rate of karma points.
   * @param {number} number   Index of the bar being drawn
   * @param {PIXI.Graphics} bar      PIXI.Graphics instance for the bar 
   * @param {object} data     Data object for the Bar
   * @returns {undefined}     Returns undefined.
   * @userFunction            UF_TokenResources-drawKarmaBar
   */
  _drawKarmaBar( number, bar, data ) {
    const value = Number( data.value );
    const max = Number( data.max );
    const spacing = 1; // Spacing between each small bar
    const barWidth = ( this.document.getSize().width / max ) - spacing; // Length of each small bar based on max value
    const barHeight = 5; // Fixed height for each small bar

    if ( barWidth < spacing ) return super._drawBar( number, bar, data );

    // Set the color for the karma bar
    const karmaColor = Color.from( "#7FB2FF" );

    // Reset the bar to clear any previous drawings
    bar.clear();

    // Loop to draw each small bar
    for ( let i = 0; i < max; i++ ) {
      const posX = i * ( barWidth + spacing ); // Calculate the X position of the current bar
      bar
        .beginFill( i < value ? karmaColor : this.#black, 1.0 )
        .lineStyle( 0.5, this.#black, 0.5 )
        .drawRoundedRect( posX, 0, barWidth, barHeight, 1 );
    }

    // Position the karma bar container
    this._setBarPosition( bar, number, barHeight );
  }

  _resetBar( bar, width, height, stroke ) {
    bar
      .clear()
      .beginFill( this.#black, 0.5 )
      .lineStyle( stroke, this.#black, 1.0 )
      .drawRoundedRect( 0, 0, width, height, 3 );
  }

  _setBarPosition( bar, order, height ) {
    // Set position
    const posY = order === 0 ? this.h - height : 0;
    bar.position.set( 0, posY );
  }
}