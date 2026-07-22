const xpaths = {
  skipBtn:
    "//button[(contains(@class, 'ytp-skip-ad-button')) and (contains(@id, 'skip-button'))]",
  settingBtn: "//button[(contains(@class, 'ytp-settings-button'))]",
  autoplayBtn: "//div[@class='ytp-autonav-toggle-button']",
  theaterModeBtn:
    "//button[(contains(@class, 'ytp-size-button')) and (@aria-keyshortcuts='t')]",
  fullModeBtn:
    "//button[(contains(@class, 'ytp-fullscreen-button')) and (@aria-keyshortcuts='f')]",
  dismissBtn: "//*[@id='dismiss-button']//button[1]",
  annotations: {
    parent: "//div[@class='ytp-menuitem-label' and text()='Annotations']/..",
    button:
      "//div[@class='ytp-menuitem-label' and text()='Annotations']/following::div[1]/div",
  },
  ambientMode: {
    parent: "//div[@class='ytp-menuitem-label' and text()='Ambient mode']/..",
    button:
      "//div[@class='ytp-menuitem-label' and text()='Ambient mode']/following::div[1]/div",
  },
  quality: {
    button: "//div[@class='ytp-menuitem-label' and text()='Quality']",
    menu: "//div[contains(@class, 'ytp-quality-menu')]",
    values: {
      auto: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'Auto')]/../../..",
      144: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'144p')]/../../..",
      240: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'240p')]/../../..",
      360: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'360p')]/../../..",
      480: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'480p')]/../../..",
      720: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'720p')]/../../..",
      1080: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'1080p')]/../../..",
      1440: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'1440p')]/../../..",
      2160: "//div[@class='ytp-menuitem-label']/div/span[contains(text(),'2160p')]/../../..",
    },
  },
  sleepTimer: {
    button: "//div[@class='ytp-menuitem-label' and text()='Sleep timer']",
    menu: "//div[contains(@class, 'ytp-panel')]//span[contains(@class, 'ytp-panel-title') and text()='Sleep timer']",
    values: {
      off: "//div[@class='ytp-menuitem-label' and contains(text(),'Off')]/..",
      10: "//div[@class='ytp-menuitem-label' and contains(text(),'10 minutes')]/..",
      15: "//div[@class='ytp-menuitem-label' and contains(text(),'15 minutes')]/..",
      20: "//div[@class='ytp-menuitem-label' and contains(text(),'20 minutes')]/..",
      30: "//div[@class='ytp-menuitem-label' and contains(text(),'30 minutes')]/..",
      45: "//div[@class='ytp-menuitem-label' and contains(text(),'45 minutes')]/..",
      60: "//div[@class='ytp-menuitem-label' and contains(text(),'60 minutes')]/..",
      end: "//div[contains(text(),'End of video')]/../../..",
    },
  },
  playback: {
    button: "//div[@class='ytp-menuitem-label' and text()='Playback speed']",
    menu: "//div[contains(@class, 'ytp-panel')]//span[contains(@class, 'ytp-panel-title') and text()='Playback speed']",
    values: {
      normal:
        "//button[contains(@class, 'ytp-variable-speed-panel-button')]//span[text()='1.0']/..",
      1.25: "//button[contains(@class, 'ytp-variable-speed-panel-button')]//span[text()='1.25']/..",
      1.5: "//button[contains(@class, 'ytp-variable-speed-panel-button')]//span[text()='1.5']/..",
      2: "//button[contains(@class, 'ytp-variable-speed-panel-button')]//span[text()='2.0']/..",
    },
    slider: "//input[contains(@class, 'ytp-input-slider') and @role='slider']",
  },
};
let vidUrlPattern =
  /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+(?:[&?][\w=-]+)*$/;
const screenModes = { normal: 0, theater: 1, full: 2 };
const qualities = {
  auto: 0,
  144: 1,
  240: 2,
  360: 3,
  480: 4,
  720: 5,
  1080: 6,
  1440: 7,
  2160: 8,
};

const timers = { off: 0, 10: 1, 15: 2, 20: 3, 30: 4, 45: 5, 60: 6, end: 7 };

const playbacks = {
  normal: 0,
  1.25: 1,
  1.5: 2,
  2: 3,
};

console.log("IN CONTENT SCRIPT");

let settings = null;
let loadingSettings = false;
let skipReqInProgress = false;
let reqCount = 0;

let currentUrl = location.href;

//TODO: Handle ads that appear in the middle of a video
/**
 * Function which checks if the skip button is present.
 */
function clickSkipBtn() {
  const node = document.evaluate(
    xpaths.skipBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  if (node !== null && node !== undefined) {
    const rect = node.getBoundingClientRect();
    console.log("skip btn found: ", node);
    try {
      node.click();
    } catch (err) {
      console.log("skip button click content err: ", err);
    }
    reqCount++;
    skipReqInProgress = true;
    chrome.runtime
      .sendMessage({
        event: "skipAd",
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        reqCount: reqCount,
      })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
        skipReqInProgress = false;
      });
  } else {
    console.log("skip btn not found: ", node);
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
    null,
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
    null,
  ).singleNodeValue;
  //get theater mode button attributes
  const theaterNodeTitle = theaterModeNode
    .getAttribute("data-tooltip-title")
    .toLowerCase();
  const theaterNodeTitleNoTooltip = theaterModeNode
    .getAttribute("data-title-no-tooltip")
    .toLowerCase();
  //full screen button
  const fullModeNode = document.evaluate(
    xpaths.fullModeBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  //get full screen button attributes
  const fullNodeTitle = fullModeNode
    .getAttribute("data-tooltip-title")
    .toLowerCase();
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
        }
      }
      //get full screen element if any
      const isInFullScreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
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
        }
      }
      break;
  }
}

/**
 * Function to handle the "Youtube Premium" popup based on preferences.
 */
function handlePremiumPopup() {
  if (settings.dismissPremiumPopup) {
    //get dismiss button
    const dismissBtn = document.evaluate(
      xpaths.dismissBtn,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    if (dismissBtn !== null && dismissBtn !== undefined) {
      dismissBtn.click();
    }
  }
}

/**
 * Function to click the settngs button in a YT video.
 */

function clickSettingsBtn() {
  const btn = document.evaluate(
    xpaths.settingBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  if (
    btn !== null &&
    btn !== undefined &&
    btn.getAttribute("aria-expanded") === "false"
  ) {
    btn.click();
    btn.blur();
    ``;
  }
}

/**
 * Function to click the settings button if the settings menu is still open.
 */
function closeSettingsMenu() {
  const btn = document.evaluate(
    xpaths.settingBtn,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  if (
    btn !== null &&
    btn !== undefined &&
    btn.getAttribute("aria-expanded") === "true"
  ) {
    btn.click();
  }
}

/**
 * Function to handle the annotations.
 */
function handleAnnotations() {
  clickSettingsBtn();
  //getting the annotations state - i.e. on or off
  const annotationsParent = document.evaluate(
    xpaths.annotations.parent,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  const annotationsState =
    annotationsParent !== null && annotationsParent !== undefined
      ? annotationsParent.getAttribute("aria-checked")
      : null;
  //if changing annotations state is necessary
  if (
    (settings.annotations == true &&
      annotationsState !== "true" &&
      annotationsState !== null &&
      annotationsState !== undefined) ||
    (settings.annotations == false &&
      annotationsState !== "false" &&
      annotationsState !== null &&
      annotationsState !== undefined)
  ) {
    const annotationsBtn = document.evaluate(
      xpaths.annotations.button,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    annotationsBtn.click();
  }
  clickSettingsBtn(); //closing the settings button
}

/**
 * Function to handle the ambient mode.
 */
function handleAmbientMode() {
  clickSettingsBtn();
  //getting the ambient state - i.e. on or off
  const ambientModeParent = document.evaluate(
    xpaths.ambientMode.parent,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  const ambientModeState =
    ambientModeParent !== null && ambientModeParent !== undefined
      ? ambientModeParent.getAttribute("aria-checked")
      : null;
  //if changing ambient mode state is necessary
  if (
    (settings.ambientMode == true &&
      ambientModeState !== "true" &&
      ambientModeState !== null &&
      ambientModeState !== undefined) ||
    (settings.ambientMode == false &&
      ambientModeState !== "false" &&
      ambientModeState !== null &&
      ambientModeState !== undefined)
  ) {
    const ambientModeBtn = document.evaluate(
      xpaths.ambientMode.button,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    ambientModeBtn.click();
  }
  closeSettingsMenu(); //closing the settings button
}

/**
 * Funtion to handle quality according to preference
 */
function handleQuality() {
  //click settings button
  clickSettingsBtn();
  const qualityBtn = document.evaluate(
    xpaths.quality.button,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  let inQuality = false;
  //determine if qualityBtn is clicked
  if (qualityBtn !== null && qualityBtn !== undefined) {
    qualityBtn.click();
    inQuality = true;
  }
  //if btn clicked
  if (inQuality) {
    //determine if quality menu appears
    const qualityMenu = document.evaluate(
      xpaths.quality.menu,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    //if quality menu appears
    if (qualityMenu !== null && qualityMenu !== undefined) {
      let qualitySet = false; //if we have already set quality
      let qualityValue = settings.quality; //value from qualities obj
      //while we have not set quality
      while (qualitySet !== true) {
        //get preference through quality value and button
        const qualityPreference = Object.keys(qualities).find(
          (key) => qualities[key] == qualityValue,
        );
        const qualityPreferenceBtn = document.evaluate(
          xpaths.quality.values[qualityPreference],
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue;
        //if button not found, decrease quality
        if (
          qualityPreferenceBtn === null ||
          qualityPreferenceBtn === undefined
        ) {
          qualityValue -= 1;
          continue;
        }
        //if quality is already equal to preference
        if (qualityPreferenceBtn.getAttribute("aria-checked") === "true") {
          qualitySet = true;
          continue;
        }
        //set quality if quality is not equal to preference
        else if (
          qualityPreferenceBtn.getAttribute("aria-checked") === "false"
        ) {
          qualityPreferenceBtn.click();
          qualitySet = true;
          continue;
        }
      }
    }
  }
  //close settings button
  closeSettingsMenu();
}

/**
 * Function to handle sleep timer according to preferences
 */
function handleTimer() {
  //open settings menu
  clickSettingsBtn();
  //timer button
  const timerBtn = document.evaluate(
    xpaths.sleepTimer.button,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  let inTimer = false;
  //if timer button clicked, flag up
  if (timerBtn !== null && timerBtn !== undefined) {
    timerBtn.click();
    inTimer = true;
  }
  //if flag up
  if (inTimer) {
    //determine if the timer menu is open
    const timerMenu = document.evaluate(
      xpaths.sleepTimer.menu,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    //if menu is open
    if (timerMenu !== null && timerMenu !== undefined) {
      let timerValue = settings.timer;
      //get timerPreference
      const timerPreference = Object.keys(timers).find(
        (timer) => timers[timer] == timerValue,
      );
      //get button for preference
      const timerPreferenceBtn = document.evaluate(
        xpaths.sleepTimer.values[timerPreference],
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
      if (
        timerPreferenceBtn !== null &&
        timerPreferenceBtn !== undefined &&
        timerPreferenceBtn.getAttribute("aria-checked") !== null &&
        timerPreferenceBtn.getAttribute("aria-checked") !== undefined &&
        timerPreferenceBtn.getAttribute("aria-checked") === "false" &&
        timerPreferenceBtn.getAttribute("aria-checked") !== "true"
      ) {
        timerPreferenceBtn.click();
      }
    }
  }
  //close settings menu
  closeSettingsMenu();
}

function handlePlayback() {
  //click settings btn
  clickSettingsBtn();
  const playbackBtn = document.evaluate(
    xpaths.playback.button,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  let inPlayback = false;
  //if playback button clicked, flag up
  console.log("playback button:", playbackBtn);
  if (playbackBtn !== null && playbackBtn !== undefined) {
    playbackBtn.click();
    inPlayback = true;
  }
  console.log("inPlayback:", inPlayback);
  //if flag up
  if (inPlayback) {
    //determine if the playback menu is open
    const playbackMenu = document.evaluate(
      xpaths.playback.menu,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
    //if menu is open
    if (playbackMenu !== null && playbackMenu !== undefined) {
      let playbackValue = settings.playback;
      //get playback preference
      const playbackPreference = Object.keys(playbacks).find(
        (key) => playbacks[key] === playbackValue,
      );
      //get button for preference
      console.log(
        "playback pref:",
        playbackPreference,
        xpaths.playback.values[playbackPreference],
      );
      const playbackPreferenceBtn = document.evaluate(
        xpaths.playback.values[playbackPreference],
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
      const playbackSlider = document.evaluate(
        xpaths.playback.slider,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
      console.log("playback pref button:", playbackPreferenceBtn);
      if (
        playbackPreferenceBtn !== null &&
        playbackPreferenceBtn !== undefined &&
        playbackSlider !== null &&
        playbackSlider !== undefined &&
        playbackSlider.getAttribute("aria-valuenow") !== null &&
        playbackSlider.getAttribute("aria-valuenow") !== undefined &&
        playbackSlider.getAttribute("aria-valuenow") !== `${playbackPreference}`
      ) {
        playbackPreferenceBtn.click();
        console.log("playback pref button clicked");
      }
    }
  }
  //close settings button
  closeSettingsMenu();
}

/**
 * Callback function for MutationObserver which handles all preference DOM change.
 * @param {*} mutationsList parameter supplied by MutationObserver
 */
function handleAllPreferences() {
  if (!vidUrlPattern.test(location.href)) return;

  if (!settings) {
    loadSettings();
    return;
  }

  if (settings.skipAd) {
    clickSkipBtn();
  }

  handleAutoplayBtn();
  handleVideoScreenSize();
  handlePremiumPopup();
  handleAnnotations();
  handlePlayback();
  handleQuality();
  handleTimer();
  handleAmbientMode();
  closeSettingsMenu();
}

/**
 * Function to handle preferences excluding skip Ad
 */
function handlePreferencesOnSpecialOccasions() {
  if (settings !== null) {
    handleAutoplayBtn();
    handleVideoScreenSize();
    handlePremiumPopup();
    handleAnnotations();
    handlePlayback();
    handleQuality();
    handleTimer();
    handleAmbientMode();
    closeSettingsMenu();
  }
}

//observing DOM mutation to detect all buttons
const domObserver = new MutationObserver(handleAllPreferences);
const domObserverConfig = { childList: true, subTree: true, attributes: true };
domObserver.observe(document.body, domObserverConfig);

//another observer to specifically observe the youtube video (for screen size)
const vidObserver = new MutationObserver(() => {
  if (vidUrlPattern.test(location.href)) {
    handlePreferencesOnSpecialOccasions();
  }
});

const observer = new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;

    settings = null;

    loadSettings();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

const vidElement = document.querySelector("video");
const vidObserverConfig = { childList: true, subtree: true, attributes: true };
if (vidElement) {
  vidObserver.observe(vidElement, vidObserverConfig);
}

if (vidUrlPattern.test(location.href)) {
  loadSettings();
}

async function loadSettings() {
  if (loadingSettings || settings) return;

  loadingSettings = true;

  try {
    const res = await chrome.runtime.sendMessage({
      action: "askSettings",
    });

    settings = res.settings;

    handlePreferencesOnSpecialOccasions();
  } finally {
    loadingSettings = false;
  }
}

//receiving the message that ad has been skipped
chrome.runtime.onMessage.addListener((request, response, sendResponse) => {
  if (request.msg === "adSkipped") {
    skipReqInProgress = false;
    handlePreferencesOnSpecialOccasions();
  }
});

// //receiving settings from service worker
// chrome.runtime.onMessage.addListener((request, response, sendResponse) => {
//   if (request.action === "sendSettings") {
//     settings = request.settings;
//   }
// });

chrome.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "sendSettings":
      settings = request.settings;

      if (vidUrlPattern.test(location.href)) {
        handlePreferencesOnSpecialOccasions();
      }

      break;
  }
});
