const { connect } = require("puppeteer-real-browser");

const url_browser = process.env.URL_BROWSER;
const url_email = process.env.URL_EMAIL;
const url = process.env.URL;
const minutos = parseInt(process.env.MINUTOS);
const num_browsers = parseInt(process.env.NUM_BROWSERS) || 1;
const delay = 10;
const senha = process.env.SENHA;

const setInput = async (page, selector, value) => {
  await page.$eval(
    selector,
    (el, value) => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      nativeInputValueSetter.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    value,
  );
};

const run = async () => {
  i = 0;
  // while (true) {
    const { browser, page } = await connect({
      headless: false,
      args: [],
      customConfig: {},
      turnstile: true,
      connectOption: {},
      disableXvfb: false,
      ignoreAllFlags: false,
      // proxy:{
      //     host:'',
      //     port:'',
      //     username:'',
      //     password:''
      // }
    });
    try {
      await page.goto(url_email, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('div[x-text="selectedEmail.address"]');
      const email = await page.$eval(
        'div[x-text="selectedEmail.address"]',
        (el) => el.textContent.trim(),
      );
      const pageTab = await browser.newPage();
      await pageTab.goto(`${url_browser}/auth/register`, {
        waitUntil: "domcontentloaded",
      });
      await new Promise((r) => setTimeout(r, 5000));
      await pageTab.waitForSelector("#firstname", { visible: true });
      await setInput(pageTab, "#firstname", "Rown");
      await setInput(pageTab, "#lastname", "Teoe");
      await setInput(pageTab, "#email", email);
      await setInput(pageTab, "#password", senha);
      await setInput(pageTab, "#repeatPassword", senha);
      await pageTab.click("#terms");
      await pageTab.click("button[type='submit']");
      await pageTab.waitForSelector("#code", { visible: true });
      await page.bringToFront();
      await page.waitForSelector("text=Browser.lol");
      await page.click("text=Browser.lol");
      const iframeElement = await page.waitForSelector("iframe[srcdoc]", {
        visible: true,
      });
      const frame = await iframeElement.contentFrame();
      await frame.waitForSelector(".verification-code", { visible: true });
      const code = await frame.$eval(".verification-code", (el) =>
        el.textContent.trim(),
      );
      await page.close();
      await pageTab.waitForSelector("#code", { visible: true });
      await setInput(pageTab, "#code", code);
      await pageTab.click("button[type='submit']");
      await new Promise((r) => setTimeout(r, 5000));
      await pageTab.goto(`${url_browser}/create`, {
        waitUntil: "domcontentloaded",
      });
      await new Promise((r) => setTimeout(r, 2000));
      await pageTab.waitForSelector("#url");
      await setInput(pageTab, "#url", url);
      await pageTab.click("button[type='submit']");
      await new Promise((r) => setTimeout(r, 20000));
      await pageTab.screenshot({ path: `screen.png`, fullPage: true });
      // await pageTab.screenshot({ path: `screen_${i + 1}.png`, fullPage: true });
      // i++;
      // console.log(`Email com sucesso: ${email} - ${i}/${num_browsers}`);
      if (i >= num_browsers) {
        break;
      }
    } catch (e) {
      console.log("erro");
      await browser.close();
    } finally {
      // await browser.close();
    }
  // }
};

run();
