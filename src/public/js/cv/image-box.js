
(function($) {
	var settings = { //global config
		duration: 400,
		preserveHeight: true,
		prevText: "&lang;",
		nextText: "&rang;",
		closeText: "&times;",
		bulletText: "&bullet;",
		imgLoading: "data:image/svg+xml;base64," + btoa('<svg version="1.1" id="L1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="70px" height="80px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve"><rect x="0" y="10" width="4" height="10" fill="#333" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite"/><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite"/><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite"/></rect><rect x="8" y="10" width="4" height="10" fill="#333" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite"/><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"/><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"/></rect><rect x="16" y="10" width="4" height="10" fill="#333" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite"/><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"/><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"/></rect></svg>'),

		classOverlay: "ibox",
		classWrapper: "ibox-wrapper",
		classButtons: "ibox-buttons",
		classButtonClose: "ibox-close",
		classButtonPrev: "ibox-prev",
		classButtonNext: "ibox-next",
		classBullets: "ibox-bullets",
		classBullet: "ibox-bullet",
		classActiveBullet: "ibox-active",
		classTitle: "ibox-title",

		//events handlers
		beforeChange: fnVoid,
		afterChange: fnVoid
	};

	//create once all DOM elements to overlay image-box
	var iboxOverlay = newElem("div");
	var iboxWrapper = addElem(iboxOverlay, "div");
	var iboxImage = addElem(iboxWrapper, "img");
	var btnClose = addElem(iboxWrapper, "a");
	var btnPrev = addElem(iboxWrapper, "a");
	var btnNext = addElem(iboxWrapper, "a");
	var $buttons = $(iboxWrapper).children("a");
	var $bullets = $(addElem(iboxWrapper, "div"));

	var groups = [];
	var group = null;
	var index = 0;

	//close event
	function fnClose() {
		$(iboxOverlay).fadeOut(group.duration, group.onClose);
		return (group = null);
	};

	//keyup events and
	function fnKeyUp(ev) {
		if (!group) return;
		(ev.keyCode == 27) ? fnClose() //escape keycode = 27
						: (ev.keyCode == 37) ? btnPrev.click() //left keycode = 37
						: (ev.keyCode == 39) ? btnNext.click() //right keycode = 39
						: 0; 
	};

	function setImage(i) {
		$buttons.hide(); //avoid flicker arrows
		index = i = range(i, 0, group.list.length - 1);
		var elem = group.list[i]; //html elem
		$(HTML_P).html(elem.title); //set title image
		group.beforeChange(elem, i); //call before event
		return !$(iboxImage).fadeOut(group.duration, function() { //fade old image
			this.src = elem.href;
			var bullet = $bullets.children().removeClass(group.classActiveBullet).get(i);
			$(bullet).addClass(group.classActiveBullet);
			$(this).fadeIn(group.duration, function() {
				if (group.preserveHeight) {
					var height = iboxImage.height + "px";
					var css = {"line-height": height, "height": height};
					$(btnPrev).css(css); $(btnNext).css(css);
				}
				$buttons.show();
				group.afterChange(elem, i);
			});
		});
	};

	$.fn.ibClose = function() {
		$(iboxOverlay).fadeOut(settings.duration, function() {
			$(iboxWrapper).children().show();
		});
		return this;
	};
	$.fn.ibOpen = function() {
		$(iboxWrapper).children().hide();
		$(iboxImage).attr("src", settings.imgLoading).show();
		$(iboxOverlay).show();
		return this;
	};

	$.fn.ibox = function(opts) {
		opts = $.extend({ list: this }, settings, opts); //config
		groups.push(opts);

		$(iboxWrapper).attr("class", opts.classWrapper);
		$buttons.attr("class", opts.classButtons);
		$(btnPrev).addClass(opts.classButtonPrev).html(opts.prevText);
		$(btnNext).addClass(opts.classButtonNext).html(opts.nextText);
		$(btnClose).addClass(opts.classButtonClose).html(opts.closeText);

		return this.click(function() {
			var elem = this; //self pointer
			var tplBullet = '<a href="#" class="@classBullet;">@bulletText;</a>';
			$(iboxOverlay).attr("class", opts.classOverlay).fadeIn(opts.duration);
			$(addChild(iboxWrapper, HTML_P)).attr("class", opts.classTitle); //title wrapper
			group = groups.find(function(g) { return (g.list.index(elem) > -1); });
			var tplBullets = group.list.get().map(function() { return format(tplBullet, opts); }).join("");
			var bullets = $bullets.addClass(opts.classBullets).html(tplBullets).children();
			bullets.click(function() { return setImage(bullets.index(this)); });
			return setImage(group.list.index(elem)); //put image
		});
	};

	//add overlay and message layer when DOM is fully loaded
	$(function() {
		//set default class and close event to overlays and wrappers
		$(iboxWrapper).addClass(settings.classWrapper); //inicialize css class
		$(addChild(document.body, iboxOverlay)).addClass(settings.classOverlay).click(fnClose); //add ibox wrapper to DOM
		btnClose.href = btnPrev.href = btnNext.href = "#"; //default href
		iboxImage.src = settings.imgLoading; //preload default image
		$(btnPrev).click(function() { return setImage(index - 1); });
		$(btnNext).click(function() { return setImage(index + 1); });
		$(btnClose).click(fnClose); //close event
		$(document).keyup(fnKeyUp); //load key event
	});
}(jQuery));
