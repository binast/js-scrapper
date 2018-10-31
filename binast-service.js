// FIXME: Precompute buckets.

let BUCKETS = [];

function Entry({estimatedParsingTime, totalTimeToInteractive}) {
    this.estimatedParsingTime = intoBucket(estimatedParsingTime);
    this.totalTimeToInteractive = intoBucket(totalTimeToInteractive);
}

function Collection() {
}
Collection.prototype = {
    insert: function(url, performance) {
        if (typeof this[url] == "undefined") {
            this[url] = [];
        }
        this[url].push(new Entry(performance));
    }
}

let ping = {
    // Performance for a page that uses only BinAST.
    //
    // Map: URL -> Entry.
    binASTPerformance: new Collection(),

    // Performance for a page that uses both BinAST and text source.
    //
    // Map: URL -> Entry.
    mixedPerformance: new Collection(),

    // Performance for a page that uses only text source.
    //
    // Map: URL -> Entry.
    textPerformance: new Collection(),
};

function intoBucket(value) {
    for (let i = 0; i < BUCKETS.length; ++i) {
        if (value <= BUCKETS[i]) {
            return i;
        }
    }
    return BUCKETS.length;
}

function onPerf(event) {
    console.log("BinAST Monitor Background Service", "Received event", event);

    // -- Add to buckets.
    let {
        content,
        url,
        value
    } = event;

    let collection;
    if (content.hasBinASTJS && (content.hasTextJS || content.hasUnknownJS)) {
        collection = ping.mixedPerformance;
    } else if (content.hasBinASTJS) {
        collection = ping.binASTPerformance;
    } else {
        collection = ping.textPerformance;
    }

    collection.insert(value)

    // --
    browser.telemetry
}

browser.runtime.onMessage.addListener(function(msg) {
    switch (msg.event) {
        case "perf":
            return onTimeMeasured(event);
        default:
            console.error("Invalid event", msg);
            return;
    }
})