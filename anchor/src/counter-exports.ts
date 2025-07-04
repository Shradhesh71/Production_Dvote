// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VotingIDL from '../target/idl/voting.json'
import type { Voting } from '../target/types/voting'

// Re-export the generated IDL and type
export { Voting, VotingIDL }

// The programId is imported from the program IDL.
export const VOTING_PROGRAM_ID = new PublicKey(VotingIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getVotingProgram(provider: AnchorProvider, address?: PublicKey): Program<Voting> {
  return new Program({ ...VotingIDL, address: address ? address.toBase58() : VotingIDL.address } as Voting, provider)
}


export function getVotingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return VOTING_PROGRAM_ID
  }
}
