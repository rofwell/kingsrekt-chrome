function getMatchingPatternsFromResourcesFile(resources, comparisonURL) {
    returnMessages = [];

    resources.forEach(function(pattern) {
        console.log('comparing "' + comparisonURL + '" with ' + pattern['regex']); 
        if(comparisonURL.match(new RegExp(pattern['regex']))) {
            pattern['files']['css'].forEach(function(stylesheet) {
                returnMessages.push({type:'css',content:stylesheet['content']});
            });
            pattern['files']['js'].forEach(function(script) {
                returnMessages.push({type:'js',content:script['content']});
            });
        }
    });

    console.log(returnMessages);
    return returnMessages;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.action == "openChannel") {
        var port = chrome.tabs.connect(sender.tab.id,{name: "kingsrekt"});
        var clientURL = sender.tab.url.replace('https://kingsnet.kingswoodcollege.vic.edu.au','');
        chrome.storage.local.get(['resources','version'],function(items) {
            console.log(items);

            var existsInStorage = Object.keys(items).indexOf('resources') > -1;

            // get the current version of the resources
            fetch('http://kingsrekt.herokuapp.com').then(function(response) {
                return response.text();
            }).then(function(text) {
                // if it is not the saved version, set the version in storage and fetch the newest version of the resource
                if(text != items['version'] || !existsInStorage) {
                    chrome.storage.local.set({'version':text});
                    fetch('http://kingsrekt.herokuapp.com/resource/').then(function(response) {
                        return response.json();
                    }).then(function(json) {
                        console.log(json);
                        // set resources in storage
                        chrome.storage.local.set({'resources':json});

                        // send the resources over to the server
                        getMatchingPatternsFromResourcesFile(json,clientURL).forEach(function(msg) {
                            port.postMessage(msg);
                        });
                    });
                // if the stored version is current, use the stored resources
                } else {
                    getMatchingPatternsFromResourcesFile(items['resources'],clientURL).forEach(function(msg) {
                        port.postMessage(msg);
                    });
                }
            });
        });
    }
});