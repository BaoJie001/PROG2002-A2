# GenAI Declaration — honest version (Route A)

> Use this with the UPDATED report template from SIE Moodle.
> Everything below reflects what actually happened, so the declaration, the chat log
> and the screenshots all agree with each other.

---

## 1. Statement to paste into the report

I acknowledge that I have used GenAI tools to complete this assessment. I used WorkBuddy, an AI coding assistant, for the following purposes:

* explaining client–server concepts, HTTP methods and JSON so I could describe them in my own words;
* helping me structure the report and refine its academic wording and formatting;
* assisting with the development environment — installing Node.js, initialising and starting MySQL, and resolving connection errors;
* assisting with the implementation of the database schema and sample data, the Express API routes, and the HTML, CSS and JavaScript pages;
* reviewing my own code for errors, including a date-handling bug and a date-filter bug.

I understand that this assessment permits Level 2 GenAI use, which covers specific purposes such as brainstorming and clarifying my understanding, and that generating code with AI and submitting it is outside those parameters. I am disclosing the full extent of my use so that the Unit Assessor can make an informed judgement. I have read, run and tested every part of the submission, I made the final decisions on the design, and I am able to explain each file in the project.

---

## 2. Chat log — honest entries

| Date | Prompt / Request | Purpose |
| --- | --- | --- |
| 2026-10-03 | “Set up everything the assessment needs — Node.js, Express, MySQL, Postman, Git — none of it is configured on my machine.” | Environment setup |
| 2026-10-03 | “Explain why my date was being returned one day early and how to fix it.” | Debugging / understanding |
| 2026-10-03 | “Write the database schema and the sample data for the charity events site.” | Database implementation |
| 2026-10-03 | “Build the Express API endpoints for the home page, search and event detail.” | Server-side implementation |
| 2026-10-03 | “Build the three HTML/CSS/JS pages — no frameworks, no templating engine.” | Client-side implementation |
| 2026-10-03 | “Explain how the client and the server exchange data over HTTP using JSON.” | Technical explanation |
| 2026-10-03 | “Help me justify the three-table design against third normal form.” | Data schema section |
| 2026-10-03 | “Describe my API endpoints and explain why only GET methods are used.” | API design section |
| 2026-10-03 | “Structure my report to match the PROG2002 A2 template and refine the wording.” | Report organisation |
| 2026-10-03 | “Check the table and heading formatting of my report and make the terminology consistent throughout.” | Formatting check |
| 2026-10-03 | “Explain how a browser client and an Express server exchange data over HTTP using JSON.” | Technical explanation |
| 2026-10-03 | “Describe the main API endpoints I have built and explain why only GET methods are appropriate at this stage.” | API design section |
| 2026-10-03 | “Draft the GenAI acknowledgement and chat log for my report.” | Declaration |

Tab-separated for Word (paste, then Insert → Table → Convert Text to Table → separate at Tabs):

```
Date	Prompt / Request	Purpose
2026-10-03	"Set up everything the assessment needs — Node.js, Express, MySQL, Postman, Git — none of it is configured on my machine."	Environment setup
2026-10-03	"Explain why my date was being returned one day early and how to fix it."	Debugging / understanding
2026-10-03	"Write the database schema and the sample data for the charity events site."	Database implementation
2026-10-03	"Build the Express API endpoints for the home page, search and event detail."	Server-side implementation
2026-10-03	"Build the three HTML/CSS/JS pages — no frameworks, no templating engine."	Client-side implementation
2026-10-03	"Explain how the client and the server exchange data over HTTP using JSON."	Technical explanation
2026-10-03	"Help me justify the three-table design against third normal form."	Data schema section
2026-10-03	"Describe my API endpoints and explain why only GET methods are used."	API design section
2026-10-03	"Structure my report to match the PROG2002 A2 template and refine the wording."	Report organisation
2026-10-03	"Draft the GenAI acknowledgement and chat log for my report."	Declaration
```

---

## 3. Screenshots — how to capture them

The screenshots have to come from the real conversation, so take them from this
WorkBuddy session while it is still open.

1. **Create a folder**: `D:\PROG2002-A2\docs\genai-screenshots\`
2. **Scroll to the top** of this conversation and work downwards.
3. **Capture each exchange** with `Win` + `Shift` + `S`, then save the PNG into that folder.
   Name them in order: `01-environment.png`, `02-date-bug.png`, `03-database.png`,
   `04-api.png`, `05-frontend.png`, `06-report.png`.
4. **Capture whole turns** — your question *and* the reply — so the marker can see what was
   asked and what came back. Cropping out the reply looks like hiding something.
5. **Do not crop out the parts where code is produced.** That is exactly the evidence the
   marker asked for, and the declaration above already admits it.

### Where to put them in the report

Add a final section after the GenAI declaration:

```
Appendix A — GenAI Chat Log (screenshots)
```

Then insert the images in date order, each with a one-line caption underneath, e.g.
`Figure 1 — 2026-10-03: environment setup` , `Figure 2 — 2026-10-03: database implementation`.

If the template has no appendix section, submit the screenshots as a separate PDF
(`GenAI chat log.pdf`) alongside the report and say so in the declaration:
*"Screenshots of the full chat log accompany this report."*

---

## 4. Before you submit

* Student ID filled in (currently `____________`).
* Tool name in the declaration matches the tool in the screenshots — both say **WorkBuddy**.
* The chat log rows and the screenshots tell the same story.
* You can talk through `api/routes/events.js` and `clientside/js/api.js` unaided —
  the Unit Assessor may ask you to demonstrate your use.
