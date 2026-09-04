import colors from 'colors';

// CENTRALIZED SUCCESS HANDLER - LOGS AND SENDS A STRUCTURED JSON RESPONSE
const SuccessHandler = (data, res, status = 200, msg = 'OK') => {
  const service = process.env.SERVICE_NAME || 'campusos';

  // LOG SUCCESS MESSAGE IN BLUE
  console.log(colors.bgBlue.black(`SUCCESS [${status}]: ${msg}`));

  // SEND STRUCTURED SUCCESS RESPONSE
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