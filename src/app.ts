import { App } from '@slack/bolt'
import dotenv from 'dotenv'
import { handleRequestModalSubmission } from './handlers/request/handleRequestModalSubmission'
import {
  showRequestModal,
  updateRequestModal,
} from './handlers/request/showRequestModal'
import { showSubmitModal } from './handlers/submit/showSubmitModal'
import { handleSubmitModalSubmission } from './handlers/submit/handleSubmitModalSubmission'
dotenv.config()

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
})

/** REQUESTS */

// Show the modal
app.command('/request', showRequestModal)

// Handle the submission
app.view('request_view', handleRequestModalSubmission)

// Handle "other" in dropdown (add a new input)
app.action('venue_input', updateRequestModal)

/** SUBMISSIONS */

// Show the modal
app.command('/submit', showSubmitModal)

// Handle the submission
app.view('submit_view', handleSubmitModalSubmission)

// Remind people to use commands
app.message(async ({ message, client }) => {
  if (message.subtype) return
  if (message.channel === process.env.REQUESTS_CHANNEL_ID) {
    await client.chat.postEphemeral({
      channel: message.channel,
      user: message.user,
      text: 'Please use the `/request` command to submit a request!',
    })
  } else if (message.channel === process.env.SUBMIT_CHANNEL_ID) {
    await client.chat.postEphemeral({
      channel: message.channel,
      user: message.user,
      text: 'Please use the `/submit` command to submit your photos!',
    })
  }
})

// Start the app
app.start(process.env.PORT || 3000)
