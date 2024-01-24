const { baseApiUrl } = require("./constants");


function buildApiUrl(apiEndpoint, params) {
  return `${baseApiUrl}?${apiEndpoint}&${new URLSearchParams(params)}`;
}

function weiToEth(wei) {
  return wei / 1e18;
}

function giveParams(addressUrl, address, page = null, pageSize = null) {
  let params = { [addressUrl]: address };

  if (page != null) {
    params.page = page;
  }

  if (pageSize != null) {
    params.pageSize = pageSize;
  }

  return params;
}

module.exports = { buildApiUrl, weiToEth, giveParams };
