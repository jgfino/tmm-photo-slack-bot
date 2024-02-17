export enum RequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Denied = 'Denied',
  NoResponse = 'No Response',
}

export interface PhotoRequest {
  uuid: string
  date: string
  artist: string
  venue: string
  location: string
  photographer: string
  slackID: string
  notes: string
  plusOne: boolean
  portraits: boolean
  assigned: boolean
  status: RequestStatus | string
  submissionLink: string
  submissionBlurb: string
  submissionNotes: string
  webLink: string
  sentToPR: boolean
}

export interface PhotoSubmission {
  displayName: string
  requestID: string
  link: string
  blurb: string
  notes: string
}
