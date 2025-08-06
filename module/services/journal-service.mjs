/**
 * Journal Builder Service - Buffer-style journal creation and management
 * Allows incremental building of journals with multiple pages and content
 * Note: Named "JournalService" to maintain consistency with existing service naming patterns,
 * but implements a builder pattern for incremental journal construction.
 */
export default class JournalService {

  // region Type Definitions

  /**
   * @typedef {object} PageContentOptions
   * @property {string} [style] - Content style: "error", "warning", "info", "success", "to_do"
   * @property {string} [title] - Content block title
   * @property {boolean} [collapsible=false] - Whether to wrap in collapsible details
   * @property {object} [data] - Debug data to include
   * @property {string} [timestamp] - Custom timestamp (defaults to now)
   */

  /**
   * @typedef {object} JournalOptions
   * @description Configuration options for journal creation and management, derived from FoundryVTT's JournalEntry document structure
   * @property {string} [folder] - Folder ID where the journal should be placed
   * @property {number} [sort] - Sort order for the journal within its folder
   * @property {object} [flags] - Custom flags to attach to the journal for module/system-specific data
   * @property {object} [ownership] - Ownership settings controlling user permissions for the journal
   * @see {@link JournalEntry} - The Foundry document class these options configure
   * @see {@link JournalEntryData} - The data structure used to create or update journals
   */

  /**
   * @typedef {object} PageData
   * @description Internal representation of journal page data, derived from and compatible with FoundryVTT's JournalEntryPage structure
   * @property {string} name - The display name of the page
   * @property {string} type - The page type (typically "text" for HTML content)
   * @property {number} sort - Sort order for page arrangement (auto-incremented by 100 if not specified)
   * @property {object} title - Title configuration for the page
   * @property {boolean} title.show - Whether to display the page title
   * @property {number} title.level - Heading level for the title (1-6)
   * @property {string[]} content - Array of HTML content strings that will be joined when committed
   * @property {string} [_id] - Document ID if this page exists in the journal
   * @see {@link JournalEntry} - The Foundry document type this service manages
   * @see {@link JournalEntryPage} - The embedded document type that pages become when committed
   */

  // endregion

  // region Properties

  /**
   * The name of the journal
   * @type {string}
   */
  name;

  /**
   * Journal creation options
   * @type {object}
   */
  options;

  /**
   * Array of page data for the journal
   * @type {Array<PageData>}
   */
  pages;

  /**
   * Currently active page being built
   * @type {PageData|null}
   */
  currentPage;

  /**
   * The actual journal document once created
   * @type {JournalEntry|null}
   */
  journal;

  /**
   * Whether the journal has been created in the world
   * @type {boolean}
   */
  isCreated;

  /**
   * Track IDs of pages that need to be deleted
   * @type {Set<string>}
   */
  deletedPageIds;

  // endregion

  // region Constructor

  /**
   * Create a new journal builder instance
   * @param {string} name - Journal name
   * @param {JournalOptions} [options] - Journal configuration options
   */
  constructor( name, options = {} ) {
    this.name = name;
    this.options = options;
    this.pages = [];
    this.currentPage = null;
    this.journal = null;
    this.isCreated = false;
    this.deletedPageIds = new Set();
  }

  // endregion

  // region Page Creation and Management

  /**
   * Start a new page in the journal
   * @param {string} name - Page name
   * @param {object} [options] - Page options
   * @param {string} [options.type] - Page type
   * @param {number} [options.sort] - Sort order (auto-incremented if not provided)
   * @param {boolean} [options.showTitle] - Whether to show page title
   * @param {number} [options.titleLevel] - Title heading level
   * @returns {JournalService} This instance for chaining
   */
  startPage( name, options = {} ) {
    // Save current page state if it exists
    this._saveCurrentPageState();

    const sort = options.sort !== undefined
      ? options.sort
      : this.pages.length * 100;

    this.currentPage = {
      name:  name,
      type:  options.type || "text",
      sort:  sort,
      title: {
        show:  options.showTitle !== undefined ? options.showTitle : true,
        level: options.titleLevel || 1
      },
      content: []
    };

    // This is a new page, not editing an existing one

    return this;
  }

  /**
   * Remove a page by name or index
   * @param {string|number} pageIdentifier - Page name or index
   * @returns {JournalService} This instance for chaining
   */
  removePage( pageIdentifier ) {
    let targetIndex;

    if ( typeof pageIdentifier === "number" ) {
      targetIndex = pageIdentifier;
    } else {
      targetIndex = this.pages.findIndex( page => page.name === pageIdentifier );
    }

    if ( targetIndex < 0 || targetIndex >= this.pages.length ) {
      throw new Error( `Page "${pageIdentifier}" not found.` );
    }

    const pageToRemove = this.pages[targetIndex];

    // If this page has an existing document, mark it for deletion
    if ( pageToRemove._id ) {
      this.deletedPageIds.add( pageToRemove._id );
    }

    // If we're removing the current page, clear current page reference
    if ( this.currentPage && this.currentPage === pageToRemove ) {
      this.currentPage = null;
    }

    // Remove the page from the array
    this.pages.splice( targetIndex, 1 );

    return this;
  }

  /**
   * Insert a page at a specific position
   * @param {number} index - Position to insert at
   * @param {string} name - Page name
   * @param {object} [options] - Page options, see {@link #startPage}
   * @returns {JournalService} This instance for chaining
   */
  insertPageAt( index, name, options = {} ) {
    // Save current page state first
    this._saveCurrentPageState();

    // Calculate appropriate sort value to maintain position
    let sort;
    if ( options.sort !== undefined ) {
      sort = options.sort;
    } else {
      sort = this._calculateSortForPosition( index );
    }

    const newPage = {
      name:  name,
      type:  options.type || "text",
      sort:  sort,
      title: {
        show:  options.showTitle !== undefined ? options.showTitle : true,
        level: options.titleLevel || 1
      },
      content: []
    };

    this.pages.splice( index, 0, newPage );

    // After insertion, update sort values of subsequent pages if needed
    this._adjustSortValuesAfterInsertion( index );

    return this;
  }

  // endregion

  // region Private Helper Methods

  /**
   * Find the index of a page in the pages array, using robust comparison
   * @param {PageData} targetPage - The page to find
   * @returns {number} Index of the page, or -1 if not found
   * @private
   */
  _findPageIndex( targetPage ) {
    if ( !targetPage ) return -1;

    return this.pages.findIndex( page => {
      // If both pages have _id, use that for comparison (most reliable)
      if ( page._id && targetPage._id ) {
        return page._id === targetPage._id;
      }

      // Fall back to name + content length comparison for uniqueness
      return page.name === targetPage.name &&
             page.content.length === targetPage.content.length;
    } );
  }

  /**
   * Calculate appropriate sort value for inserting a page at a specific position
   * @param {number} index - The position where the page will be inserted
   * @returns {number} Sort value that maintains proper ordering
   * @private
   */
  _calculateSortForPosition( index ) {
    // If inserting at the beginning
    if ( index === 0 ) {
      if ( this.pages.length === 0 ) {
        return 100; // First page
      }
      // Insert before first page - use half of first page's sort value
      return Math.max( 50, Math.floor( this.pages[0].sort / 2 ) );
    }

    // If inserting at the end
    if ( index >= this.pages.length ) {
      const lastSort = this.pages.length > 0 ? this.pages[this.pages.length - 1].sort : 0;
      return lastSort + 100;
    }

    // Inserting between two pages
    const prevSort = this.pages[index - 1].sort;
    const nextSort = this.pages[index].sort;

    // If there's enough gap, use the midpoint
    if ( nextSort - prevSort > 1 ) {
      return Math.floor( ( prevSort + nextSort ) / 2 );
    }

    // Gap is too small, need to adjust subsequent pages
    return prevSort + 50;
  }

  /**
   * Adjust sort values of pages after insertion to maintain proper spacing
   * @private
   */
  _adjustSortValuesAfterInsertion() {
    this.pages.forEach( ( page, index ) => {
      page.sort = index * 100;
    } );
  }

  // endregion

  // region Page Navigation

  /**
   * Navigate to an existing page by name or index
   * @param {string|number} pageIdentifier - Page name or index
   * @returns {JournalService} This instance for chaining
   * @throws {Error} If page is not found
   */
  goToPage( pageIdentifier ) {
    // Save current page state first
    this._saveCurrentPageState();

    let targetIndex;

    if ( typeof pageIdentifier === "number" ) {
      targetIndex = pageIdentifier;
    } else {
      targetIndex = this.pages.findIndex( page => page.name === pageIdentifier );
    }

    if ( targetIndex < 0 || targetIndex >= this.pages.length ) {
      throw new Error( `Page "${pageIdentifier}" not found. Available pages: ${this.getPageNames().join( ", " )}` );
    }

    this.currentPage = foundry.utils.deepClone( this.pages[targetIndex] );

    return this;
  }

  /**
   * Navigate to the first page
   * @returns {JournalService} This instance for chaining
   */
  goToFirstPage() {
    if ( this.pages.length === 0 ) {
      throw new Error( "No pages available. Create a page with startPage() first." );
    }
    return this.goToPage( 0 );
  }

  /**
   * Navigate to the last page
   * @returns {JournalService} This instance for chaining
   */
  goToLastPage() {
    if ( this.pages.length === 0 ) {
      throw new Error( "No pages available. Create a page with startPage() first." );
    }
    return this.goToPage( this.pages.length - 1 );
  }

  /**
   * Navigate to the previous page
   * @returns {JournalService} This instance for chaining
   */
  goToPreviousPage() {
    if ( !this.currentPage ) {
      throw new Error( "No current page selected." );
    }

    const currentIndex = this._findPageIndex( this.currentPage );
    if ( currentIndex <= 0 ) {
      throw new Error( "Already at the first page or no current page." );
    }
    return this.goToPage( currentIndex - 1 );
  }

  /**
   * Navigate to the next page
   * @returns {JournalService} This instance for chaining
   */
  goToNextPage() {
    if ( !this.currentPage ) {
      throw new Error( "No current page selected." );
    }

    const currentIndex = this._findPageIndex( this.currentPage );
    if ( currentIndex < 0 || currentIndex >= this.pages.length - 1 ) {
      throw new Error( "Already at the last page or no current page." );
    }
    return this.goToPage( currentIndex + 1 );
  }

  // endregion

  // region Page Information and Utilities

  /**
   * Get names of all pages
   * @returns {string[]} Array of page names
   */
  getPageNames() {
    return this.pages.map( page => page.name );
  }

  /**
   * Get information about all pages
   * @returns {Array<{name: string, type: string, contentLength: number, index: number, isCurrent: boolean}>} Page information
   */
  getPageInfo() {
    return this.pages.map( ( page, index ) => ( {
      name:          page.name,
      type:          page.type,
      contentLength: page.content.length,
      index:         index,
      isCurrent:     this._findPageIndex( this.currentPage ) === index
    } ) );
  }

  /**
   * Check if a page exists
   * @param {string|number} pageIdentifier - Page name or index
   * @returns {boolean} Whether the page exists
   */
  hasPage( pageIdentifier ) {
    if ( typeof pageIdentifier === "number" ) {
      return pageIdentifier >= 0 && pageIdentifier < this.pages.length;
    }
    return this.pages.some( page => page.name === pageIdentifier );
  }

  /**
   * Get the current page name
   * @returns {string|null} Current page name or null if no current page
   */
  getCurrentPageName() {
    return this.currentPage ? this.currentPage.name : null;
  }

  // endregion

  // region Content Addition Methods

  /**
   * Add content to the current page
   * @param {string} content - HTML content to add
   * @param {PageContentOptions} [options] - Content styling options
   * @returns {JournalService} This instance for chaining
   */
  addContent( content, options = {} ) {
    if ( !this.currentPage ) {
      throw new Error( "No active page. Call startPage() or goToPage() first." );
    }

    let processedContent = content;

    // Apply styling if specified
    if ( options.style ) {
      processedContent = this._createStyledBlock( options.style, options.title, content );
    }

    // Add debug data if provided
    if ( options.data ) {
      const debugSection = this._createDetailsSection(
        "Debug Information",
        this._createCodeBlock( options.data )
      );
      processedContent += debugSection;
    }

    // Add timestamp info if specified
    if ( options.timestamp || options.style ) {
      const timestamp = options.timestamp || new Date().toISOString();
      const timeInfo = `<p><small><strong>Timestamp:</strong> ${new Date( timestamp ).toLocaleString()}</small></p>`;
      processedContent = timeInfo + processedContent;
    }

    // Wrap in collapsible if requested
    if ( options.collapsible ) {
      const summary = options.title || "Click to expand";
      processedContent = this._createDetailsSection( summary, processedContent );
    }

    this.currentPage.content.push( processedContent );
    return this;
  }

  /**
   * Add an error block to the current page
   * @param {string} title - Error title
   * @param {string} message - Error message
   * @param {object} [debugData] - Debug data to include
   * @returns {JournalService} This instance for chaining
   */
  addError( title, message, debugData = null ) {
    return this.addContent( message, {
      style:     "error",
      title:     title,
      data:      debugData,
      timestamp: new Date().toISOString()
    } );
  }

  /**
   * Add a warning block to the current page
   * @param {string} title - Warning title
   * @param {string} message - Warning message
   * @param {object} [debugData] - Debug data to include
   * @returns {JournalService} This instance for chaining
   */
  addWarning( title, message, debugData = null ) {
    return this.addContent( message, {
      style:     "warning",
      title:     title,
      data:      debugData,
      timestamp: new Date().toISOString()
    } );
  }

  /**
   * Add an info block to the current page
   * @param {string} title - Info title
   * @param {string} message - Info message
   * @param {object} [debugData] - Debug data to include
   * @returns {JournalService} This instance for chaining
   */
  addInfo( title, message, debugData = null ) {
    return this.addContent( message, {
      style: "info",
      title: title,
      data:  debugData
    } );
  }

  /**
   * Add a success block to the current page
   * @param {string} title - Success title
   * @param {string} message - Success message
   * @param {object} [debugData] - Debug data to include
   * @returns {JournalService} This instance for chaining
   */
  addSuccess( title, message, debugData = null ) {
    return this.addContent( message, {
      style: "success",
      title: title,
      data:  debugData
    } );
  }

  /**
   * Add a TO_DO block to the current page
   * @param {string} title - Title for the block
   * @param {string} message - Message content
   * @param {object} [debugData] - Debug data to include
   * @returns {JournalService} This instance for chaining
   */
  addTodo( title, message, debugData = null ) {
    return this.addContent( message, {
      style:     "to_do",
      title:     title,
      data:      debugData,
      timestamp: new Date().toISOString()
    } );
  }

  /**
   * Add a list of items to the current page
   * @param {Array<string|object>} items - List items (strings or {content, style} objects)
   * @param {object} [options] - List options
   * @param {boolean} [options.ordered] - Whether to use ordered list
   * @param {string} [options.title] - Optional title for the list
   * @returns {JournalService} This instance for chaining
   */
  addList( items, options = {} ) {
    let content = "";

    if ( options.title ) {
      content += `<h3>${options.title}</h3>`;
    }

    const tag = options.ordered ? "ol" : "ul";
    content += `<${tag}>`;

    items.forEach( item => {
      if ( typeof item === "string" ) {
        content += `<li>${item}</li>`;
      } else {
        let itemContent = item.content;
        if ( item.style ) {
          const styles = {
            error:   "color: #d32f2f;",
            warning: "color: #f57c00;",
            success: "color: #388e3c;",
            info:    "color: #1976d2;"
          };
          const style = styles[item.style] || "";
          itemContent = `<span style="${style}">${itemContent}</span>`;
        }
        content += `<li>${itemContent}</li>`;
      }
    } );

    content += `</${tag}>`;
    return this.addContent( content );
  }

  /**
   * Add a summary section with statistics
   * @param {object} stats - Statistics object
   * @param {string} [title] - Section title
   * @returns {JournalService} This instance for chaining
   */
  addSummary( stats, title = "Summary" ) {
    let content = `<h2>${title}</h2><ul>`;

    Object.entries( stats ).forEach( ( [ key, value ] ) => {
      const displayKey = key.charAt( 0 ).toUpperCase() + key.slice( 1 ).replace( /([A-Z])/g, " $1" );
      content += `<li><strong>${displayKey}:</strong> ${value}</li>`;
    } );

    content += "</ul>";
    return this.addContent( content );
  }

  // endregion

  // region Journal Lifecycle Methods

  /**
   * Create or update the journal in Foundry
   * @param {object} [options] - Creation options
   * @param {boolean} [options.show] - Show journal after creation
   * @param {boolean} [options.render] - Render journal sheet after creation
   * @param {boolean} [options.update] - Update existing journal if it exists
   * @returns {Promise<JournalEntry>} The created/updated journal
   */
  async commit( options = {} ) {
    // Save current page state before committing
    this._saveCurrentPageState();

    // Clear current page state after saving
    this.currentPage = null;

    if ( this.pages.length === 0 ) {
      throw new Error( "No pages to commit. Add at least one page with startPage() or go to an existing one." );
    }

    try {
      if ( this.journal && options.update !== false ) {
        // Update existing journal
        await this._updateJournal();
      } else {
        // Create new journal with initial pages
        await this._createNewJournal();
      }

      if ( options.show && game.user.isGM ) {
        await this.journal.show();
      }

      if ( options.render && game.user.isGM ) {
        await this.journal.sheet.render( true );
      }

      return this.journal;
    } catch ( error ) {
      console.error( "ED4e | JournalService: Failed to commit journal:", error );
      throw error;
    }
  }

  /**
   * Create a new journal with embedded pages
   * @private
   */
  async _createNewJournal() {
    // Process pages into Foundry format
    const processedPages = this.pages.map( page => ( {
      name:  page.name,
      type:  page.type,
      sort:  page.sort,
      title: page.title,
      text:  page.type === "text" ? {
        content: page.content.join( "\n" ),
        format:  CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
      } : undefined
    } ) );

    const journalData = {
      name:      this.name,
      pages:     processedPages,
      folder:    this.options.folder || null,
      sort:      this.options.sort || 0,
      ownership: this.options.ownership || {},
      flags:     this.options.flags || {}
    };

    this.journal = await JournalEntry.create( journalData );
    this.isCreated = true;

    // Update internal state with created journal
    this.pages = this.journal.pages.map( pageDoc => {
      return {
        _id:     pageDoc.id,
        name:    pageDoc.name,
        type:    pageDoc.type,
        sort:    pageDoc.sort,
        title:   pageDoc.title,
        content: pageDoc.type === "text" ? pageDoc.text.content.split( "\n" ) : [],
      };
    } );

    // Clear tracking sets since everything is now created
    this.deletedPageIds.clear();
  }

  /**
   * Update existing journal
   * @private
   */
  async _updateJournal() {
    // Update journal properties first (if needed)
    const journalUpdates = {};
    if ( this.journal.name !== this.name ) journalUpdates.name = this.name;

    if ( Object.keys( journalUpdates ).length > 0 ) {
      const updatedJournal = await this.journal.update( journalUpdates );
      this.journal = updatedJournal || this.journal;
    }

    // Handle page deletions
    if ( this.deletedPageIds.size > 0 ) {
      await this.journal.deleteEmbeddedDocuments( "JournalEntryPage", Array.from( this.deletedPageIds ) );
      this.deletedPageIds.clear();
    }

    // Separate pages into updates and creates
    const pagesToUpdate = [];
    const pagesToCreate = [];

    this.pages.forEach( page => {
      if ( page._id ) {
        // Existing page - update it
        pagesToUpdate.push( {
          _id:   page._id,
          name:  page.name,
          type:  page.type,
          sort:  page.sort,
          title: page.title,
          text:  page.type === "text" ? {
            content: page.content.join( "\n" ),
            format:  CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
          } : undefined
        } );
      } else {
        // New page - create it
        pagesToCreate.push( {
          name:  page.name,
          type:  page.type,
          sort:  page.sort,
          title: page.title,
          text:  page.type === "text" ? {
            content: page.content.join( "\n" ),
            format:  CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
          } : undefined
        } );
      }
    } );

    // Update existing pages
    if ( pagesToUpdate.length > 0 ) {
      await this.journal.updateEmbeddedDocuments( "JournalEntryPage", pagesToUpdate );
    }

    // Create new pages
    if ( pagesToCreate.length > 0 ) {
      const createdPages = await this.journal.createEmbeddedDocuments( "JournalEntryPage", pagesToCreate );

      // Store the IDs of newly created pages back into our page data
      let createIndex = 0;
      this.pages.forEach( page => {
        if ( !page._id && createIndex < createdPages.length ) {
          page._id = createdPages[createIndex].id;
          createIndex++;
        }
      } );
    }
  }

  /**
   * Save current page state to pages array
   * @private
   */
  _saveCurrentPageState() {
    if ( this.currentPage ) {
      // Check if this page already exists in the pages array using robust comparison
      const existingIndex = this._findPageIndex( this.currentPage );

      if ( existingIndex >= 0 ) {
        // Update existing page
        this.pages[existingIndex] = foundry.utils.deepClone( this.currentPage );
      } else {
        // Add new page
        this.pages.push( foundry.utils.deepClone( this.currentPage ) );
      }
    }
  }

  // endregion

  // region Content Styling Helpers

  /**
   * Create a styled content block
   * @param {string} style - Style type
   * @param {string} title - Block title
   * @param {string} content - Block content
   * @returns {string} Styled HTML
   * @private
   */
  _createStyledBlock( style, title, content ) {
    const styles = {
      error: {
        border: "#d32f2f",
        bg:     "#ffebee",
        color:  "#d32f2f",
        icon:   "⚠️"
      },
      warning: {
        border: "#f57c00",
        bg:     "#fff3e0",
        color:  "#e65100",
        icon:   "⚠️"
      },
      info: {
        border: "#1976d2",
        bg:     "#e3f2fd",
        color:  "#1565c0",
        icon:   "ℹ️"
      },
      success: {
        border: "#388e3c",
        bg:     "#e8f5e8",
        color:  "#2e7d32",
        icon:   "✅"
      },
      to_do: {
        border: "#7b1fa2",
        bg:     "#f3e5f5",
        color:  "#6a1b9a",
        icon:   "📝"
      }
    };

    const styleConfig = styles[style] || styles.info;
    const titleText = title ? `${styleConfig.icon} ${title}` : styleConfig.icon;

    return `
      <div style="border-left: 4px solid ${styleConfig.border}; background: ${styleConfig.bg}; padding: 12px; margin: 8px 0; border-radius: 4px; color: ${styleConfig.color};">
        <h4 style="margin: 0 0 8px 0; color: ${styleConfig.border};">${titleText}</h4>
        <div>${content}</div>
      </div>
    `;
  }

  /**
   * Create a collapsible details section
   * @param {string} summary - Summary text
   * @param {string} content - Content to show/hide
   * @returns {string} HTML details element
   * @private
   */
  _createDetailsSection( summary, content ) {
    return `
      <details style="margin: 8px 0; border: 1px solid #ccc; border-radius: 4px; padding: 8px;">
        <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">${summary}</summary>
        <div style="margin-top: 8px;">${content}</div>
      </details>
    `;
  }

  /**
   * Create a formatted code block
   * @param {object} data - Data to display
   * @returns {string} HTML code block
   * @private
   */
  _createCodeBlock( data ) {
    const jsonString = typeof data === "string" ? data : JSON.stringify( data, null, 2 );
    return `<pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 12px;"><code>${jsonString}</code></pre>`;
  }

  // endregion

  // region Static Factory Methods

  /**
   * Create a new journal builder instance (factory method)
   * @param {string} name - Journal name
   * @param {JournalOptions} [options] - Journal configuration options
   * @returns {JournalService} New service instance
   */
  static create( name, options = {} ) {
    return new JournalService( name, options );
  }

  /**
   * Create a journal from an existing JournalEntry
   * @param {JournalEntry} journal - Existing journal entry document
   * @returns {JournalService} New service instance
   */
  static fromExisting( journal ) {
    if ( !( journal instanceof JournalEntry ) ) {
      throw new Error( "Invalid journal input. Expected JournalEntry document." );
    }

    const service = new JournalService( journal.name, {
      folder:    journal.folder?.id,
      sort:      journal.sort,
      flags:     journal.flags,
      ownership: journal.ownership
    } );

    service.journal = journal;
    service.isCreated = true;

    // Convert existing pages to our format
    journal.pages.forEach( pageDoc => {
      const page = {
        _id:     pageDoc.id,
        name:    pageDoc.name,
        type:    pageDoc.type,
        sort:    pageDoc.sort,
        title:   pageDoc.title,
        content: pageDoc.type === "text" ? [ pageDoc.text.content ] : []
      };
      service.pages.push( page );
    } );

    return service;
  }

  /**
   * Load an existing journal by name, ID, or UUID
   * @param {string} identifier - Journal name, ID, or UUID
   * @returns {Promise<JournalService>} Service instance for the found journal
   * @throws {Error} If journal is not found
   */
  static async load( identifier ) {
    let journal;

    // Try UUID first
    if ( identifier.startsWith( "JournalEntry." ) || identifier.includes( "." ) ) {
      journal = await fromUuid( identifier );
    }

    // Try ID if UUID failed
    if ( !journal ) {
      journal = game.journal.get( identifier );
    }

    // Try name if ID failed
    if ( !journal ) {
      journal = game.journal.getName( identifier );
    }

    if ( !journal ) {
      throw new Error( `Journal not found with identifier: ${identifier}` );
    }

    return this.fromExisting( journal );
  }

  /**
   * Create a quick single-page journal
   * @param {string} name - Journal name
   * @param {string} pageName - Page name
   * @param {string} content - Page content
   * @param {object} [options] - Creation options
   * @returns {Promise<JournalEntry>} Created journal
   */
  static async createQuick( name, pageName, content, options = {} ) {
    const service = new JournalService( name, options );
    service.startPage( pageName ).addContent( content );
    return await service.commit( options );
  }

  // endregion
}
