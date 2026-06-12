# Supabase Auth Provider Setup

The Everyday frontend is already wired for:

- Google OAuth via `supabase.auth.signInWithOAuth({ provider: "google" })`
- Email one-time codes via `supabase.auth.signInWithOtp({ email })`
- Phone SMS one-time codes via `supabase.auth.signInWithOtp({ phone })`
- OTP verification via `supabase.auth.verifyOtp(...)`

These providers still need dashboard-side delivery credentials.

## Google

Supabase Dashboard:

`Authentication -> Sign In / Providers -> Google`

Enable Google and add:

- Google OAuth Client ID
- Google OAuth Client Secret

In Google Cloud Console, create a Web application OAuth client and set:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: the callback URL shown inside the Supabase Google provider dialog

For production, also add the production app origin and redirect URL.

## Phone SMS with Twilio

Supabase Dashboard:

`Authentication -> Sign In / Providers -> Phone`

Enable Phone, keep SMS provider as Twilio, and add:

- Twilio Account SID
- Twilio Auth Token
- Twilio Messaging Service SID

Keep phone confirmations enabled so users receive an SMS OTP and must enter the code.

## Email OTP

Supabase Dashboard:

`Authentication -> Emails -> Templates`

For a code-based email flow, make sure the relevant email template includes:

`{{ .Token }}`

If the template only includes `{{ .ConfirmationURL }}`, users will receive a magic link
instead of a code.

## Local app callback

During local development, the app runs at:

`http://localhost:3000/legacy/Poketee.html?app=1`

When OAuth redirects back to the app, the legacy page reads the Supabase session from the
URL and then continues into the normal Everyday profile/onboarding flow.
