const { balanceApiEndpoint } = require("../constants.js");

const { buildApiUrl, weiToEth, giveParams } = require("../helperFunctions");

const { makeApiRequest } = require("../apiUtils.js");

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
