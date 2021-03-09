import { getEndedAuction } from '../lib/getEndedAuctions'

async function processAuctions(event, context) {
  const auctionsToClose = await getEndedAuction()
  console.log(auctionsToClose)
}

export const handler = processAuctions