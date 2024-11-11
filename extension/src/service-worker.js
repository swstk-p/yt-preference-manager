// const puppeteer = require("puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js");
import {
  connect,
  ExtensionTransport,
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

console.log("Content script");
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.event === "domChange") {
    // connecting page
    const browser = await connect({
      transport: await ExtensionTransport.connectTab(sender.tab.id),
    });
    const [page] = await browser.pages();
    console.log("tab title:", await page.evaluate("document.title"));
    browser.disconnect().then((res) => {
      console.log("Page disconnected");
    });
    return true;
  }
});
