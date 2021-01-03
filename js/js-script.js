(function() {
	'use strict';

	if (typeof firebase !== "undefined") {
		var perf = firebase.performance();

		firebase.auth().onAuthStateChanged((firebaseUser) => {
			if (firebaseUser) {
				document.getElementById("account-button").innerHTML = '<a href="/account" class="sr-button style-red button-medium" target="_self"><span>My profile</span></a>';
			} else {
				document.getElementById("account-button").innerHTML = '<a href="/sign-in" class="sr-button style-red button-medium" target="_self"><span>Sign in</span></a>';
			}
		});
	}
})();

function getBotStatistics() {
	fetch("/private/stats/alphabot", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	}).then(function(result) {
		return result.json()
	}).then(function(response) {
		document.getElementById("request-count").innerHTML = "A total of more than " + response.rounded.toLocaleString("en-US") + " requests have been processed since inception.";
	}).catch(function(err) {
		console.error(err);
	})
}

/*-----------------------------------------------------------------------------------

	 Script - All Custom frontend jQuery scripts & functions

-----------------------------------------------------------------------------------*/
(function() {
	'use strict';

	/* do animations if element is visible
	------------------------------------------------*/
	function animateOnScroll() {

		/* animations  */
		if (jQuery("[class*='do-anim']").length > 0) {
			jQuery("[class*='do-anim']").not('.animated')
				.filter(function(i, d) {
					return jQuery(d).visible(true);
				}).each(function(i) {
					var thisItem = jQuery(this);
					var delayMulti = 200;
					if (thisItem.hasClass("do-anim-modern")) {
						delayMulti = 100;
					}
					var delay = i * delayMulti + 100; // + 150 is to add a small delay
					thisItem.delay(delay).queue(function() {
						thisItem.addClass('animated');
					});
				});
		}

		/* check text light section for logo/header part  */
		var area = (jQuery("header #logo").height() + parseInt(jQuery("header #logo").css("top"), 10)) / 2;
		var bgArea = false;
		jQuery('.fullwidth-section.text-light, .isotope-grid.text-light, footer.text-light').each(function() {
			if (jQuery(this).visible(true, false, area)) {
				bgArea = "dark";
			}
		});
		if (bgArea) {
			jQuery('header #logo:not(.disable-switch)').addClass("bg-" + bgArea);
		} else {
			jQuery('header #logo:not(.disable-switch)').removeClass("bg-dark").removeClass("bg-light");
		}


		/* infinite Load for isotope */
		if (jQuery().isotope) {
			jQuery(".load-isotope:not(.loading):not(.disabled) > a[data-method='infiniteload']")
				.filter(function(i, d) {
					return jQuery(d).visible();
				}).each(function() {
					jQuery(this).trigger("click");
				});
		}

	}


	/* header Features ()
	------------------------------------------------*/
	function headerFeatures() {

		/* Add hero-invisible as soon as it's out of the viewport */
		var selector = "#hero";
		if (jQuery("header").hasClass("hero-side")) {
			selector = "#hero-and-body";
		}
		if (jQuery(window).scrollTop() + 30 > jQuery(selector).height()) {
			jQuery('header.onhero').addClass("hero-invisible");
			// trigger mute if sound is on
			if (jQuery(selector).find(".mute-video:not(.unmute)").length) {
				jQuery(selector).find(".mute-video:not(.unmute)").trigger("click");
			}
		} else {
			jQuery('header.onhero').removeClass("hero-invisible");
		}

		/* Show Hide back to top arrow */
		if (jQuery(window).scrollTop() > jQuery(window).height()) {
			jQuery('header .header-totop').addClass("visible");
		} else {
			jQuery('header .header-totop').removeClass("visible");
		}

	}


	/* misc features which need to be regenerated on resize
	------------------------------------------------*/
	function resizeAdapt() {

		/* - Hero / Pagetitle (if pagetitle is taller than hero) - */
		if (jQuery(".hero-full #page-title").length > 0 || jQuery(".hero-big #page-title").length > 0) {
			var hero = jQuery("#hero");
			var pageTitle = jQuery("#hero #page-title");
			var pageTitleHeight = pageTitle.outerHeight();
			if (pageTitleHeight > hero.outerHeight()) {
				hero.css('height', (pageTitleHeight - 2) + 'px'); // -2 is for prevend jumping
				//pageTitle.addClass('push-bottom');
			} else {
				hero.css('height', 'auto');
				//pageTitle.removeClass('push-bottom');
			}
		}


		/* detach sticky col  */
		if (jQuery().stick_in_parent && jQuery(window).width() < 769) {
			jQuery(".col-sticky").trigger("sticky_kit:detach");
		}
	}

	/* isotope load more function
	------------------------------------------------*/
	function isotopeLoadMore(grid, el, url, datas) {

		el.parent(".load-isotope").addClass('loading');

		if (url === '#' || !url) {
			url = srvars.ajaxurl
		}
		var addData = '';
		if (datas) {
			addData = {
				action: 'sr_load_more',
				o: datas
			};
		}
		jQuery.ajax({
			type: 'POST', // this might lead to issues for html template
			url: url,
			data: addData,
			dataType: "html",
			error: function() {
				el.parent(".load-isotope").addClass("disabled");
			},
			success: function(response) {
				//console.log(response);
				if (response) {

					// if hero-side and sticky
					if (jQuery("#hero.sticky_bottom[class*='side-']").length) {
						var position = jQuery("#hero").position();
						var parentHeight = jQuery("#hero").parent().outerHeight();
						var scroll = jQuery(document).scrollTop();
						var addOffset = jQuery(window).height() - (parentHeight - scroll);
						jQuery("#hero").css({
							"bottom": "auto",
							"top": position.top + addOffset + "px"
						});
					}

					setTimeout(function() {
						var items = jQuery(jQuery(response).find('#' + grid.attr('id')).html());
						items.imagesLoaded(function() {
							grid.append(items).isotope('appended', items);
							//reorganizeIsotope();
							animateOnScroll(false);
							// init video bg for appended items
							if (jQuery().phatVideoBg) {
								grid.find('.videobg-section').phatVideoBg();
							}
						});
						setTimeout(function() {
							el.parent(".load-isotope").removeClass('loading');
						}, 1000);
					}, 500);
				} else {
					el.parent(".load-isotope").addClass("disabled");
				}
			}
		});

	}


	/* reorganize isotope for ratio
	------------------------------------------------*/
	function reorganizeIsotope() {
		jQuery('.isotope-grid[data-ratio]').each(function() {
			var $container = jQuery(this);
			var width = $container.find(".isotope-item:not(.double-width)").width();
			var ratio = $container.data('ratio').split(':');
			ratio = ratio[1] / ratio[0];
			if (!ratio) {
				ratio = 0.8;
			}
			var spacing = 0;
			if ($container.hasClass("isotope-spaced") || $container.hasClass("isotope-spaced-big")) {
				spacing = parseInt($container.find(".isotope-item").css('marginRight'), 10);
			}
			var height = parseInt(width * ratio, 10);
			if (!$container.find('.isotope-item img:not(.hover)').parent(".ratio-wrapper").length) {
				$container.find('.isotope-item img:not(.hover)').wrap('<div class="ratio-wrapper"></div>');
			}
			$container.find('.isotope-item .ratio-wrapper').css({
				'height': height + 'px'
			});
			if (jQuery(window).width() > 1024) {
				$container.find('.isotope-item.double-height .ratio-wrapper').css({
					'height': height * 2 + spacing + 'px'
				});
			}
			$container.isotope('layout');

		});
	}


	jQuery(window).on("load", function() {


		/*----------------------------------------------
				H E A D E R   S E T T I N G S
		------------------------------------------------*/
		if ((jQuery("#logo").hasClass("logo-right") && (jQuery("#hero").hasClass("side-left") || jQuery("#hero").hasClass("side-left-small"))) ||
			(jQuery("#logo").hasClass("logo-left") && (jQuery("#hero").hasClass("side-right") || jQuery("#hero").hasClass("side-right-small")))) {} else {
			jQuery("header").addClass("onhero");
			if (jQuery("#hero").attr("class") && jQuery("#hero").attr("class").indexOf("side") >= 0) {
				jQuery("header").addClass("hero-side");
				jQuery("#logo").addClass("disable-switch");
			}
		}
		if (jQuery("#logo").hasClass("logo-right")) {
			jQuery("header").addClass("logo-is-right");
		} // for mquerries


		/*----------------------------------------------
					S M O O T H   S H O W    (pageloader)
		------------------------------------------------*/
		const pageWithBackend = [
			"/account",
			"/account/discord", "/account/subscription",
			"/account/discord/feature/command-presets", "/account/discord/feature/flow", "/account/discord/feature/price-alerts",
			"/communities", "/communities/manage",
			"/communities/feature/command-presets", "/communities/feature/flow", "/communities/feature/no-ads", "/communities/feature/price-alerts",
			"/pro/pricing"
		];

		if (!pageWithBackend.includes(window.location.pathname))
			jQuery("body").addClass("loaded");
		setTimeout(function() {
			setTimeout(function() {
				animateOnScroll(true);
			}, 500);
			headerFeatures();
		}, 500);
		setTimeout(function() {
			if (!pageWithBackend.includes(window.location.pathname))
				jQuery("body").addClass("loading-end");
			/* trigger filter if hashtag is active
			------------------------------------------------*/
			if (window.location.hash) {
				var filter = window.location.hash.substr(1);
				if (jQuery('.grid-filter li a[data-slug=' + filter + ']').length > 0) {
					/*setTimeout(function(){ */
					jQuery('.grid-filter li a[data-slug=' + filter + ']').trigger("click"); /* }, 500);*/
				}
			}

		}, 1500);


		/*----------------------------------------------
				   R E S P O N S I V E   N A V
		------------------------------------------------*/
		jQuery('header').on("click", ".menu-toggle", function() {
			jQuery('#header').toggleClass('menu-is-open');
			return false;
		});

		jQuery('#main-nav').on("click", "li > a", function() {
			var thisItem = jQuery(this);
			var thisParent = jQuery(this).parent('li');
			if (thisItem.siblings('ul').length > 0 && thisItem.siblings('ul').css('display') === 'none') {
				thisItem.siblings('ul').slideDown(400, "easeInOutCubic");
				thisParent.siblings('li').children('ul').slideUp(400, "easeInOutCubic");
				return false;
			}
		});



		/*----------------------------------------------
				   H E A D E R   A C T I O N S
		------------------------------------------------*/
		jQuery('header').on("click", ".open-action", function() {
			jQuery('#header').addClass('action-is-active ' + jQuery(this).data('action')).removeClass('menu-is-open');
			return false;
		});

		jQuery('header').on("click", ".header-close", function() {
			jQuery('header .open-action').each(function() {
				jQuery('#header').removeClass(jQuery(this).data('action'));
			});
			jQuery('#header').removeClass('action-is-active').removeClass('menu-is-open');
			return false;
		});



		/*----------------------------------------------
						 L A Z Y   L O A D
		------------------------------------------------*/
		if (jQuery().unveil && jQuery("img.lazy").length > 0) {
			jQuery("img.lazy").unveil(800);
		}


		/*----------------------------------------------
				I S O T O P E  /  M A S O N R Y
		------------------------------------------------*/
		if (jQuery().isotope) {

			/* Call Isotope
			------------------------------------------------*/
			jQuery('.isotope-grid').each(function() {
				var $container = jQuery(this);
				var layout = "masonry";
				if ($container.hasClass("fitrows")) {
					layout = "fitRows";
				}
				$container.imagesLoaded(function() {
					$container.isotope({
						layoutMode: layout,
						itemSelector: '.isotope-item',
						masonry: {
							columnWidth: '.isotope-item:not(.double-width)'
						}
					});
				});
				setTimeout(function() {
					$container.isotope('layout');
					reorganizeIsotope();
				}, 500);
			});



			/* Filter isotope
			------------------------------------------------*/
			jQuery('.grid-filter').on("click", "li a", function() {
				var thisItem = jQuery(this);
				var parentul = thisItem.parents('ul.grid-filter').data('related-grid');
				if (!parentul) {
					alert('Please specify the dala-related-grid');
				} else {
					thisItem.parents('ul.grid-filter').find('li').removeClass('active');
					thisItem.parent('li').addClass('active');
					var selector = thisItem.attr('data-filter');
					jQuery('#' + parentul).isotope({
						filter: selector
					});
					jQuery('#' + parentul + ' .isotope-item .item-inner').not(selector).removeClass("animated");
					setTimeout(function() {
						jQuery('#' + parentul + ' .isotope-item' + selector + ' .item-inner').addClass("animated");
					}, 200);

					// adding slug hashtag to url
					var slug = thisItem.data('slug');
					if (slug) {
						window.location.hash = slug;
					} else {
						history.pushState("", document.title, window.location.pathname + window.location.search);
					}
				}
				return false;
			});

			/* Scroll to portfolio if header filter is clicked
			------------------------------------------------*/
			jQuery('header').on("click", ".open-action.action-filter", function() {
				var relGrid = jQuery('#header .action-overlay.filter-overlay ul.grid-filter').data('related-grid');
				setTimeout(function() {
					jQuery('html,body').animate({
						scrollTop: jQuery("#" + relGrid).offset().top
					}, 1000, 'easeInOutQuart');
				}, 300);
				return false;
			});


			/* Load More isotope
			------------------------------------------------*/
			jQuery('.load-isotope:not(.disabled)').on("click", "a", function() {
				var el = jQuery(this);
				if (el.data("loadpage") === undefined) {
					el.data("loadpage", "2");
				} else {
					el.data("loadpage", parseInt(el.data("loadpage"), 10) + 1);
				}
				var related = el.data('related-grid');
				var href = el.attr('href').replace("/2", '/' + el.data("loadpage"));
				href = href.replace("2", el.data("loadpage"));
				var datas = '';
				if (el.data("options") !== undefined && el.data("options")) {
					datas = el.data('options').replace("paged=2", "paged=" + el.data("loadpage"));
				}
				isotopeLoadMore(jQuery('#' + related), el, href, datas);
				return false;
			});

		}




		/*----------------------------------------------
						   L I G H T C A S E
		------------------------------------------------*/
		if (jQuery().lightcase) {
			jQuery('a[data-rel^=lightcase]').lightcase({
				showSequenceInfo: false,
				swipe: true,
				showCaption: true,
				overlayOpacity: 0.9,
				maxWidth: 1300,
				maxHeight: 1100,
				shrinkFactor: 1,
				liveResize: true,
				fullScreenModeForMobile: true,
				video: {
					width: 854,
					height: 480
				},
				iframe: {
					width: 854,
					height: 480,
					allowfullscreen: 1
				}
			});

			jQuery('a[data-rel^="lightcase:"]').each(function(index) {
				var el = jQuery(this);
				if (!el.hasClass('lc-trigger') && !el.parents('.isotope-item').hasClass('sr-gallery-item')) {
					var rel = el.data('rel');
					var href = el.attr('href');
					var count = jQuery('a[href="' + href + '"][data-rel="' + rel + '"]').length;
					if (count > 1) {
						jQuery('a[href="' + href + '"][data-rel="' + rel + '"]').not(this).addClass('lc-trigger').attr('data-trigger', index).attr('data-rel', '');
						el.addClass('lc-trigger-' + index);
					}
				}
			});

			jQuery('a.lc-trigger').on("click", function() {
				jQuery(".lc-trigger-" + jQuery(this).data('trigger')).trigger("click");
				return false;
			});

			// mute all bg videos if lightcase is opened
			jQuery('a[data-rel^=lightcase]').on("click", function() {
				if (jQuery(".phatvideo-bg .mute-video:not(.unmute)").length) {
					jQuery('.phatvideo-bg .mute-video:not(.unmute)').each(function() {
						jQuery(this).trigger("click");
					});
				}
			});

		}


		/*----------------------------------------------
					I N L I N E   V I D E O
		------------------------------------------------*/
		jQuery('body').on("click", ".inline-video", function() {
			var el = jQuery(this);
			var type = el.data('type');
			var video = el.data('videoid');

			if (type === 'youtube') {
				var iframe = '<iframe src="https://www.youtube.com/embed/' + video + '?autoplay=1" width="100%" height="100%" frameborder="0" allowfullscreen ></iframe>';
			} else if (type === 'vimeo') {
				var iframe = '<iframe src="https://player.vimeo.com/video/' + video + '?autoplay=1" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>';
			}

			el.append('<div class="inline-iframe-container"></div>');
			el.find(".inline-iframe-container").html(iframe + '<div class="close-inline-video"></div>');

			setTimeout(function() {
				el.addClass('active');
			}, 1000);

			return false;
		});

		jQuery('body').on("click", ".close-inline-video", function() {
			var thisItem = jQuery(this);
			thisItem.parents(".inline-video").removeClass('active');
			thisItem.parent(".inline-iframe-container").remove();
			return false;
		});



		/*----------------------------------------------
				R E V O L U T I O N   S L I D E R
		------------------------------------------------*/
		if (jQuery().revolution) {
			jQuery(".revolution-slider").revolution({
				sliderType: "standard",
				sliderLayout: "fullscreen",
				fullScreenAutoWidth: "on",
				fullScreenOffsetContainer: "#pseudo-header",
				delay: 9000,
				disableProgressBar: 'on',
				navigation: {
					arrows: {
						enable: false,
						style: "noha-nav",
						left: {
							h_offset: 40
						},
						right: {
							h_offset: 40
						}
					},
					bullets: {
						enable: true,
						style: "noha-bullets",
						h_align: "right",
						v_align: "bottom",
						h_offset: 40,
						v_offset: 40,
						space: 7,
					},
					touch: {
						touchenabled: "on",
						swipe_treshold: 75,
						swipe_min_touches: 1,
						drag_block_vertical: false,
						swipe_direction: "horizontal"
					}
				},
				responsiveLevels: [1440, 1160, 700, 500],
				gridwidth: [1000, 640, 500, 280],
				gridheight: [700, 550, 550, 450],
				lazyType: 'smart'
			});

			jQuery("#hero .revolution-slider").bind("revolution.slide.onchange", function(e, data) {
				if (data.currentslide.hasClass('text-light')) {
					jQuery("#logo").addClass("text-light");
					jQuery("#hero #scrolldown").addClass("text-light");
					jQuery("#hero .revolution-slider .noha-nav").addClass("noha-light").removeClass("noha-dark");
					jQuery("#hero .revolution-slider .noha-bullets").addClass("noha-light").removeClass("noha-dark");
				} else {
					jQuery("#logo").removeClass("text-light");
					jQuery("#hero #scrolldown").removeClass("text-light");
					jQuery("#hero .revolution-slider .noha-nav").addClass("noha-dark").removeClass("noha-light");
					jQuery("#hero .revolution-slider .noha-bullets").addClass("noha-dark").removeClass("noha-light");
				}
			});

		}



		/*----------------------------------------------
			O W L   S L I D E R & C A R O U S E L
		------------------------------------------------*/
		if (jQuery().owlCarousel) {

			jQuery(".owl-slider").owlCarousel({
				items: 1,
				nav: false,
				navText: false,
				dots: true,
				smartSpeed: 600,
				singleItem: true,
				autoHeight: true,
				loop: false,
				autoplay: false,
				autoplayHoverPause: true,
				navRewind: false
			});

			jQuery(".owl-carousel").owlCarousel({
				items: 4,
				itemsDesktop: false,
				responsive: { //shop related items
					480: {
						items: 1
					},
					768: {
						items: 2
					},
				},
				autoplay: false,
				autoHeight: true,
				nav: true,
				navText: false,
				dots: true,
				loop: false
			});

		}



		/*----------------------------------------------
							P A R A L L A X
		------------------------------------------------*/
		if (jQuery().parallax) {
			jQuery('.parallax-section').parallax({
				speed: 0.6
			});
		}


		/*----------------------------------------------
					   F I T   V I D E O S
		------------------------------------------------*/
		if (jQuery().fitVids) {
			jQuery("body").fitVids();
		}


		/*----------------------------------------------
							V I D E O   B G
		------------------------------------------------*/
		if (jQuery().phatVideoBg) {
			jQuery('.videobg-section').phatVideoBg();
		}


		/*----------------------------------------------
		 S E L F H O S T E D   A U D I O   +   V I D E O
		------------------------------------------------*/
		if (jQuery().mediaelementplayer) {
			jQuery('audio,video:not(.video-background)').mediaelementplayer();
		}


		/*----------------------------------------------
					S T I C K Y   C O L U M N     (portfolio)
		------------------------------------------------*/
		if (jQuery().stick_in_parent) {
			jQuery("#hero[class*='side-']").stick_in_parent({
				spacer: false
			});
			if (jQuery(window).width() < 769) {
				jQuery("#hero[class*='side-']").trigger("sticky_kit:detach");
			}
		}


		/*----------------------------------------------
							T A B S
		------------------------------------------------*/
		jQuery(".tabs:not(.wc-tabs):not(.woocommerce-tabs)").each(function() {
			var thisItem = jQuery(this);
			thisItem.find('.tab-content').removeClass('active').css('display', 'none');
			var rel = thisItem.find('.active a').attr('href');
			thisItem.find('.' + rel).addClass('active');
		});

		jQuery(".tab-nav:not(.wc-tabs)").on("click", "a", function() {
			var thisItem = jQuery(this);
			var parentdiv = thisItem.parents('li').parent('ul').parent('div');
			var rel = thisItem.attr('href');

			jQuery(parentdiv).find(".tab-nav li").removeClass("active");
			thisItem.parents('li').addClass("active");

			jQuery(parentdiv).find(".tab-container .tab-content").hide().removeClass('active');
			jQuery(parentdiv).find(".tab-container ." + rel).fadeIn(500).addClass('active');

			return false;
		});



		/*----------------------------------------------
				T O G G L E  &  A C C O R D I O N
		------------------------------------------------*/
		jQuery(".toggle-item").each(function() {
			if (!jQuery(this).find('.toggle-active').length) {
				jQuery(this).find('.toggle-inner').slideUp(300);
			}
			jQuery(this).find('.toggle-active').parent(".toggle-item").siblings('.toggle-item').find('.toggle-inner').slideUp(300);
			jQuery(this).find('.toggle-active').siblings('.toggle-inner').slideDown(300);
		});

		jQuery(".toggle-item").on("click", ".toggle-title", function() {
			var thisItem = jQuery(this);
			var parentdiv = thisItem.parent('div').parent('div');
			var active = thisItem.parent('div').find('.toggle-inner').css('display');

			if (jQuery(parentdiv).attr('class') === 'accordion') {
				if (active !== 'none') {
					jQuery(parentdiv).find('.toggle-item .toggle-inner').slideUp(300);
					thisItem.toggleClass('toggle-active');
				} else {
					jQuery(parentdiv).find('.toggle-item .toggle-inner').slideUp(300);
					jQuery(parentdiv).find('.toggle-item .toggle-title').removeClass('toggle-active');

					thisItem.toggleClass('toggle-active');
					thisItem.siblings('.toggle-inner').slideDown(300);
				}
			} else {
				thisItem.toggleClass('toggle-active');
				thisItem.siblings('.toggle-inner').slideToggle(300);
			}

			return false;
		});




		/*----------------------------------------------
					   S C R O L L   T O (back to top, scroll down)
		------------------------------------------------*/
		jQuery('body').on('click', '.totop,#scrolldown', function() {
			var topPos = 0;
			if (jQuery(this).attr("id") === "scrolldown") {
				topPos = jQuery("#page-body").offset().top;
			}
			jQuery('html,body').animate({
				scrollTop: topPos
			}, 1000, 'easeInOutQuart');
			return false;
		});



		/*----------------------------------------------
					   S H A R E   C L I C K   (responsive)
		------------------------------------------------*/
		jQuery('body').on('click', '.share-icon', function() {
			jQuery('header').toggleClass("share-active");
			return false;
		});


		resizeAdapt();
	});

	jQuery(window).on('scroll', function() {
		animateOnScroll(false);
		headerFeatures();
	});

	jQuery(window).on('resize', function() {
		reorganizeIsotope();
		resizeAdapt();
	});

})(jQuery);