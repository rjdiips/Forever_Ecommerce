/**
 * Structured JSON logger.
 *
 * Writes one JSON object per line to stdout. The Vercel runtime ingests stdout
 * into Runtime Logs, where JSON fields are searchable and filterable. Keeping a
 * single `level` field lets the platform (and `node --test`) read the severity.
 *
 * Every line goes to stdout so the ordering is stable; the `level` field carries
 * the severity rather than the stream.
 *
 * Never log request bodies, headers, tokens, or any other secret.
 *
 * @param {"info"|"warn"|"error"} level
 * @param {string} msg
 * @param {Record<string, unknown>} [fields]
 */
const write = (level, msg, fields) => {
  const line = { level, time: new Date().toISOString(), msg, ...fields };
  console.log(JSON.stringify(line));
};

export const log = {
  /** @param {string} msg @param {Record<string, unknown>} [fields] */
  info: (msg, fields) => write("info", msg, fields),
  /** @param {string} msg @param {Record<string, unknown>} [fields] */
  warn: (msg, fields) => write("warn", msg, fields),
  /** @param {string} msg @param {Record<string, unknown>} [fields] */
  error: (msg, fields) => write("error", msg, fields),
};

export default log;
