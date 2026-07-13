import { expect, test } from "@playwright/test";

const firstOption = "지금 최종 검수 중이고 10분 안에 올리겠습니다.";
const selectedOption = "파일 오류를 수정해서 바로 공유하겠습니다.";
const thirdOption = "현재 수정 중이며 완료되는 즉시 링크를 보내겠습니다.";

function excuse(selectedOptionIndex = 0) {
  const options = [firstOption, selectedOption, thirdOption];
  return {
    id: 42,
    replyToExcuseId: 41,
    incomingMessage: "그래서 지금 어떻게 할 건데?",
    roundNumber: 2,
    excuse: options[selectedOptionIndex],
    situation: "PPT 제출이 늦었다",
    target: "TEAM_LEAD",
    tone: "MILD",
    analysis: {
      successRate: 60,
      realism: 4,
      persuasion: 4,
      suspicionLevel: "MEDIUM",
      riskFactors: ["10분 약속을 지켜야 합니다."],
    },
    aftermath: [
      {
        when: "오늘",
        dayOffset: 0,
        question: "PPT는 올라왔나요?",
        collapseRate: 30,
      },
    ],
    remember: ["10분 안에 공유하기"],
    replyOptions: options,
    selectedOptionIndex,
    thread: [
      {
        id: 41,
        roundNumber: 1,
        type: "ORIGINAL",
        incomingMessage: null,
        excuse: "발표 자료 확인이 늦었습니다.",
      },
      {
        id: 42,
        roundNumber: 2,
        type: "REPLY",
        incomingMessage: "그래서 지금 어떻게 할 건데?",
        excuse: options[selectedOptionIndex],
      },
    ],
    earnedXp: 50,
    complexityWarning: { enabled: false, message: "" },
    createdAt: "2026-07-14T00:00:00Z",
  };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("accessToken", "e2e-token");
    localStorage.setItem("tokenType", "Bearer");
    localStorage.setItem("nickname", "데모 사용자");
    localStorage.setItem("expiresAt", String(Date.now() + 3_600_000));
  });
});

test("선택한 답장 후보가 저장되고 새로고침 후에도 유지된다", async ({ page }) => {
  let savedIndex = 0;

  await page.route(/\/api\/excuses\/42(?:\/.*)?$/, async (route, request) => {
    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: 200, message: "성공", data: excuse(savedIndex) }),
      });
      return;
    }

    if (request.method() === "PATCH") {
      const body = request.postDataJSON();
      savedIndex = body.selectedExcuse === selectedOption ? 1 : 0;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: 200, message: "성공", data: excuse(savedIndex) }),
      });
      return;
    }

    await route.fallback();
  });

  await page.goto("/excuses/42");
  const selectedRadio = page.locator(`input[type="radio"][value="${selectedOption}"]`);
  await expect(selectedRadio).not.toBeChecked();

  await selectedRadio.check({ force: true });
  await expect(selectedRadio).toBeChecked();
  await expect.poll(() => savedIndex).toBe(1);

  await page.reload();
  await expect(page.locator(`input[type="radio"][value="${selectedOption}"]`)).toBeChecked();
});

test("이미 이어진 라운드에 다시 답장하면 충돌 안내를 보여준다", async ({ page }) => {
  await page.route(/\/api\/excuses\/42(?:\/.*)?$/, async (route, request) => {
    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: 200, message: "성공", data: excuse(0) }),
      });
      return;
    }
    if (request.method() === "POST") {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          status: 409,
          message: "가장 최근 라운드에서만 답장을 선택하거나 다음 답장을 준비할 수 있습니다.",
          data: null,
        }),
      });
      return;
    }
    await route.fallback();
  });

  await page.goto("/excuses/42");
  await page.getByRole("button", { name: "답장 준비하기" }).click();
  await page.getByLabel("상대방이 보낸 답장").fill("왜 아직 안 올렸어?");
  await page.getByRole("button", { name: "답장 생성하기" }).click();

  await expect(page.getByRole("alert")).toContainText("가장 최근 라운드");
});

test("긴 변명은 글자가 줄고 카드 밖으로 넘치지 않는다", async ({ page }) => {
  const longExcuse = "가".repeat(360);
  const payload = excuse(0);
  payload.excuse = longExcuse;
  payload.replyOptions = [longExcuse, longExcuse, longExcuse];
  payload.thread = payload.thread.map((item) => ({
    ...item,
    excuse: longExcuse,
  }));

  await page.route(/\/api\/excuses\/42(?:\/.*)?$/, async (route, request) => {
    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: 200, message: "성공", data: payload }),
      });
      return;
    }

    await route.fallback();
  });

  await page.goto("/excuses/42");

  const generatedExcuse = page.getByLabel("생성된 변명").locator("blockquote");
  await expect(generatedExcuse).toContainText(longExcuse);

  const layout = await generatedExcuse.evaluate((element) => ({
    fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
    fitsInsideCard: element.scrollWidth <= element.clientWidth + 1,
    pageHasNoHorizontalOverflow:
      document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  }));

  expect(layout.fontSize).toBeLessThanOrEqual(16);
  expect(layout.fitsInsideCard).toBe(true);
  expect(layout.pageHasNoHorizontalOverflow).toBe(true);
});
