const {
  CONTRACT_TYPE_UNKNOWN,
  CONTRACT_TYPE_WALLET,
  CONTRACT_TYPE_CONTRACT,
  contractApiEndpoint,
  getContractCreationApiEndpoint,
} = require("../constants.js");

const { buildApiUrl, giveParams } = require("../helper-functions.js");
const { makeApiRequest } = require("../api-utils.js");

async function getWalletType(address) {
  const contractInfo = await getContractInfo(address);

  if (contractInfo.ContractName === "") {
    const isContractCreation = await checkContractCreation(address);
    return isContractCreation ? CONTRACT_TYPE_CONTRACT : CONTRACT_TYPE_WALLET;
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
  getWalletType,
  getContractInfo,
  checkContractCreation,
};
