const { gotScraping } = require("got-scraping");

const API_URL = "https://block-explorer-api.mainnet.zksync.io/api";
const MODULE_ACCOUNT = "account";
const ACTION_BALANCE = "balance";
const ACTION_TRANSACTIONS = "txlist";
const ACTION_CONTRACT_SOURCE_CODE = "getsourcecode";

async function makeApiCall(endpoint, params, userAgent) {
  const response = await gotScraping.get(API_URL, {
    searchParams: {
      action: endpoint,
      module: MODULE_ACCOUNT,
      ...params,
    },
    headers: {
      "User-Agent": userAgent,
    },
  });

  console.log("API Response:", response.body);

  if ((response.body = "1")) {
    return response.result;
  } else {
    throw new Error("Api error: ", response.message);
  }
}

async function getWalletBalance(walletAddress, userAgent) {
  const params = { address: walletAddress };
  return makeApiCall(ACTION_BALANCE, params, userAgent);
}

async function getWalletTransactions(walletAddress, userAgent) {
  const params = { address: walletAddress };
  let allTransactions = [];

  let page = 1;
  while (true) {
    try {
      const result = await makeApiCall(
        ACTION_TRANSACTIONS,
        { ...params, page },
        userAgent
      );

      let succesfulTransactions = result.filter((tx) => tx.isError === "0");
      allTransactions = allTransactions.concat(succesfulTransactions);

      if (result.length === 0) {
        break;
      }

      page++;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  return allTransactions;
}

async function getUniqueAddresses(walletAddress, userAgent) {
  const params = { address: walletAddress.toLowerCase() };

  let uniqueAddresses = new Set();

  let page = 1;
  while (true) {
    try {
      const result = await makeApiCall(
        ACTION_TRANSACTIONS,
        { ...params, page },
        userAgent
      );

      if (result.length === 0) {
        break;
      }

      result.forEach((tx) => {
        const toAddress = tx.to.toLowerCase();
        const fromAddress = tx.from.toLowerCase();

        if (toAddress !== params.address) {
          uniqueAddresses.add(toAddress);
        }

        if (fromAddress !== params.address) {
          uniqueAddresses.add(fromAddress);
        }
      });

      page++;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  return uniqueAddresses;
}

async function getLastInteractionDateTime(walletAddress, userAgent) {
  const params = { address: walletAddress };
  let lastInteractionDateTime = null;

  let page = 1;
  while (true) {
    try {
      const result = await makeApiCall(
        ACTION_TRANSACTIONS,
        { ...params, page },
        userAgent
      );

      if (result.length === 0) {
        break;
      }

      result.forEach((tx) => {
        const timestamp = parseInt(tx.timeStamp, 10) * 1000;
        if (!lastInteractionDateTime || timestamp > lastInteractionDateTime) {
          lastInteractionDateTime = timestamp;
        }
      });

      page++;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  if (lastInteractionDateTime) {
    return lastInteractionDateTime;
  } else {
    return null;
  }
}

module.exports = {
  getWalletBalance,
  getWalletTransactions,
  getUniqueAddresses,
  getLastInteractionDateTime,
};
