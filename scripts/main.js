const gotScraping = require("got-scraping");

const {
  walletBalance,
  getTransactions,
  getUniqueAddresses,
  uniqueAddressesTimestamp,
  lastTxTimestamp,
  getWalletType,
} = require("./apiUtils.js");

const { walletAddress } = require("./constants.js");

async function main() {
  try {
    const balanceInEth = await walletBalance(walletAddress);

    const transactionCount = await getTransactions(walletAddress);

    const uniqueAddresses = await getUniqueAddresses();

    const AddressesWithTimestamp = await uniqueAddressesTimestamp();

    const interactions = [];

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
