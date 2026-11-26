# Deploy fishn with Netlify Forms

1. Import this repository into Netlify. netlify.toml selects npm run build:netlify, Node 24, and the dist/client publish directory.
2. Enable form detection, then deploy or redeploy. Netlify should detect fishing-session from public/__forms.html.
3. Under Forms → Submission notifications, add an email notification for fishing-session. Enter the owner's chosen recipient in the dashboard. Keep the address out of frontend code and the public repository.
4. Confirm the recipient if requested. After deployment, submit one real test enquiry and verify both the Netlify submission and inbox delivery.
5. To change the recipient, edit the dashboard notification; no code change is needed.

Submit posts URL-encoded session and contact details to /__forms.html with form-name=fishing-session. The static blueprint includes the submitted fields, honeypot, and reply email. Pricing is included, but acceptance is a pending enquiry; Nikita still confirms availability and the final plan. Unchanged retries retain their reference, but automatic deduplication is not guaranteed.

Both development and production use this single submission path. Netlify Forms runs only on Netlify; local previews cannot deliver email. HTTP or network failures leave answers intact and do not show confirmation. Browser tests intercept submissions instead of sending real enquiries.

Run npm run build, then npm run preview to inspect the pre-rendered site at http://127.0.0.1:4176. preview:netlify remains a compatibility alias. The local static preview rejects POSTs and does not impersonate Netlify Forms.

Set SITE_URL in Netlify's build environment to the final custom origin if needed; otherwise its URL environment variable is used for canonical metadata. No email API keys or custom application server are needed.

This cleanup does not deploy the site or change Netlify notification settings. Live delivery must be verified on the deployed site.

Official references: [Forms setup](https://docs.netlify.com/manage/forms/setup/), [Email notifications](https://docs.netlify.com/manage/forms/notifications/).
