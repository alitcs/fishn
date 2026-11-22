# Deploy fishn with Netlify Forms

The checkout is prepared for Netlify. No site has been deployed and no notification has been sent.

1. Import this repository into Netlify. The included `netlify.toml` selects `npm run build:netlify`, Node 24, and the `dist/client` publish directory.
2. Enable **Forms → Enable form detection**, then deploy or redeploy. Netlify should detect the **fishing-session** form from the static `public/__forms.html` blueprint.
3. In **Forms → Submission notifications → Add notification**, choose an email notification for **fishing-session**. Use the temporary Gmail address provided in the conversation. Keep this recipient in Netlify rather than frontend code or the public repository.
4. Confirm the recipient if Netlify requests email verification. Send one real test request after deployment and verify both the submission in Netlify and receipt in the inbox.
5. To switch to the business inbox, edit the notification recipient in Netlify. No code change is needed.

The final **Submit** action posts the full session and contact details to `/__forms.html` with URL-encoded fields and `form-name=fishing-session`. The blueprint includes every submitted field, a honeypot, and the `email` field used for replies. Successful submission remains a pending enquiry; the displayed CAD hourly rate and session total are included, while availability and the final plan still need guide confirmation. The reference is preserved on retry, but Netlify does not provide the legacy Resend adapter's idempotency guarantee.

The local `npm run dev` server retains the existing API adapter and requires its email configuration to send real requests. It does not simulate delivery. `npm run build:netlify` selects the Netlify adapter, including for a local static preview. Netlify Forms itself operates on the deployed Netlify site; local previews cannot send through that service. Browser tests intercept submissions rather than sending real enquiries.

After building, run `npm run preview:netlify` to inspect the static deployment locally at `http://127.0.0.1:4176`. This preview serves every pre-rendered route and rejects real form POSTs; it does not impersonate Netlify Forms.

Set `SITE_URL` to the final custom origin if applicable. Otherwise the Netlify build uses Netlify's `URL` environment variable for canonical metadata.

Official references: [Forms setup](https://docs.netlify.com/manage/forms/setup/), [Email notifications](https://docs.netlify.com/manage/forms/notifications/).
