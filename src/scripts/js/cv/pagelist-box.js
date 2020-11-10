
(function($) {
	function addPage(opts, ul, page, text) {
		var a = addElem(addElem(ul, "li"), "a");
		$(a).html(text || page).click(function() { return opts.click(page); });
		a.href = "#page-" + page; //link page reference
	};

	function limits(opts, page) {
		page = page || opts.currentPage || 1; //default = currentPage
		var pages = Math.ceil(opts.items / opts.itemsOnPage) || 1; //number of pages
		//page starts in 1 index and check if nust go to first page?
		page = (opts.items > opts.firstItem) ? range(page, 1, pages) : 1;
		opts.firstItem = (opts.itemsOnPage == Infinity) ? 0 : (page - 1) * opts.itemsOnPage; //recalcule index
		opts.lastItem = opts.firstItem + opts.itemsOnPage; //last visible item (0 index)
		opts.currentPage = page; //init current page
		return pages;
	};

	function draw(opts, elem, page) {
		//calc iterator index and range limits
		var pages = limits(opts, page); // get number of pages
		page = opts.currentPage; //iguale params
		//page starts in 1 index and check if nust go to first page?
		var end = range(page + opts.displayedPages, 0, pages); //last page
		var start = range(page - opts.displayedPages - 1, 0, end);
		var group = (opts.displayedPages * 2) + 1;
		start = (end == pages) ? Math.max(end - group, 0) : start;
		end = (start == 0) ? Math.min(group, pages) : end;

		$(elem).empty(); //clear child contents
		var ul = addElem(elem, "ul"); //create page-list
		//add prev button and first page (if is necesary)
		addPage(opts, ul, page - 1, opts.prevText);
		(start > 0) && addPage(opts, ul, 1);
		(start > 1) && addPage(opts, ul, page - group, opts.rangeText);

		//iterate over displayed pages
		var i = start * opts.itemsOnPage;
		for (var j = start; (i < opts.items) && (j < end); ) {
			addPage(opts, ul, ++j);
			i += opts.itemsOnPage;
		}

		//add next button and last page (if is necesary)
		(end < (pages - 1)) && addPage(opts, ul, page + group, opts.rangeText);
		(end < pages) && addPage(opts, ul, pages);
		addPage(opts, ul, page + 1, opts.nextText);

		$(ul).addClass(opts.plNameClass).find("a[href='#page-" + page + "']")
										.addClass(opts.activeNameClass);
		return false;
	};

	$.fn.plInit = function(opts) {
		var self = this; //auto-reference
		opts = opts || {}; //config page-list

		//config default params
		opts.items = opts.items || 0;
		opts.firstItem = opts.firstItem || 0;
		opts.itemsOnPage = opts.itemsOnPage || 1;
		opts.currentPage = opts.currentPage || 1;
		opts.displayedPages = opts.displayedPages || 3;

		//css clases and tag texts
		opts.plNameClass = opts.plNameClass || "page-list";
		opts.activeNameClass = opts.activeNameClass || "pl-active";
		opts.rangeText = opts.rangeText || "&hellip;"; //...
		opts.prevText = opts.prevText || "&lt;"; //<
		opts.nextText = opts.nextText || "&gt;"; //>

		//events handlers
		opts.onClick = opts.onClick || fnVoid;
		opts.draw = function(page) { return !self.each(function() { draw(opts, this, page); }); };
		//call event and redraw new page-list
		opts.click = function(page) {
			limits(opts, page);
			opts.onClick(page);
			return opts.draw(page);
		};

		//extra options
		opts.resize = function(items) {
			opts.items = items;
			limits(opts, 1);
			return opts.draw(1);
		};
		opts.clear = function() {
			opts.firstItem = 0;
			opts.itemsOnPrev = opts.itemsOnPage;
			opts.lastItem = opts.itemsOnPage = Infinity;
			return opts.click();
		};
		opts.redraw = function() {
			opts.firstItem = 0;
			opts.itemsOnPage = opts.itemsOnPrev;
			delete opts.itemsOnPrev;
			return opts.click();
		};
		opts.toggle = function() {
			return isset(opts.itemsOnPrev) ? opts.redraw() : opts.clear();
		};

		return this.each(function() {
			draw(opts, this, 1);
		});
	};
}(jQuery));
