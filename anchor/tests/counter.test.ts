import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import {Voting} from '../target/types/voting'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { before, it } from 'node:test';

const IDL = require('../target/idl/voting.json')

// const votingAddress = new PublicKey("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");
const votingAddress = new PublicKey("BMudB4uwagAwGhXQiWaQSmokMdNNvgea5Uz2bKutpkBt");  // for local testing

// @ts-ignore
describe('Voting', () => {

  let provider;
  let context;
  // let votingProgram: anchor.Program<Voting>;

  anchor.setProvider(anchor.AnchorProvider.env());
  let votingProgram = anchor.workspace.Voting as Program<Voting>;

  // before(async () => {
  //   // context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);

	//   // provider = new BankrunProvider(context);

  //   // votingProgram = new Program<Voting>( 
  //   //   IDL,
  //   //   provider,
	//   // );
  // })


  it('Initialize Poll', async () => {
  await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1750354539 + 86400), 
        "Test Poll",
        "This is a test poll",
      ).rpc();

      const [pollAddress] = await PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
        votingAddress
      )

      const poll = await votingProgram.account.poll.fetch(pollAddress)

      // @ts-ignore
      expect(poll.pollId.toNumber()).toEqual(1);
      // @ts-ignore
      expect(poll.title).toEqual("Test Poll");
      // @ts-ignore
      expect(poll.description).toEqual("This is a test poll");
      // @ts-ignore
      expect(poll.pollStart.toNumber()).toEqual(0);
      // @ts-ignore
      expect(poll.pollEnd.toNumber()).toEqual(1750354539 + 86400);
      // @ts-ignore
      expect(poll.candidateAmounts.toNumber()).toEqual(0);
    })

    it('Initialize Candidate', async () => {
      await votingProgram.methods.initializeCandidate(
        new anchor.BN(1),
        "Shradhesh"
      ).rpc();
      await votingProgram.methods.initializeCandidate(
        new anchor.BN(1),
        "Devika"
      ).rpc();

      const [devikaAddress] = await PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Devika")],
        votingAddress
      );

      const devika = await votingProgram.account.candidate.fetch(devikaAddress);
      // @ts-ignore
      expect(devika.candidateName).toEqual("Devika");
      // @ts-ignore
      expect(devika.candidateVotes.toNumber()).toEqual(0);
    })

    it('vote', async () => {
      await votingProgram.methods.vote(
        new anchor.BN(1),
        "Devika"
      ).rpc();

      const [devikaAddress] = await PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Devika")],
        votingAddress
      );

      const devika = await votingProgram.account.candidate.fetch(devikaAddress);
      // @ts-ignore
      expect(devika.candidateVotes.toNumber()).toEqual(1);
    })
})  
