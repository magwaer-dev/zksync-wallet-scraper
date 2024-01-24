const { walletAddress } = require("../constants.js");
const { getTransactions } = require("./totalTxCount.js");

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

module.exports = {
  getUniqueAddresses,
};
