import { Middleware, SlackViewMiddlewareArgs } from '@slack/bolt'
import { appendPhotoRequest } from '../../sheets/sheets'
import { PhotoRequest } from '../../types/PhotoRequest'
import venues from '../../../venues.json'
import { randomUUID } from 'crypto'

export const handleRequestModalSubmission: Middleware<
  SlackViewMiddlewareArgs
> = async ({ client, ack, body }) => {
  const values = body.view.state.values

  const user = await client.users.info({
    user: body.user.id,
  })

  let venue = values.input_venue.venue_input.selected_option!.value

  if (venue === 'Other') {
    venue = values.input_venue_other.venue_input_other.value || 'Unknown'
  }

  let location = values.input_location?.location_input?.value

  if (!location) {
    location = venues.find((v) => v.name === venue)?.location || 'Unknown'
  }

  const request: PhotoRequest = {
    uuid: randomUUID(),
    date: values.input_date.date_input.selected_date!,
    artist: values.input_artist.artist_input.value!,
    venue,
    location,
    photographer: user.user?.real_name ?? user.user?.name ?? body.user.name,
    slackID: body.user.id,
    notes: values.input_notes.notes_input.value || '',
    plusOne:
      (values.input_plus_one.plus_one_input.selected_options ?? []).length > 0,
    portraits:
      (values.input_portraits.portraits_input.selected_options ?? []).length >
      0,
    assigned: false,
    status: '',
    submissionLink: '',
    submissionBlurb: '',
    submissionNotes: '',
    webLink: '',
    sentToPR: false,
  }

  // Add the request to the sheet
  await appendPhotoRequest(request)

  try {
    await ack()

    // Notify the requests channel
    client.chat.postMessage({
      channel: process.env.REQUESTS_CHANNEL_ID!,
      text: 'New Photo Request',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<@${body.user.id}> requested a show!`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text:
                `>:microphone: *Artist*: ${request.artist}\n>:round_pushpin: *Venue*: ${request.venue} (${location})\n>:calendar: *Date*: ${request.date}\n` +
                `>:admission_tickets: *+1*: ${
                  request.plusOne ? 'Yes' : 'No'
                }\n>:camera: *Portraits*: ${request.portraits ? 'Yes' : 'No'}` +
                (request.notes ? `\n>:memo: *Notes*: ${request.notes}` : ''),
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Assign',
              },
              style: 'primary',
              value: JSON.stringify(request),
              action_id: 'assign_request',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Deny',
              },
              style: 'danger',
              value: JSON.stringify(request),
              action_id: 'deny_request',
            },
          ],
        },
      ],
    })
  } catch (error) {
    console.error(error)
  }
}
