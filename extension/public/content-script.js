console.log("IN PREFERENCE MANAGER");

const xpaths = {
  skipBtn:
    "//button[(contains(@class, 'ytp-skip-ad-button')) and (contains(@id, 'skip-button'))]",
  settingBtn: "//button[(contains(@class, 'ytp-settings-button'))]",
  autoplayBtn: "//div[@class='ytp-autonav-toggle-button']",
  theaterModeBtn:
    "//button[(contains(@class, 'ytp-size-button')) and (@aria-keyshortcuts='t')]",
  fullModeBtn:
    "//button[(contains(@class, 'ytp-fullscreen-button')) and (@aria-keyshortcuts='f')]",
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
  screenMode: screenModes.full,
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
 * Function which handles the video screen size according to preferences.
 */
function handleVideoScreenSize() {
  //theater mode button
  const theaterModeNode = document.evaluate(
    xpaths.theaterModeBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  //get theater mode button attributes
  const theaterNodeTitle = theaterModeNode.getAttribute("title").toLowerCase();
  const theaterNodeTitleNoTooltip = theaterModeNode
    .getAttribute("data-title-no-tooltip")
    .toLowerCase();
  //full screen button
  const fullModeNode = document.evaluate(
    xpaths.fullModeBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  //get full screen button attributes
  const fullNodeTitle = fullModeNode.getAttribute("title").toLowerCase();
  const fullNodeTitleNoTooltip = fullModeNode
    .getAttribute("data-title-no-tooltip")
    .toLowerCase();
  //for different modes
  switch (settings.screenMode) {
    case screenModes.normal:
      //exit full screen if video is in full screen
      if (
        fullModeNode !== null &&
        fullModeNode !== undefined &&
        (fullNodeTitle.includes("exit full screen") ||
          fullNodeTitleNoTooltip.includes("exit full screen"))
      ) {
        {
          //clicking with MouseEvent
          let clickEvent = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: false,
          });
          fullModeNode.dispatchEvent(clickEvent);
          console.log("Clicked to exit full screen for normal"); //logging
        }
      }
      //click if video is not in normal mode
      if (
        theaterModeNode !== null &&
        theaterModeNode !== undefined &&
        (theaterNodeTitle.includes("default view") ||
          theaterNodeTitleNoTooltip.includes("default view"))
      ) {
        {
          theaterModeNode.click();
          console.log("Clicked to exit theater mode for normal"); //logging
        }
      }
      break;
    case screenModes.theater:
      //exit full screen if video is in full screen
      if (
        fullModeNode !== null &&
        fullModeNode !== undefined &&
        (fullNodeTitle.includes("exit full screen") ||
          fullNodeTitleNoTooltip.includes("exit full screen"))
      ) {
        {
          fullModeNode.click();
          console.log("Clicked to exit full screen for theater"); //logging
        }
      }
      //click if video is not in theater mode
      if (
        theaterModeNode !== null &&
        theaterModeNode !== undefined &&
        (theaterNodeTitle.includes("theater mode") ||
          theaterNodeTitleNoTooltip.includes("theater mode"))
      ) {
        {
          theaterModeNode.click();
          console.log("Clicked to enter theater for theater"); //logging
        }
      }
      break;
    case screenModes.full:
      //exit theater mode is video is in theater mode
      if (
        theaterModeNode !== null &&
        theaterModeNode !== undefined &&
        (theaterNodeTitle.includes("default view") ||
          theaterNodeTitleNoTooltip.includes("default view"))
      ) {
        {
          theaterModeNode.click();
          console.log("Clicked to exit theater for full screen"); //logging
        }
      }
      //get full screen element if any
      const isInFullScreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      console.log("isInFullScreen:", isInFullScreen);
      //click full screen if video is not in full screen
      if (
        fullModeNode !== null &&
        fullModeNode !== undefined &&
        // !fullNodeTitle.includes("exit") &&
        // !fullNodeTitleNoTooltip.includes("exit")
        !isInFullScreen
      ) {
        {
          fullModeNode.click();
          console.log("Clicked to enter full screen for full screen"); //logging
        }
      }
      break;
  }
}

/**
 * Callback function for MutationObserver which handles all preference DOM change.
 * @param {*} mutationsList parameter supplied by MutationObserver
 */
function handleAllPreferences(mutationsList) {
  //checking that skipAd button has appeared
  if (settings.skipAd === true) {
    clickSkipBtn();
  }
  //handling autoplay
  handleAutoplayBtn();
  //handling video screen size
  handleVideoScreenSize();
}

function handlePreferencesOnSpecialOccasions() {
  handleAutoplayBtn();
  handleVideoScreenSize();
}

//observing DOM mutation to detect all buttons
const domObserver = new MutationObserver(handleAllPreferences);
const domObserverConfig = { childList: true, subTree: true, attributes: true };
domObserver.observe(document.body, domObserverConfig);

//another observer to specifically observe the youtube video (for screen size)
const vidObserver = new MutationObserver(() => {
  console.log("Observing video element"); //logging
  handleVideoScreenSize();
});
const vidElement = document.querySelector("video");
const vidObserverConfig = { childList: true, subtree: true, attributes: true };
if (vidElement) {
  vidObserver.observe(vidElement, vidObserverConfig);
}

//receiving the message that ad has been skipped
chrome.runtime.onMessage.addListener((request, response, sendResponse) => {
  if ({ msg: "adSkipped" }) {
    console.log("adSkipped msg"); //logging
    skipReqInProgress = false;
    handlePreferencesOnSpecialOccasions();
  }
});
