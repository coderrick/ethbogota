/**
 * CSS to hide everything on the page,
 * except for elements that have the "Chartify-image" class.
 */

const hidePage = `body > :not(.Chartify-image) {
                    display: none;
                  }`;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {

    /**
     * Given the name of a Chart, get the URL to the corresponding image.
     */
    function chartNameToURL(ChartName) {
      switch (ChartName) {
        case "Positive":
          return browser.runtime.getURL("charts/positive.jpg");
        case "Negative":
          return browser.runtime.getURL("charts/negative.jpg");
        case "Inconclusive":
          return browser.runtime.getURL("charts/inconclusive.jpg");
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the Chart URL and
     * send a "Chartify" message to the content script in the active tab.
     */
    function calculate(tabs) {
      browser.tabs.insertCSS({code: hidePage}).then(() => {
        let url = chartNameToURL(e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: "calculate",
          ChartURL: url
        });
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({code: hidePage}).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not calculate: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "Chartify()" or "reset()" as appropriate.
     */
    if (e.target.classList.contains("chart")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(Chartify)
        .catch(reportError);
    }
    else if (e.target.classList.contains("reset")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(reset)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/main.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);
