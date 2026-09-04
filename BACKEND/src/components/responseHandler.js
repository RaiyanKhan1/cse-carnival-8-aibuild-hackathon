// Consistent response envelope for every endpoint.
// Success: { success: true, data, meta? }
// Failure: handled by errorHandler middleware.

export function ok(res, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.json(body);
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function noContent(res) {
  return res.status(204).send();
}

export function paginated(res, data, total, { page = 1, limit = 0 } = {}) {
  return res.json({
    success: true,
    data,
    meta: { total, page, limit },
  });
}