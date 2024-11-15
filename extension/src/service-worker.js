import {
  connect,
  ExtensionTransport,
  Page,
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

let pageControllers = [];
const xpaths = {
  skipBtn:
    "//button[(@class='ytp-skip-ad-button') and (contains(@id, 'skip-button'))]",
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
  async clickSkipAd() {
    try {
      const skipBtn = await this.page.waitForSelector(
        `::-p-xpath(${xpaths.skipBtn})`,
        { visible: true }
      );
      await skipBtn.click();
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

/**
 * Obtains PageController obj if it exists for given tab; else creates and returns a new one.
 * @param {*} tabId ID number representing the tab.
 * @returns A PageController obj
 */
async function getPageController(tabId) {
  //finds and returns pageController
  if (pageControllers.length > 0) {
    console.log("Controller array length:", pageControllers.length); //logging
    const pageController = pageControllers.find(
      (controller) => controller.tabId === tabId
    );
    if (pageController !== undefined) {
      console.log("pageController not undefined."); //logging
      return pageController;
    }
  }
  console.log("No pageController found"); //logging
  //creates new pageController as none found
  const pageController = new PageController(tabId);
  await pageController.init();
  pageControllers.push(pageController);
  console.log("pageController pushed.");
  return pageController;
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.event === "skipAd") {
    try {
      //get controller obj
      const pageController = await getPageController(sender.tab.id);
      //click the skip ad button
      await pageController.clickSkipAd();
      // close controller obj
      await pageController.close();
      console.log("Controller closed"); //logging
      //removes controller obj from the controller array
      pageControllers = pageControllers.filter(
        (controller) => controller.tabId !== sender.tab.id
      );
      console.log("pageController removed"); //logging
      sendResponse({ success: true });
    } catch (err) {
      console.log("Err while skipping ad:", err); //logging
      sendResponse({ success: false });
    }
    return true;
  }
});

// TODO1: handle second ad
// TODO2: handle sendResponse
