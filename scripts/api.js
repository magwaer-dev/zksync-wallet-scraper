const gotScraping = require("got-scraping");

const baseApiUrl = "https://block-explorer-api.mainnet.zksync.io/api";

const walletAddress = "0x4F471D378B84422A971846e85bE3792b7f0f63EA";

const CONTRACT_TYPE_UNKNOWN = "unknown contract";
const CONTRACT_TYPE_WALLET = "wallet";
const CONTRACT_TYPE_CONTRACT = "contract";

const txListApiEndpoint = "module=account&action=txlist";
const balanceApiEndpoint = "module=account&action=balance";
const contractApiEndpoint = "module=contract&action=getsourcecode";
const getContractCreationApiEndpoint =
  "module=contract&action=getcontractcreation"; //if it is this api, params is contractaddresses

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

// Function to find the last transaction timestamp for a specific address
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
  const getContractCreationParams = { contractaddresses: address };
  const contractSourceCodeParams = { address: address };
  const apiUrl = buildApiUrl(contractApiEndpoint, contractSourceCodeParams);

  const response = await makeApiRequest(apiUrl);
  for (const contractInfo of response) {
    if (contractInfo.ContractName == "") {
      const creationApiUrl = buildApiUrl(
        getContractCreationApiEndpoint,
        getContractCreationParams
      );
      const creationResponse = await makeApiRequest(creationApiUrl);
      if (creationResponse !== null) {
        return CONTRACT_TYPE_UNKNOWN;
      } else {
        return CONTRACT_TYPE_WALLET;
      }
    } else {
      return CONTRACT_TYPE_CONTRACT;
    }
  }
  return null;
}

async function main() {
  try {
    const balanceParams = { address: walletAddress };
    const balanceInEth = await walletBalance(balanceApiEndpoint, balanceParams);

    const transactionCount = await getTransactions(walletAddress);

    const uniqueAddresses = await getUniqueAddresses();

    const AddressesWithTimestamp = await uniqueAddressesTimestamp();

    const interactions = [];

    // Populate interactions array with sorted unique addresses and their timestamps
    for (const [address, lastTxAt] of AddressesWithTimestamp) {
      const type = await getWalletType(address);
      interactions.push({
        address: address,
        lastTxAt: lastTxAt,
        type: type,
        // contractName: contractName,
      });
    }

    const lastTimestamp = await lastTxTimestamp(walletAddress);

    const walletStats = {
      walletAddress: walletAddress,
      walletBalance: balanceInEth,
      totalTxCount: transactionCount.length,
      totalUniqueAddressesCount: uniqueAddresses.size,
      interactions: interactions,
      lastTxAt: lastTimestamp,
    };

    console.log("Wallet Stats:", walletStats);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
