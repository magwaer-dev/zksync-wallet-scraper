const baseApiUrl = "https://block-explorer-api.mainnet.zksync.io/api";

const walletAddress = "0x4F471D378B84422A971846e85bE3792b7f0f63EA";

const CONTRACT_TYPE_UNKNOWN = "unknown contract";
const CONTRACT_TYPE_WALLET = "wallet";
const CONTRACT_TYPE_CONTRACT = "contract";

const txListApiEndpoint = "module=account&action=txlist";
const balanceApiEndpoint = "module=account&action=balance";
const contractApiEndpoint = "module=contract&action=getsourcecode";
const getContractCreationApiEndpoint =
  "module=contract&action=getcontractcreation";

module.exports = {
  baseApiUrl,
  walletAddress,
  CONTRACT_TYPE_UNKNOWN,
  CONTRACT_TYPE_WALLET,
  CONTRACT_TYPE_CONTRACT,
  txListApiEndpoint,
  balanceApiEndpoint,
  contractApiEndpoint,
  getContractCreationApiEndpoint,
};
