export default class ImageMigration {

  static async migrateData( source ) {

    source.img = "icons/svg/item-bag.svg";
    // if ( source.img ) {
    //   foundry.canvas.srcExists( source.img ).then( fileExists => {
    //     if ( !fileExists ) {
    //       source.img = "systems/ed4e/assets/artwork/namegiver/colored-obsidiman-full-page.webp";
    //       console.log( "SOURCE", source.img );
    //       // You may need to update the document here if required
    //     }
    //   } );
    // }
    // Return the modified source if your migration system expects it
    return source;
  }
}