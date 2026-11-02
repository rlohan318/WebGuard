# WebGuard – Project Report

> **Academic submission template:** Replace the bracketed fields with your details. The implementation and execution sections are deliberately limited to work actually completed. Do not report a test as passed until its run output confirms that result.

## Title page

**Project title:** WebGuard – Modular Web Application Automation Testing Framework Using Playwright and API Testing

**Submitted by:** [Student name]

**Course:** Master of Computer Applications (MCA)

**Subject:** Automation Software Testing

**Institution:** [College / university]

**Academic year:** [Academic year]
**Project guide:** [Guide name]

## Abstract

WebGuard is a reusable test automation framework intended to validate existing web applications rather than develop a new website. The project uses Playwright Test with TypeScript for browser-based checks. Its planned structure separates test execution, browser configuration, page interactions, and test data. REST API scenarios are planned as a Postman collection executed with Newman, with a separate SoapUI demonstration for SOAP testing. The framework is configured to produce Playwright HTML reports and retain failure evidence.

The current implementation establishes the project metadata, Playwright configuration, and an initial homepage smoke test targeting Automation Exercise. Further UI, API, cross-browser, CI, and documentation work remains to be implemented and verified.

## 1. Introduction

Manual testing can be repetitive and time-consuming when the same application behavior must be checked after changes. Automation can execute repeatable checks, produce consistent evidence, and help detect regressions. WebGuard demonstrates these ideas through a small, modular testing framework that targets a publicly available practice website.

The project is intentionally an automation framework only. It does not create or host an e-commerce application or backend.

## 2. Problem statement

Repeatedly validating common user flows in a web application manually can consume time and make regression checks inconsistent. A maintainable automation framework is needed to organize reusable browser tests, test data, API checks, browser configuration, and execution evidence in one project.

## 3. Objectives

- Automate selected user-facing scenarios on an existing practice website.
- Use TypeScript and Playwright Test with reusable page objects.
- Keep test data and environment configuration separate from test code.
- Demonstrate REST API checks using Postman/Newman and SOAP testing using SoapUI.
- Exercise supported scenarios in Chromium, Firefox, and WebKit.
- Produce test reports and preserve traces and screenshots on failures.
- Demonstrate CI execution through GitHub Actions.

## 4. Scope

### In scope

- UI automation for login, registration, search, cart, validation, navigation, and session scenarios, subject to verified site behavior.
- Data-driven UI tests using JSON data.
- Browser projects for Chromium, Firefox, and WebKit.
- REST API validation through a Postman collection and Newman.
- A SOAP testing demonstration using SoapUI.
- Playwright HTML reporting, failure screenshots, and traces.
- Automated execution in GitHub Actions.

### Out of scope

- Developing or modifying the target website or its backend.
- Storing real user passwords in source control.
- Claiming coverage of site behavior that has not been verified by test execution.
- Implementing a custom reporting dashboard.

## 5. Technology stack

| Area | Planned technology |
|---|---|
| Language | TypeScript |
| UI automation and runner | Playwright Test |
| API collection | Postman |
| API CLI execution | Newman |
| SOAP demonstration | SoapUI |
| UI report | Playwright HTML Reporter |
| Version control | Git and GitHub |
| CI/CD | GitHub Actions |
| Development environment | Visual Studio Code |

## 6. System architecture

```text
Playwright configuration ──> Test execution ──> Page objects ──> Automation Exercise
                                      │
                                      ├── Test data (JSON)
                                      ├── Browser projects (Chromium / Firefox / WebKit)
                                      └── HTML report + trace + screenshot evidence

Postman collection ──> Newman ──> REST API checks
SoapUI project ────────────────> SOAP API demonstration
GitHub Actions ────────────────> Automated execution and report artifacts
```

The Playwright configuration owns shared browser options, base URL, retry policy, and reporting. Tests express scenarios and assertions. Page objects, when implemented, will encapsulate reusable page-level interactions rather than duplicate locator logic in each test. JSON test data will be maintained separately. API and SOAP assets are separate from browser tests because they use different tools and execution workflows.

## 7. Folder structure

```text
WebGuard/
├── .github/workflows/       # Planned CI workflow
├── api-collections/postman/ # Planned REST collection and environment template
├── config/                  # Planned environment configuration
├── docs/                    # Planned presentation and supporting material
├── fixtures/                # Planned reusable Playwright fixtures
├── pages/                   # Planned page objects
├── reports/                 # Generated output; not committed
├── soapui/                  # Planned SOAP demonstration project
├── test-data/               # Planned JSON datasets
├── tests/
│   ├── cross-browser/       # Planned cross-browser scenarios
│   ├── api/                 # Planned API-related checks
│   └── ui/                  # UI scenarios; currently contains a smoke test
├── utils/                   # Planned shared helpers
├── .gitignore
├── README.md
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── repport.md
```

## 8. Implementation status

| Component | Status |
|---|---|
| Project metadata and local Git initialization | Completed |
| Playwright dependency and scripts | Installed and verified |
| Chromium and WebKit browser projects | Configured and verified |
| Optional Firefox project | Enabled only when `PLAYWRIGHT_INCLUDE_FIREFOX=1`; it remains unverified because its browser process could not find a usable profile |
| Homepage smoke test | Passed in Chromium and WebKit; Firefox is excluded from the default run due to its startup failure in this environment |
| Page Object Model | Planned; not implemented |
| UI scenario suite and JSON datasets | Planned; not implemented |
| Postman/Newman API suite | Planned; not implemented |
| SoapUI demonstration | Planned; not implemented |
| GitHub Actions | Planned; not implemented |
| Report, trace, and screenshot configuration | Configured; HTML report generated by the verified run |

## 9. Installation and execution

Run commands from the WebGuard project directory.

```bash
npm install
npx playwright install chromium
npm run test:chromium
```

To include Firefox in a run (in addition to Chromium and WebKit), install its browser binary and set the opt-in variable for the test command. Firefox does not currently launch in the development environment described above.

```bash
npx playwright install firefox
PLAYWRIGHT_INCLUDE_FIREFOX=1 npm run test:all-browsers
```

To view the HTML report after a completed run:

```bash
npx playwright show-report
```

The default base URL is `https://automationexercise.com`. It can be overridden for a test run by setting `BASE_URL`.

## 10. Test design and results

The planned test inventory covers login/registration, product search, cart operations, form validation, session behavior, browser consistency, and API validation. Individual test-case records should include an ID, scenario, preconditions, data, steps, expected result, actual result, and status.

**Execution status:** The default homepage smoke test was run against Automation Exercise in Chromium and WebKit; both passed. Firefox is opt-in with `PLAYWRIGHT_INCLUDE_FIREFOX=1`. When attempted in this environment, its browser process exited with `Could not find profile folder` before the test assertion ran, including after a browser reinstall and retries with one worker. TypeScript type-checking completed successfully. The latest default test run passed in both enabled projects.

| Metric | Actual value |
|---|---|
| Test scenarios implemented | 1 smoke scenario |
| Browser-project executions in latest default run | 2 |
| Passed | 2 (Chromium, WebKit) |
| Failed in latest default run | 0 |
| Skipped | 0 |
| Duration | 14.2 seconds |

## 11. Syllabus mapping

| Syllabus topic | Project treatment |
|---|---|
| Automation versus manual testing | Discussed in the introduction |
| Black-box testing and test design | Demonstrated through user-visible checks; expanded suite pending |
| Modular and data-driven frameworks | Planned through page objects and JSON test data |
| Assertions and Playwright fundamentals | Initial smoke-test assertion implemented |
| Selenium fundamentals | Supplementary comparison only; Selenium is not part of the implementation stack |
| REST API testing | Planned using Postman and Newman |
| SOAP API testing | Planned as a SoapUI demonstration |
| Locators, selectors, and auto-waiting | Used by the smoke test through Playwright role-based locator and visibility assertion |
| Parallel and cross-browser execution | Chromium and WebKit verified; Firefox is optional and could not launch in this environment |
| Form validation and session management | Planned UI coverage |
| Alerts, file upload, and download | Supplementary/conditional coverage; include only if suitable target behavior is verified |
| Debugging and trace viewer | Failure trace retention configured; run evidence pending |
| Reporting and CI/CD | HTML reporter configured; CI workflow remains planned |

## 12. Limitations

- The target website is external and may change or restrict availability.
- Some flows may require generated accounts or other mutable state, so tests must avoid relying on shared or pre-existing data.
- API endpoints and payloads must be verified against the target's published documentation before implementation.
- Browser projects being configured does not prove that the browsers are installed or that the tests pass in them.
- The implementation is currently a starter slice; the broader scenario matrix, API integration, SOAP demonstration, and CI workflow are pending.

## 13. Future enhancements

- Complete page objects and independently runnable UI scenarios.
- Add verified test datasets and boundary-value cases.
- Build API collection assertions based on documented endpoints.
- Add a safe account/data strategy for registration and cart scenarios.
- Implement CI execution and report artifact retention.
- Record real run metrics and attach generated evidence.
- Expand the viva presentation with architecture diagrams and a live execution demonstration.

## 14. Conclusion

WebGuard establishes the initial foundation for a modular web application automation project. Its current starter slice defines Playwright browser configuration and a homepage smoke test. The complete academic deliverable will require implementing the remaining scenario groups and API/CI components, then validating them through actual runs. This report explicitly distinguishes implemented configuration from work still planned so the final submission can present verifiable results.
