const {
  getWalletBalance,
  getWalletTransactions,
  getUniqueAddresses,
  getLastInteractionDateTime,
} = require("./api");

const walletAddress = "0x4F471D378B84422A971846e85bE3792b7f0f63EA";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";

async function main() {
  try {
    const balanceInWei = await getWalletBalance(walletAddress, USER_AGENT);
    const balanceInETH = balanceInWei / 1e18;

    const transactions = await getWalletTransactions(walletAddress, USER_AGENT);

    const uniqueAddresses = await getUniqueAddresses(walletAddress, USER_AGENT);

    const lastInteractionDateTime = await getLastInteractionDateTime(
      walletAddress,
      USER_AGENT
    );

    const walletStats = {
      walletBalance: balanceInETH,
      transactionCount: transactions.length,
      uniqueAddressesCount: uniqueAddresses.size, // Use size to get the number of unique addresses
      uniqueAddresses: Array.from(uniqueAddresses), // Convert set to array if needed
      lastInteractionDateTime,
    };

    console.log("Wallet Stats:", walletStats);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
