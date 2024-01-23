const { walletAddress } = require("../constants.js");
const { getUniqueAddresses } = require("./totalUniqueAddressesCount.js");
const { getTransactions } = require("./totalTxCount.js");
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

module.exports = {
  uniqueAddressesTimestamp,
  findLastTransactionTimestamp,
  lastTxTimestamp,
};
