import AWS from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware'
import createError from 'http-errors'

const dynamodb = new AWS.DynamoDB.DocumentClient()

async function getAuction(event, context) {
  let auction
  const { id } = event.pathParameters

  try {
    const result = await dynamodb.get({ 
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id }
    }).promise()

    auction = result.Item
  } catch (err) {
    console.log(err)
    throw new createError.InternalServerError(err)
  }

  if(!auction) {
    throw new createError.NotFound(`Auction with id "${id}" not found.`)
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ auction }),
  };
}

export const handler = commonMiddleware(getAuction)
