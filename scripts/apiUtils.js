const gotScraping = require("got-scraping");

async function makeApiRequest(apiUrl) {
  try {
    const response = await gotScraping.got(apiUrl, { responseType: "json" });

    if (response.body.status === "1") {
      // console.log("API Response:", response.body.result);y
      return response.body.result;
    } else {
      const errorMessage = response.body.message || "";
      if (!errorMessage.includes("No data found")) {
        console.error("Error in API response:", errorMessage);
      }
      return null;
    }
  } catch (error) {
    console.error("Error making API request:", error.message);
    return null;
  }
}

module.exports = {
  makeApiRequest,
};
