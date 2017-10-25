var taskHolder = ".ff-messages";
var currentPage;

var port;
var maxPriority = 3;

var retrievedContent = null;

chrome.runtime.onConnect.addListener(function(p) {
    port = p;
    port.onMessage.addListener(function(response) {
        console.log(response);
        if(response.type == 'taskPriorities') {
            if(document.readyState == 'interactive' || document.readyState == 'complete') {
                setupTasks(response.content);
            } else {
                retrievedContent = response.content;
            }
        }
    });
})

chrome.runtime.sendMessage({action: "openChannel",send:"taskPriorities"},(r)=>{});

function setupTasks(priorities) {
    console.log(priorities);
    var items = document.querySelectorAll(taskHolder + " > li");
    for(var i = 0; i < items.length; i++) {
        let status = document.querySelector("#ff-notice-" + items[i].dataset.ffId + " .ff-progress-status");
        let j = i;
        items[i].dataset.priority = 0;
        if(Object.keys(priorities).indexOf(items[i].dataset.ffId) > -1) {
            items[i].dataset.priority = priorities[items[i].dataset.ffId];
        }
        status.onclick = () => changeTaskPriority(items[j]);
    }

    sortTasks();
}

function sortTasks() {
    var items = Array.from(document.querySelectorAll(taskHolder + " > li"));
    var sortedItems = items.sort((a,b) => {
        return b.dataset.priority - a.dataset.priority;
    });
    $(taskHolder).empty().html(sortedItems);
}

function changeTaskPriority(parent,status) {
    console.log("changing priority of task with ID " + parent.dataset.ffId);
    parent.dataset.priority ++;
    if(parent.dataset.priority > maxPriority)
    parent.dataset.priority = 0;
    port.postMessage({action:"saveTaskPriority",content:{id:parent.dataset.ffId,priority:parent.dataset.priority}},function(r){});

    sortTasks();

    var jc = document.querySelector(".just-changed");
    if(jc != undefined)
        jc.classList.remove("just-changed");
    document.querySelector("#ff-notice-" + parent.dataset.ffId).classList.add("just-changed");
}

$(document).ready(() => {
    var taskHolderObject = document.querySelector(taskHolder);

    if(retrievedContent != null) {
        setupTasks(retrievedContent);
    }
})