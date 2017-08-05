// css = [
//     'https://kingsrekt.herokuapp.com/resource/all.css',
//     'https://kingsrekt.herokuapp.com/resource/dashboard.css'
// ];

// scripts = [
//     'https://kingsrekt.herokuapp.com/resource/all.js',
//     'https://kingsrekt.herokuapp.com/resource/dashboard.js'
// ];

// chrome.runtime.sendMessage({action: "getResources"}, function(response) {
//     console.log(response);
//     // response.css.forEach(function(text) {
//     //     el = document.createElement('style');
//     //     el.innerHTML = text;
//     //     document.body.appendChild(el);
//     //     console.log(sty + ' successfully fetched');
//     // });

//     // response.scripts.forEach(function(text) {
//     //     console.log(scr + ' successfully fetched');
//     //     eval(text);
//     // });

// });

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "kingsrekt");
    port.onMessage.addListener(function(response) {
        console.log(response);
        if(response.type == 'css') {
            el = document.createElement('style');
            el.innerHTML = response.content;
            document.documentElement.appendChild(el);
        } else if (response.type == 'js') {
            eval(response.content);
        }
    });
});

var port = chrome.runtime.connect({name: "kingsrekt"});

chrome.runtime.sendMessage({action: "openChannel"},function(r){});

// css.forEach(function(sty) {
//     console.log('fetching ' + sty);
//     fetch(sty).then(function(response){
//         return response.text();
//     }).then(function(text) {
//         el = document.createElement('style');
//         el.innerHTML = text;
//         document.body.appendChild(el);
//         console.log(sty + ' successfully fetched');
//     });
// });

// scripts.forEach(function(scr) {
//     console.log('fetching ' + scr);
//     fetch(scr).then(function(response){
//         return response.text();
//     }).then(function(text) {
//         console.log(scr + ' successfully fetched');
//         eval(text);
//     });
// });