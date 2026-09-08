import { Container, CosmosClient } from '@azure/cosmos'

const DATABASE_ID = 'holidaycalendar'

let client: CosmosClient | undefined
let groups: Container | undefined
let holidays: Container | undefined

function getClient(): CosmosClient {
  if (!client) {
    const connectionString = process.env.COSMOS_CONNECTION_STRING
    if (!connectionString) {
      throw new Error('COSMOS_CONNECTION_STRING is not set')
    }
    client = new CosmosClient(connectionString)
  }
  return client
}

export function getGroupsContainer(): Container {
  if (!groups) {
    groups = getClient().database(DATABASE_ID).container('groups')
  }
  return groups
}

export function getHolidaysContainer(): Container {
  if (!holidays) {
    holidays = getClient().database(DATABASE_ID).container('holidays')
  }
  return holidays
}
