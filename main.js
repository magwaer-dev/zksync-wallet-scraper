const gotScraping = require("got-scraping");

const { walletBalance } = require("./scripts/wallet-stats/walletBalance.js");
const { getTransactions } = require("./scripts/wallet-stats/totalTxCount.js");

const {
  getUniqueAddresses,
} = require("./scripts/wallet-stats/totalUniqueAddressesCount.js");
const {
  uniqueAddressesTimestamp,
  lastTxTimestamp,
} = require("./scripts/wallet-stats/transactionsTimestamp.js");
const { getWalletType } = require("./scripts/wallet-stats/walletType.js");
const { getContractName } = require("./scripts/wallet-stats/contractName.js");

const { walletAddress, CONTRACT_TYPE_WALLET } = require("./scripts/constants.js");

async function main() {
  try {
    const balanceInEth = await walletBalance(walletAddress);

    const transactionCount = await getTransactions(walletAddress);

    const uniqueAddresses = await getUniqueAddresses();

    const AddressesWithTimestamp = await uniqueAddressesTimestamp();

    const interactions = [];

    for (const [address, lastTxAt] of AddressesWithTimestamp) {
      const type = await getWalletType(address);
      const contractName =
        type !== CONTRACT_TYPE_WALLET ? await getContractName(address) : null;

      const interaction = {
        address: address,
        lastTxAt: lastTxAt,
        type: type,
        contractName: contractName,
      };

      if (type === CONTRACT_TYPE_WALLET) {
        delete interaction.contractName;
      }

      interactions.push(interaction);
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
