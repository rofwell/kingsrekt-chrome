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

chrome.browserAction.onClicked.addListener(function() {
    active = !active;
    if(active == false) {
        chrome.browserAction.setBadgeText({'text':'Off'});
        chrome.browserAction.setBadgeBackgroundColor({'color':'#f00'});
    } else {
        chrome.browserAction.setBadgeText({'text':''});
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.action == "openChannel") {
        var port = chrome.tabs.connect(sender.tab.id,{name: "kingsrekt"});
        var clientURL = sender.tab.url.replace('https://kingsnet.kingswoodcollege.vic.edu.au','');
        port.postMessage({type:'update',name:'active',content:active});
        chrome.storage.local.get(['resources','version'],function(items) {
            console.log(items);

            var existsInStorage = Object.keys(items).indexOf('resources') > -1;

            // get the current version of the resources
            fetch('https://kingsrekt.herokuapp.com/version/').then(function(response) {
                return response.json();
            }).then(function(version) {
                // check if manifest has the same version as the response's client version
                fetch(chrome.extension.getURL('manifest.json')).then(function(re) {
                    return re.json();
                }).then(function(manifest) {
                    console.log(manifest);
                    if(version['client'] != manifest.version) {
                        alert('There is a newer version of the Kingsrekt extension available.')
                    }
                });

                // if it is not the saved version, set the version in storage and fetch the newest version of the resource
                if(version['server'] != items['version'] || !existsInStorage) {
                    chrome.storage.local.set({'version':version['server']});
                    fetch('https://kingsrekt.herokuapp.com/resource/').then(function(response) {
                        return response.json();
                    }).then(function(json) {
                        console.log(json);
                        // set resources in storage
                        chrome.storage.local.set({'resources':json});

                        // send the resources over to the server
                        getMatchingPatternsFromResourcesFile(json,clientURL).forEach(function(msg) {
                            if(active) {port.postMessage(msg)};
                        });
                    });
                // if the stored version is current, use the stored resources
                } else {
                    getMatchingPatternsFromResourcesFile(items['resources'],clientURL).forEach(function(msg) {
                        if(active) {port.postMessage(msg)};
                    });
                }
            });
        });
    }
});