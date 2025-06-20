import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, createPostResponse } from "@solana/actions";
import * as anchor from '@coral-xyz/anchor';
import { Voting } from '@/../anchor/target/types/voting';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

import idl from '@/../anchor/target/idl/voting.json';

export const OPTIONS = GET;

export async function GET(request: Request) {
  const response:ActionGetResponse = {
    icon: 'https://hips.hearstapps.com/hmg-prod/images/peanut-butter-vegan-1556206811.jpg?crop=0.6666666666666666xw:1xh;center,top&resize=1200:*',
    title: 'Vote for Peanut Butter',
    description: 'Vote for your favorite peanut butter!',
    label: 'Vote Now!',
    links: {
      actions: [
        {
            href: 'http://localhost:3000/api/vote?candidate=Crunchy',
            label: 'Vote Crunchy',
            type: "transaction"
        },
        {
            href: 'http://localhost:3000/api/vote?candidate=Smooth',
            label: 'Vote Smooth',
            type: "transaction"
        }  
      ],
    },
  };
  return Response.json(response,{headers: ACTIONS_CORS_HEADERS});
}

export async function POST(request: Request) {
  /*
  const keypair = Keypair.generate();
  const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
  */
  const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
  const program: anchor.Program<Voting> = new anchor.Program(idl as Voting, {connection});

  const url = new URL(request.url);
  const vote = url.searchParams.get('candidate') as string;

  if (vote !== 'Crunchy' && vote !== 'Smooth') {
    return Response.json({error: 'You voted for the wrong candidate'}, {status: 400, headers: ACTIONS_CORS_HEADERS});
  }

  const body: ActionPostRequest = await request.json();
  let voter: PublicKey;
    try {
      voter = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

  const instruction = await program.methods.vote(
    new anchor.BN(1),
    "Devika",
  ).accounts(
    { 
      signer: voter,
    } 
  ).instruction();
  const blockhashResponse = await connection.getLatestBlockhash();

  const tx = new Transaction({
    feePayer: voter,
    blockhash: blockhashResponse.blockhash,
    lastValidBlockHeight: blockhashResponse.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: tx,
    },
  });

  return Response.json(response,{headers: ACTIONS_CORS_HEADERS});
}