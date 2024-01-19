const gotScraping = require("got-scraping");

const baseApiUrl = "https://block-explorer-api.mainnet.zksync.io/api";

const walletAddress = "0x4F471D378B84422A971846e85bE3792b7f0f63EA";

const txListApiEndpoint = "module=account&action=txlist";
const balanceApiEndpoint = "module=account&action=balance";
const contractApiEndpoint = "module=contract&action=getsourcecode";

function weiToEth(wei) {
  return wei / 1e18;
}

function buildApiUrl(apiEndpoint, params) {
  return `${baseApiUrl}?${apiEndpoint}&${new URLSearchParams(params)}`;
}

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

async function walletBalance(apiEndpoint, params = {}) {
  try {
    const apiUrl = buildApiUrl(apiEndpoint, params);
    const dataInWei = await makeApiRequest(apiUrl);

    if (dataInWei !== null) {
      const dataInEth = weiToEth(dataInWei);
      return dataInEth;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error in balance function:", error.message);
    return null;
  }
}

async function getTransactions(walletAddress) {
  const pageSize = 10; // Number of transactions per page
  let page = 1;
  let allTransactions = [];

  try {
    while (true) {
      const txListParams = { address: walletAddress, page, offset: pageSize };
      const apiUrl = buildApiUrl(txListApiEndpoint, txListParams);
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

async function getUniqueAddresses() {
  const transactions = await getTransactions(walletAddress);

  if (transactions !== null) {
    let uniqueAddresses = new Set();

    transactions.forEach((transaction) => {
      uniqueAddresses.add(transaction.to);
      uniqueAddresses.add(transaction.from);
    });
    uniqueAddresses = new Set(
      [...uniqueAddresses].filter((address) => address !== walletAddress)
    );

    return uniqueAddresses;
  }
}

async function timestampForLastTransaction(walletAddress) {
  try {
    const transactions = await getTransactions(walletAddress);

    if (transactions && transactions.length > 0) {
      const sortedTransactions = transactions.sort(
        (a, b) => b.blockNumber - a.blockNumber
      );

      const lastTransactionTimestamp = sortedTransactions[0].timeStamp;

      return lastTransactionTimestamp;
    } else {
      console.error("No transactions found for the address.");
      return null;
    }
  } catch (error) {
    console.error(
      "Error in timestampForLastTransaction function:",
      error.message
    );
    return null;
  }
}

async function main() {
  try {
    const balanceParams = { address: walletAddress };
    const balanceInEth = await walletBalance(balanceApiEndpoint, balanceParams);

    const transactionCount = await getTransactions(walletAddress);

    const uniqueAddresses = await getUniqueAddresses();

    const timestamp = await timestampForLastTransaction(walletAddress);

    const walletStats = {
      walletAddress: walletAddress,
      walletBalance: balanceInEth,
      transactionCount: transactionCount.length,
      uniqueAddressesCount: [...uniqueAddresses].length,
      uniqueAddresses: uniqueAddresses,
      timestamp: timestamp,
    };
    console.log("Wallet Stats:", walletStats);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
