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

browser.notifications.create({
    "type": "basic",
    "title": "Scrap",
    "message": "scrap is starting",
});

// We wish to be informed of the load of all scripts.
browser.webRequest.onCompleted.addListener(onResourceLoadComplete,
    {
        urls: [ "*://*/*" ],
        types: ["script"]
    },
);

function onResourceLoadComplete(details) {
    let url = details.url;
    konsole.log("scrap", "Downloading", url);
    browser.downloads.download({
        filename: "scrap/" + escape(url),
        method: details.method,
        saveAs: false,
        url
    })
        .catch(e => konsole.error("Download could not start", e));
}