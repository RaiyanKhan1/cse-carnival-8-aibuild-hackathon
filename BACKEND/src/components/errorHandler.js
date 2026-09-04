import colors from 'colors';

/**
 * Centralized error handler — logs the failure and returns a structured JSON envelope.
 * Pairs with SuccessHandler so both success and error paths share the same shape.
 *
 *   {
 *     status, success: false,
 *     error: { code, message, details? },
 *     info: { service, message, gatewayInfo }
 *   }
 */
const ErrorHandler = (err, res, status = 500, fallbackMsg = 'Internal server error') => {
  const service = process.env.SERVICE_NAME || 'campusos';

  // Allow callers to pass either an HttpError-like object or a plain { code, message }.
  const code = err?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = err?.message || fallbackMsg;
  const details = err?.details;

  const label = status >= 500
    ? colors.bgRed.white(`ERROR [${status}]: ${message}`)
    : colors.bgYellow.black(`ERROR [${status}]: ${message}`);
  console.log(label);

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