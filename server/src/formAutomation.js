const { chromium } = require("playwright");
const {
  ACTION_DELAY_MAX,
  ACTION_DELAY_MIN,
  FORM_URL,
  HEADLESS,
  NAVIGATION_TIMEOUT,
  SERVICE_AREAS,
} = require("./config");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function randomDelay(min = ACTION_DELAY_MIN, max = ACTION_DELAY_MAX) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function pause(page, min, max) {
  await page.waitForTimeout(randomDelay(min, max));
}

async function clickIfVisible(locator) {
  if ((await locator.count()) === 0) {
    return false;
  }

  const target = locator.first();
  if (!(await target.isVisible().catch(() => false))) {
    return false;
  }

  await target.click();
  return true;
}

async function waitForFormReady(page) {
  await page.goto(FORM_URL, {
    waitUntil: "domcontentloaded",
    timeout: NAVIGATION_TIMEOUT,
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await pause(page);

  const startCandidates = [
    page.getByRole("button", { name: /start now/i }),
    page.getByRole("link", { name: /start now/i }),
    page.getByText(/start now/i),
  ];

  for (const locator of startCandidates) {
    if (await clickIfVisible(locator)) {
      await page.waitForLoadState("networkidle").catch(() => {});
      await pause(page);
      break;
    }
  }
}

async function selectDropdownOptionByQuestion(page, questionText, optionText) {
  const question = page
    .locator('[data-automation-id="questionItem"]')
    .filter({ hasText: new RegExp(questionText, "i") })
    .first();

  await question.waitFor({ state: "visible", timeout: NAVIGATION_TIMEOUT });

  const triggerCandidates = [
    question.locator('[role="button"][aria-haspopup="listbox"]'),
    question.getByRole("button"),
  ];

  let opened = false;
  for (const locator of triggerCandidates) {
    if (await locator.count()) {
      await locator.first().click();
      await pause(page, 300, 700);
      opened = true;
      break;
    }
  }

  if (!opened) {
    throw new Error(`Unable to open dropdown for "${questionText}"`);
  }

  const optionCandidates = [
    page.getByRole("option", {
      name: new RegExp(`^${escapeRegex(optionText)}$`, "i"),
    }),
    page
      .locator('[role="listbox"]')
      .getByText(new RegExp(`^${escapeRegex(optionText)}$`, "i")),
    page.getByText(new RegExp(`^${escapeRegex(optionText)}$`, "i")),
  ];

  for (const locator of optionCandidates) {
    if (await locator.count()) {
      await locator.first().click();
      await pause(page);
      return;
    }
  }

  throw new Error(
    `Unable to select dropdown option "${optionText}" for "${questionText}"`,
  );
}

async function selectRadioByQuestion(page, questionText, choiceText) {
  const question = page
    .locator('[data-automation-id="questionItem"]')
    .filter({ hasText: new RegExp(questionText, "i") })
    .first();

  await question.waitFor({ state: "visible", timeout: NAVIGATION_TIMEOUT });

  const choiceCandidates = [
    question.locator(
      `[data-automation-id="choiceItem"] [data-automation-value="${choiceText}"]`,
    ),
    question.getByRole("radio", {
      name: new RegExp(`^${escapeRegex(choiceText)}$`, "i"),
    }),
    question.getByText(new RegExp(`^${escapeRegex(choiceText)}$`, "i")),
  ];

  for (const locator of choiceCandidates) {
    if (await locator.count()) {
      const target = locator.first();
      await target.click({ force: true }).catch(async () => {
        await target.check({ force: true });
      });
      await pause(page);
      return;
    }
  }

  throw new Error(
    `Unable to select radio option "${choiceText}" for "${questionText}"`,
  );
}

async function selectRating(page, rating) {
  const ratingText = String(rating);
  const candidates = [
    page.getByRole("radio", {
      name: new RegExp(`^${escapeRegex(ratingText)}$`),
    }),
    page.getByLabel(new RegExp(`^${escapeRegex(ratingText)}$`)),
    page.getByText(new RegExp(`^${escapeRegex(ratingText)}$`)),
  ];

  for (const locator of candidates) {
    if (await locator.count()) {
      const target = locator.first();
      await target.check({ force: true }).catch(async () => {
        await target.click({ force: true });
      });
      await pause(page);
      return;
    }
  }

  throw new Error(`Unable to select rating "${rating}"`);
}

async function fillTextboxByQuestion(page, questionText, value, options = {}) {
  const { optional = false } = options;
  const question = page
    .locator('[data-automation-id="questionItem"]')
    .filter({ hasText: new RegExp(questionText, "i") })
    .first();

  await question.waitFor({ state: "visible", timeout: NAVIGATION_TIMEOUT });

  const textboxes = question.locator('[data-automation-id="textInput"]');
  if (await textboxes.count()) {
    await textboxes.first().fill(value);
    await pause(page);
    return;
  }

  const labelLocator = page.getByLabel(new RegExp(questionText, "i"));
  if (await labelLocator.count()) {
    await labelLocator.first().fill(value);
    await pause(page);
    return;
  }

  const globalTextboxes = page.getByRole("textbox");
  const textboxCount = await globalTextboxes.count();

  for (let i = 0; i < textboxCount; i += 1) {
    const textbox = globalTextboxes.nth(i);
    const containerText = await textbox
      .locator("xpath=ancestor::*[self::div or self::section][1]")
      .textContent()
      .catch(() => "");

    if (containerText && new RegExp(questionText, "i").test(containerText)) {
      await textbox.fill(value);
      await pause(page);
      return;
    }
  }

  if (!optional) {
    throw new Error(`Unable to fill textbox for "${questionText}"`);
  }
}

async function clickNext(page) {
  const candidates = [
    page.getByRole("button", { name: /^next$/i }),
    page.getByText(/^next$/i),
  ];

  for (const locator of candidates) {
    if (await locator.count()) {
      await locator.first().click();
      await page.waitForLoadState("networkidle").catch(() => {});
      await pause(page);
      return;
    }
  }

  throw new Error("Unable to find Next button");
}

async function clickSubmit(page) {
  const candidates = [
    page.getByRole("button", { name: /^submit$/i }),
    page.getByText(/^submit$/i),
  ];

  for (const locator of candidates) {
    if (await locator.count()) {
      await locator.first().click();
      await page.waitForLoadState("networkidle").catch(() => {});
      await pause(page, 1000, 2000);
      return;
    }
  }

  throw new Error("Unable to find Submit button");
}

async function waitForConfirmation(page) {
  const confirmationCandidates = [
    page.locator('[data-automation-id="thankYouMessage"]'),
    page.getByText(/your response was submitted/i),
    page.getByText(/your response has been submitted/i),
    page.getByText(/thanks/i),
    page.getByText(/thank you/i),
    page.locator('[data-automation-id="submitAnother"]'),
    page.getByRole("button", { name: /submit another response/i }),
    page.getByRole("link", { name: /submit another response/i }),
  ];

  for (const locator of confirmationCandidates) {
    try {
      await locator.first().waitFor({ state: "visible", timeout: 7000 });
      return true;
    } catch {
      // Keep checking the remaining candidates.
    }
  }

  return false;
}

async function completeSubmission(browser, user, serviceArea) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(NAVIGATION_TIMEOUT);

  try {
    await waitForFormReady(page);
    await selectDropdownOptionByQuestion(
      page,
      "State of the branch you visited",
      user.state,
    );
    await selectDropdownOptionByQuestion(page, "Lagos Branch", user.branch);
    await selectRadioByQuestion(
      page,
      "Which of our service areas would you like to rate",
      serviceArea,
    );
    await selectRating(page, user.rating);
    await fillTextboxByQuestion(page, "Feedback", user.feedback);
    await clickNext(page);
    await fillTextboxByQuestion(
      page,
      "Please provide your contact details \\(mobile number\\)",
      user.phone,
    );
    await fillTextboxByQuestion(
      page,
      "Please provide your contact details \\(Name\\)",
      user.name,
    );

    if (user.email) {
      await fillTextboxByQuestion(
        page,
        "Please provide your contact details \\(email address\\)",
        user.email,
        { optional: true },
      );
    }

    await clickNext(page);
    await clickSubmit(page);

    const confirmed = await waitForConfirmation(page);

    if (!confirmed) {
      throw new Error("Submission confirmation not detected");
    }
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function processUsers(users) {
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];

  try {
    for (const user of users) {
      for (const serviceArea of SERVICE_AREAS) {
        const startedAt = new Date().toISOString();
        console.log(
          `[START] User: ${user.name} | Service Area: ${serviceArea} | ${startedAt}`,
        );

        try {
          await completeSubmission(browser, user, serviceArea);

          const finishedAt = new Date().toISOString();
          console.log(
            `[SUCCESS] User: ${user.name} | Service Area: ${serviceArea} | ${finishedAt}`,
          );

          results.push({
            user: user.name,
            phone: user.phone,
            serviceArea,
            status: "success",
            startedAt,
            finishedAt,
          });
        } catch (error) {
          const finishedAt = new Date().toISOString();
          console.error(
            `[FAILED] User: ${user.name} | Service Area: ${serviceArea} | ${finishedAt} | ${error.message}`,
          );

          results.push({
            user: user.name,
            phone: user.phone,
            serviceArea,
            status: "failed",
            startedAt,
            finishedAt,
            error: error.message,
          });
        }
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return results;
}

module.exports = {
  processUsers,
  SERVICE_AREAS,
};
