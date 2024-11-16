console.log("IN PREFERENCE MANAGER");

const xpaths = {
  skipBtn:
    "//button[(contains(@class, 'ytp-skip-ad-button')) and (contains(@id, 'skip-button'))]",
  settingBtn: "//button[(contains(@class, 'ytp-settings-button'))]",
  autoplayBtn: "//div[@class='ytp-autonav-toggle-button']",
};

const screenModes = { normal: 0, theater: 1, full: 2 };
const qualities = {
  auto: 0,
  144: 1,
  240: 2,
  350: 3,
  480: 4,
  720: 5,
  1080: 6,
  1440: 7,
};

const timers = { off: 0, 10: 1, 20: 2, 30: 3, 45: 4, 60: 5, end: 6 };

const playbacks = {
  0.25: 0,
  0.5: 1,
  0.75: 2,
  normal: 3,
  1: 4,
  1.25: 5,
  1.5: 6,
  1.75: 7,
  2: 8,
};

const settings = {
  skipAd: true,
  autoplay: false,
  screenMode: screenModes.normal,
  quality: qualities.auto,
  timer: timers.off,
  playback: playbacks.normal,
};

let skipReqInProgress = false;
let reqCount = 0;

/**
 * Function which checks if the skip button is present.
 */
function clickSkipBtn() {
  console.log("DOM changed."); //logging
  const node = document.evaluate(
    xpaths.skipBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  console.log("Node:", node); //logging
  console.log("skipReqInProgress:", skipReqInProgress); //logging
  if (node !== null && node !== undefined && !skipReqInProgress) {
    console.log("Valid skip button found"); //logging

    reqCount++;
    skipReqInProgress = true;
    chrome.runtime
      .sendMessage({ event: "skipAd", reqCount: reqCount })
      .then((res) => {
        console.log("SkipAd res:", res);
      })
      .catch((err) => {
        console.log(err);
        skipReqInProgress = false;
      });
  }
}

/**
 * Function which checks if the autoplay button has appeared and clicks on it.
 */
function handleAutoplayBtn() {
  const node = document.evaluate(
    xpaths.autoplayBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (node !== null && node !== undefined) {
    //click button if necessary
    if (
      (node.getAttribute("aria-checked") === "true" &&
        settings.autoplay === false) ||
      (node.getAttribute("aria-checked") === "false" &&
        settings.autoplay === true)
    ) {
      node.click();
    }
  }
}

/**
 * Callback function for MutationObserver which checks if all the concerned buttons have appeared on DOM change.
 * @param {*} mutationsList parameter supplied by MutationObserver
 */
function checkAllBtns(mutationsList) {
  //checking that skipAd button has appeared
  if (settings.skipAd === true) {
    clickSkipBtn();
  }
  //handling autoplay
  handleAutoplayBtn();
}

//observing DOM mutation to detect all buttons
const domObserver = new MutationObserver(checkAllBtns);
const domObserverConfig = { childList: true, subTree: true, attributes: true };
domObserver.observe(document.body, domObserverConfig);

//receiving the message that ad has been skipped
chrome.runtime.onMessage.addListener((request, response, sendResponse) => {
  if ({ msg: "adSkipped" }) {
    console.log("adSkipped msg"); //logging
    skipReqInProgress = false;
  }
});
