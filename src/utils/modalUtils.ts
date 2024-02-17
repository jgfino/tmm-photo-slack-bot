import { KnownBlock, View } from '@slack/bolt'

interface BaseInputProps {
  title: string
  block_id: string
  action_id: string
  optional?: boolean
}

interface SimpleInputProps extends BaseInputProps {
  placeholder: string
  multiline?: boolean
}

export const simpleInput = (props: SimpleInputProps): KnownBlock => {
  return {
    type: 'input',
    block_id: props.block_id,
    optional: props.optional,
    label: {
      type: 'plain_text',
      text: props.title,
    },
    element: {
      type: 'plain_text_input',
      action_id: props.action_id,
      placeholder: {
        type: 'plain_text',
        text: props.placeholder,
      },
      multiline: props.multiline,
    },
  }
}

interface DropdownInputProps extends BaseInputProps {
  options: { text: string; value: string }[]
  placeholder?: string
}

export const dropdownInput = (props: DropdownInputProps): KnownBlock => {
  return {
    type: 'input',
    block_id: props.block_id,
    optional: props.optional,
    label: {
      type: 'plain_text',
      text: props.title,
    },
    dispatch_action: true,
    element: {
      type: 'static_select',
      action_id: props.action_id,
      placeholder: {
        type: 'plain_text',
        text: props.placeholder || 'Select an option',
      },
      options: props.options.map((option) => ({
        text: {
          type: 'plain_text',
          text: option.text,
        },
        value: option.value,
      })),
    },
  }
}

interface CheckboxInputProps extends BaseInputProps {}

export const checkboxInput = (props: CheckboxInputProps): KnownBlock => {
  return {
    type: 'input',
    block_id: props.block_id,
    optional: props.optional,
    label: {
      type: 'plain_text',
      text: props.title,
    },
    element: {
      type: 'checkboxes',
      action_id: props.action_id,
      options: [
        {
          text: {
            type: 'plain_text',
            text: 'Yes',
          },
          value: 'yes',
        },
      ],
    },
  }
}

interface DateInputProps extends BaseInputProps {}

export const dateInput = (props: DateInputProps): KnownBlock => {
  return {
    type: 'input',
    block_id: props.block_id,
    optional: props.optional,
    label: {
      type: 'plain_text',
      text: props.title,
    },
    element: {
      type: 'datepicker',
      action_id: props.action_id,
    },
  }
}

interface ModalProps {
  title: string
  callback_id: string
  blocks: KnownBlock[]
  submitTitle?: string
}

export const modal = (props: ModalProps): View => {
  return {
    type: 'modal',
    callback_id: props.callback_id,
    title: {
      type: 'plain_text',
      text: props.title,
    },
    blocks: props.blocks,
    submit: {
      type: 'plain_text',
      text: props.submitTitle || 'Submit',
    },
  }
}
