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
        filename: "scrap/" + escape(url),
        method: details.method,
        saveAs: false,
        url
    })
        .catch(e => konsole.error("Download could not start", e));
}