module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "4",
      from: "0x42a4b80feD9521D85aaECAdF2a378C55c1321342",
      gas: 4600000
    }
  }
};
