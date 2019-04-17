// A console-like API that prints its output using notifications.
var konsole = {
    log: (...args) => {
        browser.notifications.create({
            "type": "basic",
            "title": "Scrap",
            "message": args.join(" ")
        });
    },
    error: (...args) => {
        browser.notifications.create({
            "type": "basic",
            "title": "Scrap Error!",
            "message": args.join(" ")
        });
    }
}

konsole.log("Scrap is starting.", "All your JS will be downloaded.");

// A set of downloaded data. Used to avoid downloading the same file
// more than once.
var downloaded = new Set();

var pathPrefix = (function() {
    var date = new Date();
    var year = "" + date.getFullYear();
    var month = "" + (date.getMonth() + 1);
    if (month.length < 2) {
        month = "0" + month;
    }
    var day = "" + date.getDate();
    if (day.length < 2) {
        day = "0" + day;
    }
    var yyyymmdd = year + month + day;
    return "scrap/" + yyyymmdd + "/";
})();


// We wish to be informed of the load of all scripts.
browser.webRequest.onCompleted.addListener(onResourceLoadComplete,
    {
        urls: [ "*://*/*" ],
        types: ["script"]
    },
);

function onResourceLoadComplete(details) {
    let url = details.url;
    if (downloaded.has(url)) {
        // Skip duplicates.
        return;
    }
    downloaded.add(url);

    konsole.log("scrap", "Downloading", url);
    browser.downloads.download({
        filename: pathPrefix + escape(url),
        method: details.method,
        saveAs: false,
        url
    })
        .catch(e => konsole.error("Download could not start", e));
}