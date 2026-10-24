export const Result = {
  ok: (value) => ({
    success: true,
    value
  }),

  fail: (code, message) => ({
    success: false,
    error: { code, message }
  })
}
