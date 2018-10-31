const HEADER_CONTENT_TYPE = "Content-Type";
const MIME_TYPE_TEXT_JS = "text/javascript";
const MIME_TYPE_APP_JS = "application/javascript";
const MIME_TYPE_BINAST = "application/javascript-binast";

// A timestamp for the latest JS resource loaded.
// If `null`, no JS was loaded.
var latestJSResourceLoadTimeStamp = null;

var myContentKind = {
    // Set to `true` once we know that there is at least one BinAST resource.
    hasBinASTJS: false,

    // Set to `true` once we know that there is at least one text JS resource.
    hasTextJS: false,

    // Set to `true` once we know that there is at least one JS resource that has
    // an unexpected mime type.
    hasUnknownJS: false,
};

function onResourceLoadComplete(details) {
    console.log("BinAST Monitor", "Script loaded", details);

    // Record load time.
    latestJSResourceLoadTimeStamp = window.performance.now();

    // Classify resource.
    let { url, responseHeaders } = details;

    let content_type = responseHeaders.find( ({name}) => name == HEADER_CONTENT_TYPE);
    console.log("BinAST Monitor", "Content type", content_type);
    switch (content_type) {
        case MIME_TYPE_TEXT_JS:
        case MIME_TYPE_APP_JS: {
            myContentKind.hasTextJS = true;
            break;
        }
        case MIME_TYPE_BINAST: {
            myContentKind.hasBinASTJS = true;
            break;
        }
        default:
            console.log("BinAST Monitor", "Received unknown script", content_type);
            myContentKind.hasUnknownJS = true;
            break;
    }
}

function onStart() {
    // We wish to be informed of the load of all scripts.
    // FIXME: Unregister listener.
    browser.webRequest.onCompleted.addListener(onResourceLoadComplete,
        { types: ["script"] },
        ["responseHeaders"]
    )
}

function onInteractive() {
    // All the loads that we're interested in are complete.

    // --- Cleanup
    browser.webRequest.onCompleted.removeListener(onResourceLoadComplete);

    // -- Check whether something was loaded
    if (!latestJSResourceLoadTimeStamp) {
        console.log("BinAST Monitor", "No JS was loaded");
        return;
    }


    // --- Extract performance data
    var perf = window.performance.getEntriesByType("navigation");

    // Total Time to Interactive, including network load of external resources needed
    // until this point.
    const totalTimeToInteractive = perf.domInteractive - perf.domContentLoadedEventEnd;

    // Time spent after load of external JS resources resources needed until this
    // point.
    const estimatedParsingTime = perf.domInteractive - latestJSResourceLoadTimeStamp;

    // --- Send performance data to background service for treastment
    browser.runtime.sendMessage({
        kind: "perf",
        content: myContentKind,
        url: url,
        value: {
            estimatedParsingTime,
            totalTimeToInteractive
        }
    })
}