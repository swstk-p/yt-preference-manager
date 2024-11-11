console.log("IN PREFERENCE MANAGER");

/**
 * Function to specify this extension while logging.
 * @param {*} msg message to log
 */
function logThis(msg) {
  console.log(`Ad Skipper: ${msg}`);
}

const xpaths = {
  skipBtn:
    "//button[(@class='ytp-skip-ad-button') and (contains(@id, 'skip-button'))]",
  settingBtn: "//button[(contains(@class, 'ytp-settings-button'))]",
};

/**
 * Function to observe and click skip button
 * @param {*} node node representing the skip button
 */
function observerAndClickBtn(node) {
  //creating a mutation observer for node
  const btnObserver = new MutationObserver((mutationsList) => {
    //logging
    console.log("Node is:", node);
    console.log("Node style:", node.style);
    console.log("Node length:", node.style.length);
    console.log("Node display:", node.style.display);
    // creating mouse click event for node
    const clickEvent = new MouseEvent("click");
    //dispatching mouse click event
    const clicked = node.dispatchEvent(clickEvent);
    console.log("Clicked:", clicked);
    if (clicked) {
      logThis("Skip button clicked");
    } else {
      logThis("Not clicked");
    }
  });
  const btnObserverConfig = { attributes: true, attributeFilter: ["style"] };
  btnObserver.observe(node, btnObserverConfig);
}

/**
 * Callback function for MutationObserver which checks if the skip button is present
 * @param {*} mutationsList parameter supplied by MutationObserver
 */
function checkSkipBtn(mutationsList) {
  chrome.runtime
    .sendMessage({ event: "domChange", id: tab.id })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

const domObserver = new MutationObserver(checkSkipBtn);
const domObserverConfig = { childList: true, subTree: true };
domObserver.observe(document.body, domObserverConfig);

//make a mutation observer object and observer with it
//the mutation observer needs a callback function
//detect if the skip button appears
