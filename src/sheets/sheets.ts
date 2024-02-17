import { google } from 'googleapis'
import { PhotoRequest, PhotoSubmission } from '../types/PhotoRequest'

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const client = google.sheets({ version: 'v4', auth })

const sortSheet = async () => {
  try {
    await client.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: 0,
                startRowIndex: 2,
              },
              sortSpecs: [
                {
                  dimensionIndex: 0,
                  sortOrder: 'ASCENDING',
                },
              ],
            },
          },
        ],
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export const appendPhotoRequest = async (row: PhotoRequest) => {
  try {
    await client.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'raw',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            row.uuid,
            row.date,
            row.artist,
            row.venue,
            row.location,
            row.photographer,
            row.slackID,
            row.notes,
            row.plusOne,
            row.portraits,
            row.assigned,
            row.status,
            row.submissionLink,
            row.submissionBlurb,
            row.submissionNotes,
            row.webLink,
            row.sentToPR,
          ],
        ],
      },
    })
    await sortSheet()
  } catch (error) {
    console.error(error)
  }
}

export const getRequestsForUser = async (slackID: string) => {
  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'raw',
    })

    const rows = response.data.values || []

    const requests: PhotoRequest[] = []

    for (const row of rows) {
      if (row[6] === slackID && !row[12]) {
        requests.push({
          uuid: row[0],
          date: row[1],
          artist: row[2],
          venue: row[3],
          location: row[4],
          photographer: row[5],
          slackID: row[6],
          notes: row[7],
          plusOne: row[8] === 'TRUE',
          portraits: row[9] === 'TRUE',
          assigned: row[10] === 'TRUE',
          status: row[11],
          submissionLink: row[12],
          submissionBlurb: row[13],
          submissionNotes: row[14],
          webLink: row[15],
          sentToPR: row[16] === 'TRUE',
        })
      }
    }

    return requests
  } catch (error) {
    console.error(error)
    return []
  }
}

export const handleSubmission = async (submission: PhotoSubmission) => {
  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'raw',
    })

    const rows = response.data.values || []

    for (const row of rows) {
      if (row[0] === submission.requestID) {
        row[12] = submission.link
        row[13] = submission.blurb
        row[14] = submission.notes

        await client.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `raw!M${rows.indexOf(row) + 1}:O${rows.indexOf(row) + 1}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [row.slice(12, 15)],
          },
        })
      }
    }
  } catch (error) {
    console.error(error)
  }
}
