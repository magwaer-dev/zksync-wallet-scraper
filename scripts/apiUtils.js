const gotScraping = require("got-scraping");


async function makeApiRequest(apiUrl) {
  try {
    const response = await gotScraping.got(apiUrl, { responseType: "json" });

    if (response.body.status === "1") {
      return response.body.result;
    } else {
      console.error("Error in API response:", response.body.message);
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
