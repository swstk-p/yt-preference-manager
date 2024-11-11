console.log("IN PREFERENCE MANAGER");

const xpaths = {
  skipBtn:
    "//button[(@class='ytp-skip-ad-button') and (contains(@id, 'skip-button'))]",
  settingBtn: "//button[(contains(@class, 'ytp-settings-button'))]",
};

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
  if (node !== null && node !== undefined) {
    chrome.runtime
      .sendMessage({ event: "skipAd" })
      .then((res) => {
        console.log("SkipAd res:", res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

const domObserver = new MutationObserver(checkSkipBtn);
const domObserverConfig = { childList: true, subTree: true };
domObserver.observe(document.body, domObserverConfig);

//make a mutation observer object and observer with it
//the mutation observer needs a callback function
//detect if the skip button appears
