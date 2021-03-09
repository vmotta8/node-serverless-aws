import AWS from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware'
import createError from 'http-errors'

const dynamodb = new AWS.DynamoDB.DocumentClient()

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters 
  let auctions

  const params = { 
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  }

  try {
    const result = await dynamodb.query(params).promise()

    auctions = result.Items
  } catch (err) {
    console.log(err)
    throw new createError.InternalServerError(err)
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ auctions }),
  };
}

export const handler = commonMiddleware(getAuctions)
