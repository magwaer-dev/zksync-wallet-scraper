const { txListApiEndpoint } = require("../constants.js");
const { buildApiUrl, giveParams } = require("../helperFunctions");
const { makeApiRequest } = require("../apiUtils.js");

async function getTransactions(walletAddress) {
  const pageSize = 10; // Number of transactions per page
  let page = 1;
  let allTransactions = [];

  try {
    while (true) {
      const params = giveParams("address", walletAddress, page, pageSize);
      const apiUrl = buildApiUrl(txListApiEndpoint, params);
      const response = await makeApiRequest(apiUrl);

      if (response !== null && Array.isArray(response)) {
        const filteredTransactions = response.filter(
          (transaction) => transaction.isError === "0"
        );

        allTransactions = allTransactions.concat(filteredTransactions);

        if (response.length < pageSize) {
          break;
        } else {
          page++;
        }
      } else {
        console.error("Error retrieving transactions:", response);
        return null;
      }
    }

    return allTransactions;
  } catch (error) {
    console.error("Error in getTransactions function:", error.message);
    return null;
  }
}

module.exports = { getTransactions };
