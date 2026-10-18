type Fields = {
  requestId?: string
  tenantId?: string
  userId?: string
  feature: string
  [key: string]: string | number | boolean | undefined
}

/** Structured JSON logs for Cloud Logging. Never pass PII or media content. */
export const logger = {
  info: (message: string, fields: Fields) => write('INFO', message, fields),
  warn: (message: string, fields: Fields) => write('WARNING', message, fields),
  error: (message: string, fields: Fields) => write('ERROR', message, fields),
}

function write(severity: string, message: string, fields: Fields) {
  console.log(JSON.stringify({ severity, message, time: new Date().toISOString(), ...fields }))
}
