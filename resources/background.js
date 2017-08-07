function getMatchingPatternsFromResourcesFile(resources, comparisonURL) {
    returnMessages = [];

    resources.forEach(function(pattern) {
        console.log('comparing "' + comparisonURL + '" with ' + pattern['regex']); 
        if(comparisonURL.match(new RegExp(pattern['regex']))) {
            pattern['files']['css'].forEach(function(stylesheet) {
                returnMessages.push({type:'css',content:stylesheet['content']});
            });
            pattern['files']['json'].forEach(function(script) {
                returnMessages.push({type:'json',content:script['content']});
            });
        }
    });

    console.log(returnMessages);
    return returnMessages;
}

var active = true;

function refreshIcon() {
    if(active == false) {
        chrome.browserAction.setBadgeText({'text':'Off'});
        chrome.browserAction.setBadgeBackgroundColor({'color':'#f00'});
    } else {
        chrome.browserAction.setBadgeText({'text':''});
    }
}

chrome.browserAction.onClicked.addListener(function() {
    active = !active;
    refreshIcon();
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.action == "openChannel") {
        var port = chrome.tabs.connect(sender.tab.id,{name: "kingsrekt"});
        refreshIcon();
        var clientURL = sender.tab.url.replace('https://kingsnet.kingswoodcollege.vic.edu.au','');
        port.postMessage({type:'update',name:'active',content:active});
        chrome.storage.local.get(['resources','version'],function(items) {
            var existsInStorage = Object.keys(items).indexOf('resources') > -1;

            if(existsInStorage) {
                getMatchingPatternsFromResourcesFile(items.resources,clientURL).forEach(function(msg) {
                    if(active) {port.postMessage(msg)};
                });
            } else {
                chrome.browserAction.setBadgeText({'text':'Wait'});
                chrome.browserAction.setBadgeBackgroundColor({'color':'#FFA500'});
            }
            // get the current version of the resources
            fetch('https://kingsrekt.herokuapp.com/resource/').then(function(response) {
                return response.json();
            }).then(function(resource) {
                // check if manifest has the same version as the response's client version
                fetch(chrome.extension.getURL('manifest.json')).then(function(re) {
                    return re.json();
                }).then(function(manifest) {
                    console.log(manifest);
                    if(resource.version.client != manifest.version && clientURL == '/dashboard') {
                        alert('There is a newer version of the Kingsrekt extension available at https://kingsnet.herokuapp.com.')
                    }
                });

                // if it is not the saved version, set the version in storage and fetch the newest version of the resource
                if(resource.version.server != items.version || !existsInStorage) {
                    chrome.storage.local.set({'version':resource.version.server, 'resources':resource.resources});

                    //tell the client to reload
                    if(active) {port.postMessage({type:'update',name:'reload'})};
                // if the stored version is current, use the stored resources
                } else {
                }
            });
        });
    }
});