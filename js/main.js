
/*
 Syntax highlighting
 */
$('.convert-code').each(function() {
    var html = this.innerHTML;
    $(this)
        .html('')
        .text($.trim(html))
        .show();
});
if( navigator.userAgent.indexOf('MSIE') > -1 ) {
    $('.prettyprint').addClass('linenums'); // IE must have line numbers or line breaks will disappear
}
$('.prettyprint').each(function() {
    var code = $(this).text().replace(new RegExp('    ', 'g'), '  ');
    code = code.replace(new RegExp('break=""', 'gi'), '\n\t\t');
    $(this).text( code );
});
prettyPrint();


/*
 Setup form validation
 */
$.setupForm({
    form : '.test-form:not(.top-messages)',
    modules : 'date, security, location, date, sweden, uk, file',
    onModulesLoaded: function($form) {
        $('input[name="country"]').suggestCountry();
        $('input[name="state"]').suggestState();
        $('input[name="lan"]').suggestSwedishCounty();
        $('input[name="kommun"]').suggestSwedishMunicipality();
        $('input[name="pass_confirmation"]').displayPasswordStrength();
    },
    onError : function() {
        if( !$.formUtils.haltValidation ) {
            alert('Form is NOT valid :(');
        }
    },
    onSuccess: function($form) {

        // if "validate_backend" is encountered the form will be validated
        // twice, the first time $.formUtils.haltValidation will be set to true
        if( !$.formUtils.haltValidation ) {
            alert('Form is valid :)');

            // The input button is disabled if the form contains backend validations
            $form.find('input[type="submit"]').unbind('click');
        }
        return false;
    }
});

/*
  Setup form validation with error messages in top
 */
$.setupForm({
    form : '.test-form.top-messages',
    scrollToTopOnError: false,
    validateOnBlur: false,
    errorMessagePosition: 'top',
    onSuccess : function() {
        alert('The form is valid :)');
        return false;
    }
});

/*
 Length restrictions
 */
$('.length-restricted').each(function() {
    var $maxLen = $(this).parent().parent().parent().find('.max-chars');
    $(this).restrictLength($maxLen);
});

/*
 Preload some images that is used in the form
 */
$.each(['img/icon-fail.png', 'img/icon-ok.png'], function(i, imgSource) {
    $('<img />')
        .css({
            position : 'absolute',
            top: '-100px',
            left: '-100px'
        })
        .appendTo('body')
        .get(0).src = imgSource;
});

/*
 Page switcher
 */
var Pager = {

    currentPage : false,

    lastSection : false,

    isChangingPage : false,

    goTo : function(page, callback) {

        var pageSection = false;
        if( page.indexOf('_') > -1 ) {
            pageSection = page.split('_')[1];
            page = page.split('_')[0];
        }

        var $newPage = $('#'+page);
        if( !$newPage.hasClass('page') ) {
            if( !$newPage.is(':visible') ) {
                return this.goTo('home', callback);
            } else {
                return true;
            }
        }

        if( !this.isChangingPage && (page != this.currentPage || pageSection) ) {

            if( $newPage.length > 0 ) {
                this.isChangingPage = true;

                var nextPage = function() {

                    var nextPageLoaded = function() {
                        Pager.isChangingPage = false;
                        if( pageSection ) {
                            window.location.hash = '#' + Pager.currentPage;
                            Pager.lastSection = pageSection;
                            var $section = $('*[data-page-section="'+pageSection+'"]');
                            $('html, body').animate({
                                scrollTop: $section.offset().top - 50
                            }, 500);
                        }
                        else {
                            $('html, body').animate({
                                scrollTop: 0
                            }, 0);
                        }
                    };

                    if( page != Pager.currentPage ) {
                        $newPage.fadeIn('normal', nextPageLoaded);
                    } else {
                        nextPageLoaded();
                    }

                    Pager.currentPage = page;
                    if( typeof callback == 'function' ) {
                        callback();
                    }
                };

                if( this.currentPage && page != Pager.currentPage ) {
                    $('#'+this.currentPage).fadeOut('fast', nextPage);
                } else {
                    nextPage();
                }
            }
        }
        return false;
    }
};

/*
 Setup pager
 */
$('.page').fadeOut('fast');

var $subMenus = $('.submenu'),
    $menuLinks = $('.nav a'),
    $subMenuLinks = $('.menu-link');

/*
  When page is changed
 */
$(window).on('hashchange', function() {

    // Track page view
    if( typeof ga == 'function' && (!window.localStorage || window.localStorage.getItem('0') != '1') ) {
        console.log(ga('send', 'pageview', window.location.pathname + window.location.search + window.location.hash));
    }

    return Pager.goTo(window.location.hash.substr(1), function() {

        var pageRef = Pager.currentPage;

        $menuLinks.parent().removeClass('active');
        $menuLinks.filter('[href="#'+pageRef+'"]').eq(0).parent().addClass('active');
        $subMenuLinks.find('.arr').html('&#9650;');

        var $currentMenu = $subMenus.filter(':visible');
        if( !($currentMenu.hasClass('default-validators') && (pageRef == 'home' || pageRef == 'default-validators')) )
            $currentMenu.slideUp();

        if( pageRef == 'home' )
            pageRef = 'default-validators';

        $subMenuLinks.filter('[href="#'+pageRef+'"]').find('.arr').html('&#9660;');
        $subMenus.filter('.'+pageRef).slideDown();
    });
});

/*
 After the first page is loaded
 */
var onFirstPageLoaded = function() {
    if( Pager.currentPage == 'home' || Pager.currentPage == 'default-validators' ) {
        $subMenus.filter(':not(.default-validators)').slideUp();
        $subMenuLinks.filter('[href="#default-validators"]').find('.arr').html('&#9660;');
    } else {
        $subMenus.filter(':not(.'+Pager.currentPage+')').slideUp();
        $subMenuLinks.filter('[href="#'+Pager.currentPage+'"]').find('.arr').html('&#9660;');
    }

    if( Pager.currentPage != 'home' ) {
        $menuLinks.parent().removeClass('active');
        $menuLinks.filter('[href="#'+Pager.currentPage+'"]').eq(0).parent().addClass('active');
    }
};

/*
 Current page when page loads
 */
if( window.location.hash ) {
    Pager.goTo(window.location.hash.substr(1), onFirstPageLoaded);
} else {
    Pager.goTo('home', onFirstPageLoaded);
}


var $downloadInfo = $('#download-info');
$('#download-link').click(function() {
    if( $downloadInfo.is(':visible') ) {
        $(this).removeClass('active');
        $downloadInfo.animate({height: '0'}, 'normal', function() {
            $(this).hide();
        });
    } else {
        $(this).addClass('active');
        $downloadInfo.show().animate({ height: '210px' });
    }
    return false;
});