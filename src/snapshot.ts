import { ethers } from 'ethers';
import { getRevertError } from './utils/getRevertError';
import { getTokenAbi } from './utils/getTokenABI';
import { loadEnv } from './utils/loadEnv';
import { gql } from './utils/subgraph/sdk';
import { getProvider } from './utils/getProvider';

const tokenAddrress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const abi = getTokenAbi(tokenAddrress);
const provider = getProvider('ETHEREUM');

interface UniContract extends ethers.Contract {
  getPriorVotes(address: string, block: string): Promise<number>;
}

async function run() {
  try {
    // get  block numbers and addresses [ {author: string, snapshot: string } ]
    const snapshotQuery = gql(loadEnv('ETHEREUM_SUBGRAPH_ENDPOINT'));
    const snapshotData = await snapshotQuery.Spaces();
    const proposerData = snapshotData.proposals;
    const totalProposers = proposerData?.length
    // if for some reason the transaction is returned as undefined, return
    if (proposerData?.length && totalProposers) {
      const token = new ethers.Contract(tokenAddrress, abi, provider) as UniContract;
      const votingPower = await Promise.all(
        proposerData.map(async (obj) => {
          if (obj?.snapshot) {
            const result = await token.getPriorVotes(obj.author, obj.snapshot);
            return result;
          }
        })
      )\;
      const totalVotes = votingPower.reduce((curr, carry) => {
        if (curr && carry) {
          return curr + carry
      }}, 0)
      return totalVotes && totalVotes / totalProposers
    }

    // verifies you can send the tx - throws an exception if it doesn't validate
   
  } catch (error: any) {
    console.error('THE BOT FAILED :*(. Error below: ');

    if (error.error?.data) {
      console.log(getRevertError(error.error.data));
      return;
    }

    if (error.error?.message) {
      console.log(error.error.message);
      return;
    }

    console.log(error);
  
  }
}

(async function main() {
  console.log('STARTING IT UP');
  run();
})();
