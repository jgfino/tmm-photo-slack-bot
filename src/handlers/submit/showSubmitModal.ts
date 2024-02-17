import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt'
import { modal, simpleInput, dropdownInput } from '../../utils/modalUtils'
import { getRequestsForUser } from '../../sheets/sheets'

export const showSubmitModal: Middleware<SlackCommandMiddlewareArgs> = async (
  props,
) => {
  const { ack, body, client } = props
  await ack()

  const shows = await getRequestsForUser(body.user_id)

  if (shows.length === 0) {
    try {
      await client.chat.postEphemeral({
        channel: process.env.SUBMIT_CHANNEL_ID!,
        user: body.user_id,
        text: 'You have no shows to submit photos for.',
      })
    } catch (error) {
      console.error(error)
    }
    return
  }

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: modal({
        title: 'Submit Your Photos!',
        callback_id: 'submit_view',
        blocks: [
          dropdownInput({
            title: 'Show',
            options: shows.map((show) => ({
              text: `${show.date}: ${show.artist} @ ${show.venue}`,
              value: show.uuid,
            })),
            placeholder: 'Select Show',
            block_id: 'input_show',
            action_id: 'show_input',
          }),
          simpleInput({
            title: 'Google Drive Link',
            placeholder:
              'e.g. https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j',
            block_id: 'input_link',
            action_id: 'link_input',
          }),
          simpleInput({
            title: 'Website Blurb',
            placeholder: '2-3 sentences about the show',
            block_id: 'input_blurb',
            action_id: 'blurb_input',
            multiline: true,
          }),
          simpleInput({
            title: 'Notes',
            placeholder: 'Anything else we should know?',
            block_id: 'input_notes',
            action_id: 'notes_input',
            multiline: true,
            optional: true,
          }),
        ],
      }),
    })
  } catch (error) {
    console.error(error)
  }
}
