// CONVERTS PRISMA ERROR CODES INTO STRUCTURED HTTPERRORS

// SENDS A STANDARD 200 SUCCESS RESPONSE WITH THE GIVEN DATA
export function ok(res, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.json(body);
}

// SENDS A STANDARD 201 CREATED RESPONSE
export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

// SENDS A 204 NO CONTENT RESPONSE
export function noContent(res) {
  return res.status(204).send();
}

// SENDS A PAGINATED SUCCESS RESPONSE WITH TOTAL AND PAGE METADATA
export function paginated(res, data, total, { page = 1, limit = 0 } = {}) {
  return res.json({
    success: true,
    data,
    meta: { total, page, limit },
  });
}