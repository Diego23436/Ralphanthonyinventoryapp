const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
const fromEmail = Deno.env.get('LOW_STOCK_FROM_EMAIL') ?? 'alerts@example.com'
const toEmail = Deno.env.get('LOW_STOCK_ALERT_EMAIL') ?? ''

Deno.serve(async (request) => {
  try {
    const { material_name, current_quantity, minimum_threshold, message } = await request.json()

    if (!resendApiKey || !toEmail) {
      return Response.json({ error: 'Email provider is not configured' }, { status: 400 })
    }

    const body = {
      from: fromEmail,
      to: [toEmail],
      subject: `Low stock alert: ${material_name}`,
      text:
        message ||
        `${material_name} is at ${current_quantity} units, below the configured threshold of ${minimum_threshold}.`,
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return Response.json({ error: errorText }, { status: response.status })
    }

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

