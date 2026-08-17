import { expect, test } from "@playwright/test";

test("standalone registration portal completes leader flow on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/registration-portal/start");
  await expect(page.getByRole("heading", { name: "三创赛报名", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: /我是队长/ }).click();
  await expect(page.getByRole("heading", { name: "三创队长注册", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "注册并进入答题" }).click();

  await expect(page.getByRole("heading", { name: "三创注册答题", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /B\. 等待审核结果/ }).click();
  await page.getByRole("button", { name: "提交答题" }).click();

  await expect(page.getByRole("heading", { name: "注册成功", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "进入团队报名" }).click();
  await expect(page.getByRole("heading", { name: "团队信息", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "添加成员" }).click();
  await expect(page.getByRole("heading", { name: "添加团队成员", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "添加", exact: true }).click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();

  await expect(page.getByText("张三", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "提交审核" }).click();
  await expect(page.getByText("报名已提交，等待学校审核真实性", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "模拟审核通过" }).click();
  await expect(page.getByText("团队主体与成员信息已通过学校审核。继续填写项目承诺书，完成赛事报名材料。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "填写承诺书" }).click();

  await expect(page.getByRole("heading", { name: "承诺书", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "生成承诺书" }).click();
  await page.getByRole("button", { name: "确认承诺书并完成报名" }).click();

  await expect(page.getByText("完整报名流程已完成", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "团队业绩报告" }).click();
  await expect(page.getByRole("heading", { name: "团队业绩报告", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "提交团队业绩报告" }).click();
  await expect(page.getByText("业绩报告已提交，可在截止前更新。", { exact: true })).toBeVisible();

  await page.goto("/registration-portal/certificates");
  await expect(page.getByText("第十六届三创赛 · 校赛参赛证书", { exact: true })).toBeVisible();
});

test("standalone registration portal keeps member branch usable on mobile", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await page.getByRole("button", { name: /我是队员/ }).click();
  await expect(page.getByRole("heading", { name: "三创队员注册", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "注册并进入答题" }).click();
  await page.getByRole("button", { name: /B\. 等待审核结果/ }).click();
  await page.getByRole("button", { name: "提交答题" }).click();
  await expect(page.getByText("注册成功，请等待队长绑定团队信息", { exact: true })).toBeVisible();
  await expect(page.getByText(/队长可通过你注册使用的邮箱/)).toBeVisible();
});
