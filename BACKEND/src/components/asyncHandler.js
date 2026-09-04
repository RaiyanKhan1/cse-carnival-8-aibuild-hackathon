// WRAPS ASYNC ROUTE HANDLERS AND FORWARDS REJECTIONS TO THE ERROR MIDDLEWARE
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);