import AWS from 'aws-sdk'
import { getAuctionById } from './getAuction'
import commonMiddleware from '../lib/commonMiddleware'
import createError from 'http-errors'

const dynamodb = new AWS.DynamoDB.DocumentClient()

async function placeBid(event, context) {
  const { id } = event.pathParameters
  const { amount } = event.body

  const auction = await getAuctionById(id)

  if (auction.status != 'OPEN') {
    throw new createError.Forbidden('You cannot bid on closed auctions.')
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}.`)
  }

  const params = { 
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount
    },
    ReturnValues: 'ALL_NEW'
  }

  let updatedAuction

  try {
    const result = await dynamodb.update(params).promise()
    updatedAuction = result.Attributes
  } catch (err) {
    console.log(err)
    throw new createError.InternalServerError(err)
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ updatedAuction }),
  };
}

export const handler = commonMiddleware(placeBid)
