import { expect, test } from "@playwright/test";

test("A guest can browse public competition and login back into registration", async ({ page }) => {
  await page.goto("/home?guest=1");
  await expect(page.getByText("未登录", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "发现比赛" }).click();
  await expect(page.getByRole("heading", { name: "赛事", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await page.getByRole("button", { name: "登录后报名" }).click();
  await expect(page.getByRole("heading", { name: "登录", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "使用原型账号登录" }).click();
  await expect(page.getByRole("heading", { name: "赛事报名", exact: true })).toBeVisible();
});

test("B registration returns pending, approval, workspace and competition-scoped benefits", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: /原型账号：多赛事身份/ }).click();
  await expect(page.getByRole("button", { name: /原型账号：无赛事身份/ })).toBeVisible();
  await page.getByRole("button", { name: "发现比赛" }).click();
  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await page.getByRole("button", { name: "进入报名" }).click();
  await page.getByRole("button", { name: "进入响应式报名（模拟）" }).click();
  await page.getByRole("button", { name: "模拟提交并回流 App" }).click();
  await expect(page.getByText("报名已提交，等待学校审核真实性", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟审核通过" }).click();
  await expect(page.getByRole("heading", { name: "赛事工作区", exact: true })).toBeVisible();
  await expect(page.getByText("身份：active · 团队：山城新零售队", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /赛事权益/ }).click();
  await expect(page.getByRole("heading", { name: "赛事权益", exact: true })).toBeVisible();
  await expect(page.getByText("赛道路演课学习资格", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "赛事工作区", exact: true })).toBeVisible();
});

test("C workshop task keeps task identity through answer, generation and result", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: "进入当前赛事" }).click();
  await expect(page.getByRole("heading", { name: "赛事工作区", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "继续下一步" }).click();
  await expect(page.getByRole("heading", { name: "任务答题", exact: true })).toBeVisible();
  await page.getByPlaceholder("写下团队当前真实情况…").fill("已有真实用户反馈和竞品截图，当前重点验证校园渠道的购买转化。");
  await page.getByRole("button", { name: "保存回答并检查生成内容" }).click();
  await expect(page.getByRole("heading", { name: "生成确认", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认并生成" }).click();
  await expect(page.getByRole("heading", { name: "任务进度", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行" }).click();
  await page.getByRole("button", { name: "模拟生成完成" }).click();
  await page.getByRole("button", { name: "查看本任务成果" }).click();
  await expect(page.getByRole("heading", { name: "成果详情", exact: true })).toBeVisible();
  await expect(page.getByText(/S2 · 完成市场可行性诊断/)).toBeVisible();
});

test("D opportunity-company-resume-returnTo-application stays continuous", async ({ page }) => {
  await page.goto("/opportunities/intern-1");
  await expect(page.getByRole("heading", { name: "机会详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /北辰美妆 · 查看企业/ }).click();
  await expect(page.getByRole("heading", { name: "企业详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "机会详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "使用长期简历投递" }).click();
  await page.getByRole("button", { name: "查看长期简历" }).click();
  await expect(page.getByRole("heading", { name: "长期简历", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "编辑表达" }).first().click();
  await expect(page.getByRole("heading", { name: "个人优势", exact: true })).toBeVisible();
  await page.locator("textarea").fill("有真实赛事项目协作、用户验证和数据复盘经历，能把结论落到可验证行动。");
  await page.getByRole("button", { name: "保存表达" }).click();
  await page.getByRole("button", { name: "返回机会继续投递" }).click();
  await expect(page.getByRole("heading", { name: "机会详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "使用长期简历投递" }).click();
  await page.getByRole("button", { name: "确认投递" }).click();
  await expect(page.getByRole("heading", { name: "投递记录", exact: true })).toBeVisible();
  await expect(page.getByText("已投递", { exact: true })).toBeVisible();
});

test("E ended competition hands off to long-term experience and trusted result", async ({ page }) => {
  await page.goto("/competitions/sanchuang-15/workspace");
  await expect(page.getByText("赛事期权限已回收", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "查看参赛经历" }).click();
  await expect(page.getByRole("heading", { name: "赛事经历", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /第十五届三创赛/ }).click();
  await expect(page.getByRole("heading", { name: "参赛经历", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /成绩 \/ 成果/ }).click();
  await expect(page.getByRole("heading", { name: "成绩与可信成果", exact: true })).toBeVisible();
  await expect(page.getByText("校赛一等奖", { exact: true })).toBeVisible();
});

test("competition list filter survives detail-return navigation", async ({ page }) => {
  await page.goto("/competitions");
  await page.getByRole("button", { name: "报名中" }).click();
  await expect(page.getByRole("link", { name: /第十五届三创赛/ })).toHaveCount(0);
  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "赛事", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /第十五届三创赛/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /第十六届全国大学生电子商务/ })).toBeVisible();
});

test("unknown path is exposed as an explicit dead-link", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByText("404 / dead-link", { exact: true })).toBeVisible();
  await expect(page.getByText("/definitely-not-a-route", { exact: true })).toBeVisible();
});
