import {
  connect,
  ExtensionTransport,
  Page,
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

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

const defaults = {
  autoplay: false,
  screenMode: screenModes.normal,
  dismissPremiumPopup: true,
  ambientMode: true,
  quality: qualities.auto,
  playback: playbacks.normal,
};

let pageControllers = [];
const xpaths = {
  skipBtn:
    "//button[(contains(@class, 'ytp-skip-ad-button')) and (contains(@id, 'skip-button'))]",
  settingBtn: "//button[(contains(@class, 'ytp-settings-button'))]",
};

class PageController {
  constructor(tabId) {
    this.tabId = tabId; //to keep track of tabId
    this.browser = null;
    this.page = null;
  }

  /**
   * Sets the browser and page objects as instance variables.
   */
  async init() {
    try {
      const browser = await connect({
        transport: await ExtensionTransport.connectTab(this.tabId),
      });
      const [page] = await browser.pages();
      this.browser = browser;
      this.page = page;
    } catch (err) {
      console.log("Error during PageController init:", err);
    }
  }

  /**
   * Clicks the skip ad button using xpath
   */
  async clickSkipAd(request) {
    try {
      // const skipBtn = await this.page.waitForSelector(
      //   `::-p-xpath(${xpaths.skipBtn})`,
      //   { visible: true },
      // );
      // const skipBtn = await this.page.waitForSelector(".ytp-skip-ad-button");

      // console.log("skipBtn: ", skipBtn);
      // await skipBtn.click();
      const client = await this.page.createCDPSession();

      await client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: request.x,
        y: request.y,
        button: "left",
        clickCount: 1,
      });

      await client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: request.x,
        y: request.y,
        button: "left",
        clickCount: 1,
      });

      console.log("client:", client);
      console.log("skip btn at:", request.x, request.y);
    } catch (err) {
      console.log("Error while clicking skip button:", err);
    }
  }

  /**
   * Closes connection with the page.
   */
  async close() {
    try {
      await this.browser.disconnect();
    } catch (err) {
      console.log("Error while disconnecting the browser:", err);
    }
  }
}

//respond to content script asking for settings
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("MESSAGE RECEIVED", request, sender);
  if (request.action === "askSettings") {
    getSettings().then((settings) => {
      sendResponse({ settings });
    });

    return true;
  }

  if (request.event === "skipAd") {
    (async () => {
      try {
        //get controller obj
        const pageController = await getPageController(sender.tab.id);
        //click the skip ad button
        await pageController.clickSkipAd(request);
        //removes controller obj from the controller array
        pageControllers = pageControllers.filter(
          (controller) => controller.tabId !== sender.tab.id,
        );
        // close controller obj
        pageController.close().then(() => {
          chrome.tabs.sendMessage(sender.tab.id, { msg: "adSkipped" });
        });
        //sendResponse didn't work asynchronously
        sendResponse({ success: true });
        //sending message to tab that the ad has been skipped
        return true;
      } catch (err) {
        console.log("Err while skipping ad:", err); //logging
        sendResponse({ success: false });
        return true;
      }
    })();
  }

  if (request.action === "sendSettings") {
    (async () => {
      try {
        // Save to storage
        await chrome.storage.local.set({
          "yt-settings": request.settings,
        });

        // Send updated settings to every YouTube tab
        const tabs = await chrome.tabs.query({
          url: "*://*.youtube.com/*",
        });

        for (const tab of tabs) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: "sendSettings",
              settings: request.settings,
            });
          } catch (err) {
            // Ignore tabs without a content script
          }
        }

        sendResponse({ success: true });
      } catch (err) {
        console.error(err);
        sendResponse({
          success: false,
          error: err.message,
        });
      }
    })();

    return true;
  }
});

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   if (request.event === "skipAd") {
//     try {
//       //get controller obj
//       const pageController = await getPageController(sender.tab.id);
//       //click the skip ad button
//       await pageController.clickSkipAd();
//       //removes controller obj from the controller array
//       pageControllers = pageControllers.filter(
//         (controller) => controller.tabId !== sender.tab.id,
//       );
//       // close controller obj
//       pageController.close().then(() => {
//         chrome.tabs.sendMessage(sender.tab.id, { msg: "adSkipped" });
//       });
//       //sendResponse didn't work asynchronously
//       sendResponse({ success: true });
//       //sending message to tab that the ad has been skipped
//       return true;
//     } catch (err) {
//       console.log("Err while skipping ad:", err); //logging
//       sendResponse({ success: false });
//       return true;
//     }
//   }
// });

/**
 * Obtains PageController obj if it exists for given tab; else creates and returns a new one.
 * @param {*} tabId ID number representing the tab.
 * @returns A PageController obj
 */
async function getPageController(tabId) {
  //finds and returns pageController
  if (pageControllers.length > 0) {
    const pageController = pageControllers.find(
      (controller) => controller.tabId === tabId,
    );
    if (pageController !== undefined) {
      return pageController;
    }
  }
  //creates new pageController as none found
  const pageController = new PageController(tabId);
  await pageController.init();
  pageControllers.push(pageController);
  return pageController;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("in injection listener");
  if (changeInfo.url) {
    //check URL to see if it matches video URL pattern
    const vidUrlPattern = new RegExp(
      "^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+",
    );
    if (vidUrlPattern.test(changeInfo.url)) {
      //injecting content script into the tab
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["../app/content-script.js"],
      });
    }
  }
});

/**
 * Function to send settings to all the tabs
 */
async function sendSettingsToTabs(settingsToSend) {
  // chrome.tabs.query({}, (tabs)=>tabs.forEach(tab=>chrome.tabs.sendMessage(tab.id, {action: "sendSettings", settings:settingsToSend})));
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    chrome.tabs
      .sendMessage(tab.id, { action: "sendSettings", settings: settingsToSend })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
      });
  }
}

async function getSettings() {
  let result = await chrome.storage.local.get("yt-settings");

  if (!result["yt-settings"]) {
    await chrome.storage.local.set({
      "yt-settings": defaults,
    });

    return defaults;
  }

  return result["yt-settings"];
}

//check storage for saved settings on start up
chrome.runtime.onStartup.addListener(() => {
  getSettings().then((settings) => {
    console.log("startup settings: ", settings);
  });
});

chrome.runtime.onInstalled.addListener(() => {
  getSettings().then((settings) => {
    console.log("install settings: ", settings);
  });
});
