window.onload = function() {
    // document.getElementById("openWSBtn").onclick = function a() {
    //     chrome.runtime.sendMessage({
    //         type: "openWS"
    //     });
    // }

    // document.getElementById("closeWSBtn").onclick = function b() {
    //     chrome.runtime.sendMessage({
    //         type: "closeWS"
    //     }); 
    // }

    document.getElementById("scrollDownBtn").onclick = function c() {
        chrome.runtime.sendMessage({
            type: "Scroll-Down"
        });
    }

    document.getElementById("scrollUpBtn").onclick = function d() {
        chrome.runtime.sendMessage({
            type: "Scroll-Up"
        });
    }

    document.getElementById("zoomInBtn").onclick = function e() {
        chrome.extension.sendMessage({
            type: "zoom-in"
        });
    }

    document.getElementById("zoomOutBtn").onclick = function f() {
        chrome.extension.sendMessage({
            type: "zoom-out"
        });
    }

    document.getElementById("backBtn").onclick = function f() {
        chrome.extension.sendMessage({
            type: "Back"
        });
    }
    document.getElementById("newTabBtn").onclick = function f() {
        chrome.extension.sendMessage({
            type: "newTab"
        });
    }
}