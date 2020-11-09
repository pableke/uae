
(function($) {
	var settings = { //global config
		fadeDuration: 1000,
		preserveHeight: true,
		closeText: "&times;",
		wrapperClass: "mbox",
		mboxClass: "mbox-div",
		buttonClose: "mbox-close",
		textClass: "mbox-text",
		iconClass: "mbox-icon",
		okClassName: "mbox-ok",
		okIcon: "&#10004;",
		infoClassName: "mbox-info",
		infoIcon: "&#120154;",
		warnClassName: "mbox-warn",
		warnIcon: "&#9888;",
		errorClassName: "mbox-error",
		errorIcon: "&#10008;"
	};

	var mboxWrapper;
	var tplMbox = '<div class="@type; @mboxClass;"><b class="@iconClass;">@icon;</b><b class="@buttonClose;">@closeText;</b><p class="@textClass;">@msg;</p></div>';
	function fnBox(elem, msg, cls, ico, dudation) {
		if (msg) {
			settings.msg = msg;
			settings.type = cls;
			settings.icon = ico;
			mboxWrapper.prepend(format(tplMbox, settings));
			var divbox = mboxWrapper.children().first().fadeIn(settings.fadeDuration);
			$("." + settings.buttonClose, divbox).click(function() { divbox.fadeOut(settings.fadeDuration, function() { divbox.remove(); }); });
			var altura = divbox.children().get().reduce(function(alto, elem) { return gt($(elem).outerHeight(true), alto); }, 0);
			settings.preserveHeight && $("." + settings.iconClass, divbox.height(altura)).height(altura - 4);
			dudation && setTimeout(function() { divbox.fadeOut(settings.fadeDuration); }, dudation);
		}
		return elem;
	};

	$.fn.mbOk = function(msg, delay) { return fnBox(this, msg, settings.okClassName, settings.okIcon, delay); };
	$.fn.mbInfo = function(msg, delay) { return fnBox(this, msg, settings.infoClassName, settings.infoIcon, delay); };
	$.fn.mbWarn = function(msg, delay) { return fnBox(this, msg, settings.warnClassName, settings.warnIcon, delay); };
	$.fn.mbError = function(msg, delay) { return fnBox(this, msg, settings.errorClassName, settings.errorIcon, delay); };

	$.fn.mbFlushOut = function() { return this.fadeOut(settings.fadeDuration); };
	$.fn.mbFlushErr = function() { mboxWrapper.find("." + settings.errorClassName).mbFlushOut(); return this; };
	$.fn.mbFlush = function() { mboxWrapper.children().fadeOut(settings.fadeDuration); return this; };
	$.fn.mBox = function(opts) {
		$.extend(settings, opts); //init config
		mboxWrapper = this.length ? this : $("<div>").addClass(settings.wrapperClass).appendTo(document.body);
		this.children("." + settings.okClassName).each(function() { var el = $(this); el.mbOk(el.remove().html()); });
		this.children("." + settings.infoClassName).each(function() { var el = $(this); el.mbInfo(el.remove().html()); });
		this.children("." + settings.warnClassName).each(function() { var el = $(this); el.mbWarn(el.remove().html()); });
		this.children("." + settings.errorClassName).each(function() { var el = $(this); el.mbError(el.remove().html()); });
		return this;
	};
}(jQuery));
