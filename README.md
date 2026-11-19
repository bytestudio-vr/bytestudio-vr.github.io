# ByteStudio Remote Desktop — product site

Static GitHub Pages site for **ByteStudio Remote Desktop**, the Meta Quest app that brings a
Windows or Linux desktop into VR over standard RDP.

- `index.html` — product page: features, Free vs Ultra, screenshots, setup, FAQ, Store calls to action.
- `privacy.html` — privacy policy, including the in-app purchase disclosure.
- `analytics.js` — optional Umami Cloud tracking, shared by both pages.
- `robots.txt` — crawler rules and sitemap location.
- `sitemap.xml` — URLs submitted to search engines.
- `images/` — app icon, Store cover and layout screenshots.

SEO lives in `index.html`: canonical URL, Open Graph and Twitter cards, and JSON-LD
(`SoftwareApplication` plus `FAQPage` built from the on-page FAQ). Absolute URLs point to
`https://bytestudio-vr.github.io/`, so update them if the domain changes.

The app is a free download on the Meta Horizon Store; the Ultra edition is a one-time in-app
purchase that adds a third screen, curved panels and layout presets. Quest 3 and Quest 3S.

Windows 10/11 Pro is expected to work because it exposes standard RDP, but it is **not officially
supported yet**: it has not been tested. Testers are welcome to report back at
`bytestudio.rdp@gmail.com`.

Store listing: https://www.meta.com/experiences/1466447889876925/

## Preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000/.

## Analytics

The site supports [Umami Cloud](https://umami.is/pricing), with no backend or build step to maintain.
Its free **Hobby** plan currently includes one website, up to 100,000 events per month and six months
of data retention. Page views, custom events and stored event properties count toward the quota.
The free plan includes the dashboard and data export, but not API access.

Tracking is configured for `bytestudio-vr.github.io`. The public Umami website identifier is set in
`websiteId` at the top of `analytics.js`; it is not a secret or an API key. To replace it, copy the
`data-website-id` value from the website's **Tracking code** in Umami. If the production hostname
changes, update `domains` in the same file. Deploy the files to GitHub Pages to start collecting
data; visits before activation cannot be recovered.

The [Umami dashboard](https://cloud.umami.is/) shows page views, visits, visitors, referrers,
countries, browsers and devices for the product and privacy pages. The **Events** view contains `meta_store_click` and
`apk_download_click`. For Store clicks, the `placement` property distinguishes `navigation`, `hero`,
`free_plan`, `ultra_plan`, `final_cta` and `footer`. These measure link clicks, not completed downloads,
installations or purchases.

The tracker does not use tracking cookies. It only loads on the configured production domain and
respects enabled Do Not Track and Global Privacy Control signals. The current page's query string
and fragment are excluded, so anchor navigation does not inflate page views and UTM campaign
parameters are not collected. Referrer-based traffic sources remain available. Ad blockers and
privacy settings can make totals lower than the actual traffic.

To verify activation, visit the deployed site in a browser without those blocking settings. A request
to `https://cloud.umami.is/script.js` should appear in the Network panel, followed by analytics
requests. Open a Store or APK link and check Umami's realtime view, then **Events**. To disable
tracking, set `websiteId` back to an empty string. No analytics requests are made in local previews
or while the identifier is empty, and all links still work if Umami is unavailable.

## Deploy

Push to the `main` branch of `bytestudio-vr.github.io`; GitHub Pages serves the repository root as
is, with no build step.
