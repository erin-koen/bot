import { ethers } from 'ethers';
import { loadEnv } from './loadEnv';

const providerEndpoint = loadEnv('ETHEREUM_NODE_ENDPOINT');
const provider = new ethers.providers.JsonRpcProvider(providerEndpoint);
const FormatTypes = ethers.utils.FormatTypes;

export function getTokenAbi(contractAddress: string): string {
  const contract = new ethers.Contract(contractAddress, [], provider);
  const contractABI = contract.interface.format(FormatTypes.JSON) as string;
  return JSON.parse(contractABI);
}
