import colors from 'colors';
import response from 'express';

/**
 * Centralized success handler — logs the request and returns a structured JSON envelope.
 * Service name is read from `process.env.SERVICE_NAME` (defaults to "campusos").
 */
const SuccessHandler = (data, res, status = 200, msg = 'OK') => {
  const service = process.env.SERVICE_NAME || 'campusos';
  console.log(colors.bgBlue.black(`SUCCESS [${status}]: ${msg}`));
  return res.status(status).json({
    status,
    success: true,
    data,
    info: {
      service,
      message: msg,
      gatewayInfo: msg,
    },
  });
};

export { SuccessHandler };