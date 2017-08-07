chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "kingsrekt");
    port.onMessage.addListener(function(response) {
        console.log(response);
        if(response.type == 'css') {
            el = document.createElement('style');
            el.innerHTML = response.content;
            document.documentElement.appendChild(el);
        } else if (response.type == 'json') {
            if(document.readyState == 'interactive') {
                response.content.moves.forEach(function(details) {
                    console.log('moving ' + details[0] + ' before ' + details[1]);
                    $(details[0]).insertBefore(details[1]);
                });
                response.content.overrides.forEach(function(details) {
                    var newVal = details['value'].replace('{{x}}',$(details['selector']).attr(details['attribute']))
                    $(details['selector']).attr(details['attribute'],newVal);
                });
            } else {
                document.addEventListener('DOMContentLoaded',function() {
                    response.content.moves.forEach(function(details) {
                        $(details[0]).insertBefore(details[1]);
                    });
                    response.content.overrides.forEach(function(details) {
                        var newVal = details['value'].replace('{{x}}',$(details['selector']).attr(details['attribute']))
                        if(details['attribute'] == 'src' || details['attribute'] == 'style') {
                            $(details['selector']).attr(details['attribute'],newVal);
                        }
                    });
                });
            }
        } else if (response.type == 'update') {
            if(response.name == 'active' && response.content == true) {
                if(document.readyState == 'interactive' || document.readyState == 'complete') {
                    inject();
                } else {
                    document.addEventListener("DOMContentLoaded", inject);
                }
            } else if (response.name == 'reload') {
                if(document.readyState == 'interactive' || document.readyState == 'complete') {
                    location.reload();
                } else {
                    document.addEventListener("DOMContentLoaded", function(){location.reload();});
                }
            }
        }
    });
});

var port = chrome.runtime.connect({name: "kingsrekt"});

chrome.runtime.sendMessage({action: "openChannel"},function(r){});

function inject() {
    // FORMERLY ALL.JS
    var nonIconElements = $('*').filter(function () { 
        return $(this).css('font-family').toLowerCase().indexOf('ff-editor') == -1
    });

    $(nonIconElements).css('font-family','Ubuntu');


    // FORMERLY DASHBOARD.JS
    if(window.location.pathname == '/dashboard') {
        var timetableTops = [
            // 2.5,
            3.4,
            8.35,
            12.85, // wellbeing
            14.65,
            19.6,
            29.05,
            34
        ];

        var timetableTimes = [
            'Period 1',
            'Period 2',
            'Period 3',
            'Period 4',
            'Lunch',
            'Period 5',
            'Period 6',
            'Period 1',
            'Period 2',
            'Period 3',
            'Period 4',
            'Lunch',
            'Period 5',
            'Period 6'
        ];

        var tuesday = $('.ff-timetable:not(.ff-timetable-additional) .ff-timetable-days > .ff-timetable-day:nth-of-type(2)');
        var tuesdayAlt = $('.ff-timetable.ff-timetable-additional .ff-timetable-days > .ff-timetable-day:nth-of-type(2)');

        $(tuesday).children('.ff-timetable-block.ff-timetable-lesson').each(function(index) {
            $(this).css('top',timetableTops[index].toString() + 'em');
            if(index == 2) {
                $(this).css('height','1.75em');
            }
        }, this);

        $(tuesdayAlt).children('.ff-timetable-block.ff-timetable-lesson').each(function(index) {
            $(this).css('top',timetableTops[index].toString() + 'em');
            if(index == 2) {
                $(this).css('height','1.75em');
            }
        }, this);


        $('.ff-timetable .ff-timetable-timelabel').each(function(index) {
            $(this).text(timetableTimes[index]);
        });

        $(tuesday).prepend(`
        <li style="height: 0.9em; top: 2.5em; padding:em;" class="ff-timetable-block ff-timetable-lesson ff-timetable-lesson-nolabel">
        </li>
        `);
        $(tuesdayAlt).prepend(`
        <li style="height: 0.9em; top: 2.5em; padding:em;" class="ff-timetable-block ff-timetable-lesson ff-timetable-lesson-nolabel">
        </li>
        `);

        $('.ff-timetavble-lesson-teacher').each(function(index) {
            var text = $(this).text();
            text = text.replace(/((\w)\w*)\s(\w*)/g,'$2 $3');
            $(this).text(text);
        });
    }
}