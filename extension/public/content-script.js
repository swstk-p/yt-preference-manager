console.log("IN PREFERENCE MANAGER");

const xpaths = {
    skipBtn: "//button[(@class='ytp-skip-ad-button') and (contains(@id, 'skip-button'))]",
    settingBtn: "//button[(contains(@class, 'ytp-settings-button'))]",
};

let skipReqInProgress = false;

/**
 * Callback function for MutationObserver which checks if the skip button is present
 * @param {*} mutationsList parameter supplied by MutationObserver
 */
function checkSkipBtn(mutationsList) {
    const node = document.evaluate(
        xpaths.skipBtn,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    if (node !== null && node !== undefined && !skipReqInProgress) {
        skipReqInProgress = true;
        chrome.runtime
            .sendMessage({ event: "skipAd" })
            .then((res) => {
                console.log("SkipAd res:", res);
                if (res.success === true) {
                    skipReqInProgress = false;
                }
            })
            .catch((err) => {
                console.log(err);
                skipReqInProgress = false;
            });
    }
}

const domObserver = new MutationObserver(checkSkipBtn);
const domObserverConfig = { childList: true, subTree: true };
domObserver.observe(document.body, domObserverConfig);