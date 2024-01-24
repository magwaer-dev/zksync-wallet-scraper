const { balanceApiEndpoint } = require("../constants.js");

const { buildApiUrl, weiToEth, giveParams } = require("../helper-functions");

const { makeApiRequest } = require("../api-utils.js");

async function walletBalance(walletAddress) {
  try {
    const params = giveParams("address", walletAddress);
    const apiUrl = buildApiUrl(balanceApiEndpoint, params);
    const response = await makeApiRequest(apiUrl);

    if (response !== null) {
      const dataInEth = weiToEth(response);
      return dataInEth;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in balance function:", error.message);
    return null;
  }
}

module.exports = {
  walletBalance,
};
