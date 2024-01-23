const gotScraping = require("got-scraping");

const { buildApiUrl, weiToEth, giveParams } = require("./helperFunctions");

const {
  walletAddress,
  CONTRACT_TYPE_UNKNOWN,
  CONTRACT_TYPE_WALLET,
  CONTRACT_TYPE_CONTRACT,
  txListApiEndpoint,
  balanceApiEndpoint,
  contractApiEndpoint,
  getContractCreationApiEndpoint,
} = require("./constants.js");

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

async function getUniqueAddresses() {
  const transactions = await getTransactions(walletAddress);

  if (transactions !== null) {
    let uniqueAddresses = new Set();

    transactions.forEach((transaction) => {
      uniqueAddresses.add(transaction.to);
      uniqueAddresses.add(transaction.from);
    });

    uniqueAddresses.delete(walletAddress);

    return uniqueAddresses;
  }
}

async function uniqueAddressesTimestamp() {
  try {
    const uniqueAddresses = await getUniqueAddresses();
    const transactions = await getTransactions(walletAddress);

    let timestampAddress = new Map();

    for (const address of uniqueAddresses) {
      const timeStamp = findLastTransactionTimestamp(address, transactions);
      timestampAddress.set(address, timeStamp);
    }

    return timestampAddress;
  } catch (error) {
    console.error("Error in uniqueAddressesTimestamp function:", error.message);
    return null;
  }
}

function findLastTransactionTimestamp(address, transactions) {
  const transactionsForAddress = transactions.filter(
    (transaction) => transaction.to === address || transaction.from === address
  );

  if (transactionsForAddress.length > 0) {
    const sortedTransactions = transactionsForAddress.sort(
      (a, b) => b.timeStamp - a.timeStamp
    );

    return new Date(sortedTransactions[0].timeStamp * 1000); // Convert to Date type
  } else {
    return null;
  }
}

async function lastTxTimestamp(walletAddress) {
  try {
    const transactions = await getTransactions(walletAddress);

    if (transactions && transactions.length > 0) {
      const sortedTransactions = transactions.sort(
        (a, b) => b.blockNumber - a.blockNumber
      );

      const lastTransactionTimestamp = new Date(
        sortedTransactions[0].timeStamp * 1000
      ); // Convert to Date type

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

async function getWalletType(address) {
  const contractInfo = await getContractInfo(address);

  if (contractInfo.ContractName === "") {
    const isContractCreation = await checkContractCreation(address);
    return isContractCreation ? CONTRACT_TYPE_UNKNOWN : CONTRACT_TYPE_WALLET;
  } else {
    return CONTRACT_TYPE_CONTRACT;
  }
}

async function getContractInfo(address) {
  const contractSourceCodeParams = giveParams("address", address);
  const apiUrl = buildApiUrl(contractApiEndpoint, contractSourceCodeParams);
  const response = await makeApiRequest(apiUrl);

  if (response.length > 0) {
    return response[0];
  }

  return null;
}

async function checkContractCreation(address) {
  const getContractCreationParams = giveParams("contractaddresses", address);
  const creationApiUrl = buildApiUrl(
    getContractCreationApiEndpoint,
    getContractCreationParams
  );
  const creationResponse = await makeApiRequest(creationApiUrl);

  return creationResponse !== null;
}

module.exports = {
  makeApiRequest,
  walletBalance,
  getTransactions,
  getUniqueAddresses,
  uniqueAddressesTimestamp,
  findLastTransactionTimestamp,
  lastTxTimestamp,
  getWalletType,
  getContractInfo,
  checkContractCreation,
};
