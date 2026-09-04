// LOGS FAILURES AND RETURNS A STRUCTURED JSON ERROR ENVELOPE
const ErrorHandler = (err, res, status = 500, fallbackMsg = 'Internal server error') => {
  const service = process.env.SERVICE_NAME || 'campusos';

  // ALLOW CALLERS TO PASS AN HTTPERROR OR A PLAIN OBJECT
  const code = err?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = err?.message || fallbackMsg;
  const details = err?.details;

  // LOG 5XX ERRORS IN RED AND 4XX ERRORS IN YELLOW
  const label = status >= 500
    ? colors.bgRed.white(`ERROR [${status}]: ${message}`)
    : colors.bgYellow.black(`ERROR [${status}]: ${message}`);
  console.log(label);

  // BUILD A CONSISTENT ERROR BODY
  const body = {
    status,
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
    info: {
      service,
      message,
      gatewayInfo: message,
    },
  };
  return res.status(status).json(body);
};

export { ErrorHandler };