(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * Given a URL to a Chart image, remove all existing Charts, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertChart(ChartURL) {
    removeExistingCharts();
    let ChartImage = document.createElement("img");
    ChartImage.setAttribute("src", ChartURL);
    ChartImage.style.height = "100vh";
    ChartImage.className = "chart-image";
    document.body.appendChild(ChartImage);
  }

  /**
   * Remove every Chart from the page.
   */
  function removeExistingCharts() {
    let existingCharts = document.querySelectorAll(".chart-image");
    for (let Chart of existingCharts) {
      Chart.remove();
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "calculate()" or "reset()".
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "calculate") {
      insertChart(message.ChartURL);
    } else if (message.command === "reset") {
      removeExistingCharts();
    }
  });

})();
