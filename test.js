//1
const params = { address: walletAddress, page, offset: pageSize };
const apiUrl = buildApiUrl(txListApiEndpoint, params);
const response = await makeApiRequest(apiUrl);

//2
const getContractCreationParams = { contractaddresses: address };
const contractSourceCodeParams = { address: address };
const apiUrl2 = buildApiUrl(contractApiEndpoint, contractSourceCodeParams);
const response2 = await makeApiRequest(apiUrl);
const creationResponse = await makeApiRequest(creationApiUrl);

function buildAndMakeApiRequest(params, apiUrl, response) {
  params = giveParams("");
}



function giveParams(addressUrl, address, page = null, pagesize = null) {
  let params = { [addressUrl]: address };

  if (page != null) {
    params.page = page;
  }

  if (pagesize != null) {
    params.pageSize = pageSize;
  }

  return params;
}


async function getContractInfo(){

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
  