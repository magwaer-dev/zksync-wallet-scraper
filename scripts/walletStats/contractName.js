const {
  contractApiEndpoint,
  CONTRACT_TYPE_UNKNOWN,
} = require("../constants.js");

const { buildApiUrl, giveParams } = require("../helperFunctions.js");
const { makeApiRequest } = require("../apiUtils.js");

async function getContractName(address) {
  const contractSourceCodeParams = giveParams("address", address);
  const apiUrl = buildApiUrl(contractApiEndpoint, contractSourceCodeParams);
  const response = await makeApiRequest(apiUrl);
  if (response.length > 0) {
    const contractNames = response.map((contract) => contract.ContractName);
    const lastWords = contractNames.map((contractName) =>
      extractLastWord(contractName)
    );
    const concatenatedLastWords = lastWords.join(" ");
    return concatenatedLastWords || CONTRACT_TYPE_UNKNOWN;
  }
  return CONTRACT_TYPE_UNKNOWN;
}

function extractLastWord(str) {
  const words = str.split(":"); // Split the string into an array of words
  return words[words.length - 1];
}

module.exports = { getContractName };
