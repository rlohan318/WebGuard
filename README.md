# WebGuard

WebGuard is a TypeScript and Playwright Test starter framework for automating checks against existing web applications. It currently includes a homepage smoke test for the Automation Exercise practice site, browser configuration, failure evidence, and an HTML report. It does not create or host a website.

## Current scope

- Homepage smoke test using Playwright's role-based locators and assertions.
- Chromium and WebKit projects enabled by default.
- Optional Firefox project, enabled with `PLAYWRIGHT_INCLUDE_FIREFOX=1`.
- Configurable target URL through `BASE_URL`.
- HTML reporting, failure screenshots, and retained failure traces.

The broader UI scenario suite, page objects, test datasets, API collection, SOAP demonstration, and CI workflow described in [repport.md](./repport.md) are planned work and are not currently implemented.

## Requirements

- Node.js compatible with the installed Playwright and TypeScript dependencies.
- npm.

## Setup

Install project dependencies and the default browser engines:

```bash
npm install
npx playwright install chromium webkit
```

## Run tests

Run the default browser projects:

```bash
npm test
```

Run Chromium only:

```bash
npm run test:chromium
```

Include Firefox when its Playwright browser installation is available:

```bash
PLAYWRIGHT_INCLUDE_FIREFOX=1 npx playwright install firefox
PLAYWRIGHT_INCLUDE_FIREFOX=1 npm test
```

Override the default target:

```bash
BASE_URL=https://example.com npm test
```

The smoke test checks the target title and the visible homepage heading, so a custom `BASE_URL` must serve the expected Automation Exercise page for this test to pass.

After a run, open the HTML report with:

```bash
npx playwright show-report
```

## Interactive dashboard

Start the local dashboard:

```bash
npm run dashboard
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173), choose the browser, then select **Run smoke test**. The dashboard displays run status and Playwright output while the test executes. It runs the homepage smoke test, which expects the Automation Exercise page.

To try a predictable failure without depending on an external site, choose **Use built-in fault demo**. This local sample storefront deliberately has the wrong document title and does not include the expected Automation Exercise heading. The smoke test reports both problems, including the observed title and visible headings. Use **Preview demo website** to inspect the sample.

A custom URL must serve the expected Automation Exercise page; using an unrelated site such as Google will fail the assertions.

The server binds to loopback and is intended for local use only. Run data is held in memory for the lifetime of the dashboard process and is not uploaded. Set `PORT` to use a different local port.

Generated reports, test results, screenshots, and traces are excluded from Git by `.gitignore`.

## Project layout

```text
tests/ui/              Browser-based smoke tests
dashboard/             Local interactive test runner and dashboard
playwright.config.ts   Shared Playwright settings and browser projects
repport.md             Detailed academic project report and implementation status
```

## Status and limitations

This is an initial framework slice, not a completed comprehensive test suite. Tests depend on the availability and current behavior of the external target site. Firefox is opt-in because it failed to start in the development environment with a missing profile folder; Chromium and WebKit are the verified default projects.
