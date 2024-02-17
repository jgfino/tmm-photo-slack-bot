import {
  Middleware,
  SlackCommandMiddlewareArgs,
  SlackActionMiddlewareArgs,
  StaticSelectAction,
} from '@slack/bolt'
import {
  modal,
  simpleInput,
  dropdownInput,
  dateInput,
  checkboxInput,
} from '../../utils/modalUtils'
import venues from '../../../venues.json'

const blocks = [
  simpleInput({
    title: 'Headlining Artist',
    placeholder: 'e.g. Taylor Swift',
    block_id: 'input_artist',
    action_id: 'artist_input',
  }),
  dropdownInput({
    title: 'Venue',
    options: venues.map((venue) => ({
      text: venue.name,
      value: venue.name,
    })),
    placeholder: 'Select Venue',
    block_id: 'input_venue',
    action_id: 'venue_input',
  }),
  dateInput({
    title: 'Date',
    block_id: 'input_date',
    action_id: 'date_input',
  }),
  checkboxInput({
    title: 'Plus One?',
    block_id: 'input_plus_one',
    action_id: 'plus_one_input',
    optional: true,
  }),
  checkboxInput({
    title: 'Portraits?',
    block_id: 'input_portraits',
    action_id: 'portraits_input',
    optional: true,
  }),
  simpleInput({
    title: 'Notes',
    placeholder: 'Anything else we should know?',
    block_id: 'input_notes',
    action_id: 'notes_input',
    multiline: true,
    optional: true,
  }),
]

export const updateRequestModal: Middleware<SlackActionMiddlewareArgs> = async (
  props,
) => {
  const { ack, body, client } = props
  await ack()

  const action = props.action as StaticSelectAction
  const isOther =
    action.action_id === 'venue_input' &&
    action.selected_option?.value === 'Other'

  const newBlocks = [...blocks]

  if (isOther) {
    newBlocks.splice(
      2,
      0,
      simpleInput({
        title: 'Venue Name',
        placeholder: 'e.g. Radio City Music Hall',
        block_id: 'input_venue_other',
        action_id: 'venue_input_other',
      }),
    )
    newBlocks.splice(
      3,
      0,
      simpleInput({
        title: 'Location',
        placeholder: 'e.g. New York,',
        block_id: 'input_location',
        action_id: 'location_input',
      }),
    )
  }

  const newView = modal({
    title: 'Request a Show!',
    callback_id: 'request_view',
    blocks: newBlocks,
  })

  try {
    await client.views.update({
      // @ts-ignore
      view_id: body.view.id,
      view: newView,
    })
  } catch (error) {
    console.error(error)
  }
}

export const showRequestModal: Middleware<
  SlackCommandMiddlewareArgs | SlackActionMiddlewareArgs
> = async (props) => {
  const { ack, body, client } = props
  await ack()

  try {
    await client.views.open({
      // @ts-ignore
      trigger_id: body.trigger_id,
      view: modal({
        title: 'Request a Show!',
        callback_id: 'request_view',
        blocks: [...blocks],
      }),
    })
  } catch (error) {
    console.error(error)
  }
}
