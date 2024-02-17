import { Middleware, SlackViewMiddlewareArgs } from '@slack/bolt'
import { handleSubmission } from '../../sheets/sheets'
import { PhotoSubmission } from '../../types/PhotoRequest'

export const handleSubmitModalSubmission: Middleware<
  SlackViewMiddlewareArgs
> = async ({ client, ack, body }) => {
  const values = body.view.state.values

  const submission: PhotoSubmission = {
    requestID: values.input_show.show_input.selected_option!.value!,
    displayName: values.input_show.show_input.selected_option!.text.text,
    link: values.input_link.link_input.value!,
    blurb: values.input_blurb.blurb_input.value!,
    notes: values.input_notes.notes_input.value || '',
  }

  // Update the request in the sheet
  await handleSubmission(submission)

  try {
    await ack()

    // Notify the submission channel
    client.chat.postMessage({
      channel: process.env.SUBMIT_CHANNEL_ID!,
      text: 'Photos Submitted',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<@${body.user.id}> submitted photos for ${submission.displayName}!`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `>*Link:* ${submission.link}`,
            },
          ],
        },
      ],
    })
  } catch (error) {
    console.error(error)
  }
}
