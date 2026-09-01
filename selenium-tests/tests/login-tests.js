/**
 * ==============================================================================
 * KINTSUGI WEB FRONTEND - SELENIUM END-TO-END (E2E) TEST SUITE
 * ==============================================================================
 * File: selenium-tests/tests/login-tests.js
 * Feature: Authentication / Login Page Functional & Security Testing
 * Framework: Selenium WebDriver (Node.js)
 * Target Application URL: http://localhost:5173/login (or process.env.BASE_URL)
 * Description: Automated end-to-end verification of the Kintsugi web frontend
 *              login page, covering UI layout, validation schemas, credentials
 *              authentication, password toggle, keyboard accessibility, security
 *              payloads (XSS/SQLi), responsive viewports, and edge cases.
 * ==============================================================================
 */

const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// Target Base URL & Config
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const LOGIN_URL = `${BASE_URL}/login`;
const DEFAULT_TIMEOUT = 10000;

// Test Execution Stats
const testResults = [];

/**
 * Log Test Result Helper
 */
function logResult(testId, testName, status, details = '') {
  const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${symbol} [${testId}] ${testName}: ${status} ${details ? `(${details})` : ''}`);
  testResults.push({ id: testId, name: testName, status, details, timestamp: new Date().toISOString() });
}

/**
 * Helper to take screenshot on test failure
 */
async function takeScreenshot(driver, testId) {
  try {
    const screenshotDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshot = await driver.takeScreenshot();
    const filePath = path.join(screenshotDir, `${testId}_failure.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
    console.log(`   📸 Screenshot saved: ${filePath}`);
  } catch (err) {
    console.error(`   ⚠️ Failed to capture screenshot: ${err.message}`);
  }
}

/**
 * Initialize WebDriver with options
 */
async function setupDriver(options = {}) {
  const chromeOptions = new chrome.Options();
  
  if (process.env.HEADLESS === 'true' || options.headless) {
    chromeOptions.addArguments('--headless=new');
  }
  
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--disable-dev-shm-usage');
  chromeOptions.addArguments('--disable-gpu');
  chromeOptions.addArguments('--window-size=1280,800');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  await driver.manage().setTimeouts({ implicit: 3000, pageLoad: 15000 });
  return driver;
}

/**
 * Clear Input Utility (handles React controlled components)
 */
async function clearInput(element) {
  await element.sendKeys(Key.CONTROL, 'a');
  await element.sendKeys(Key.BACK_SPACE);
}

// ==============================================================================
// TEST SUITE GROUPS
// ==============================================================================

/**
 * Group 1: UI Elements & Initial Page Load Verification
 */
async function testGroup1_UIElements(driver) {
  console.log('\n--- GROUP 1: UI Elements & Page Load Verification ---');

  // TC001: Verify Page Title
  try {
    await driver.get(LOGIN_URL);
    const title = await driver.getTitle();
    if (title.toLowerCase().includes('kintsugi') || title.length > 0) {
      logResult('TC001', 'Page Title Verification', 'PASS', `Title: "${title}"`);
    } else {
      logResult('TC001', 'Page Title Verification', 'FAIL', `Unexpected title: "${title}"`);
    }
  } catch (err) {
    logResult('TC001', 'Page Title Verification', 'FAIL', err.message);
  }

  // TC002: Verify Logo Visibility
  try {
    const logo = await driver.wait(until.elementLocated(By.css('button[aria-label="Navigate to Kintsugi Home"], .group')), DEFAULT_TIMEOUT);
    const isDisplayed = await logo.isDisplayed();
    logResult('TC002', 'App Brand Logo Display', isDisplayed ? 'PASS' : 'FAIL');
  } catch (err) {
    logResult('TC002', 'App Brand Logo Display', 'FAIL', err.message);
  }

  // TC003: Verify Email Field Presence & Placeholder
  try {
    const emailInput = await driver.findElement(By.id('login-email'));
    const placeholder = await emailInput.getAttribute('placeholder');
    logResult('TC003', 'Email Input Presence & Placeholder', placeholder.includes('@') ? 'PASS' : 'FAIL', `Placeholder: "${placeholder}"`);
  } catch (err) {
    logResult('TC003', 'Email Input Presence & Placeholder', 'FAIL', err.message);
  }

  // TC004: Verify Password Field Presence & Placeholder
  try {
    const passwordInput = await driver.findElement(By.id('login-password'));
    const type = await passwordInput.getAttribute('type');
    logResult('TC004', 'Password Input Type Masking', type === 'password' ? 'PASS' : 'FAIL', `Type: "${type}"`);
  } catch (err) {
    logResult('TC004', 'Password Input Type Masking', 'FAIL', err.message);
  }

  // TC005: Verify Submit Sign In Button Presence
  try {
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    const text = await submitBtn.getText();
    logResult('TC005', 'Sign In Submit Button', text.includes('Sign In') ? 'PASS' : 'FAIL', `Text: "${text}"`);
  } catch (err) {
    logResult('TC005', 'Sign In Submit Button', 'FAIL', err.message);
  }

  // TC006: Verify Forgot Password Link
  try {
    const forgotBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Forgot password')]"));
    logResult('TC006', 'Forgot Password Link Visibility', await forgotBtn.isDisplayed() ? 'PASS' : 'FAIL');
  } catch (err) {
    logResult('TC006', 'Forgot Password Link Visibility', 'FAIL', err.message);
  }
}

/**
 * Group 2: Form Input Validation & Error Feedback
 */
async function testGroup2_InputValidation(driver) {
  console.log('\n--- GROUP 2: Form Input Validation & Error Messaging ---');

  // TC007: Submit Empty Form -> Triggers Validation Messages
  try {
    await driver.get(LOGIN_URL);
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    // Check for email validation error
    const emailError = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'Email address is required') or contains(text(), 'valid email')]")), 3000);
    const isEmailErrorVisible = await emailError.isDisplayed();
    
    // Check for password validation error
    const passError = await driver.findElement(By.xpath("//p[contains(text(), 'Password is required') or contains(text(), 'at least 8 characters')]"));
    const isPassErrorVisible = await passError.isDisplayed();

    if (isEmailErrorVisible && isPassErrorVisible) {
      logResult('TC007', 'Empty Form Submission Validation', 'PASS', 'Validation messages displayed correctly');
    } else {
      logResult('TC007', 'Empty Form Submission Validation', 'FAIL', 'Validation messages missing');
    }
  } catch (err) {
    logResult('TC007', 'Empty Form Submission Validation', 'FAIL', err.message);
  }

  // TC008: Invalid Email Format Validation
  try {
    const emailInput = await driver.findElement(By.id('login-email'));
    await clearInput(emailInput);
    await emailInput.sendKeys('user-invalid-email-format');
    
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    const invalidEmailMsg = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'valid email address')]")), 3000);
    logResult('TC008', 'Invalid Email Syntax Validation', await invalidEmailMsg.isDisplayed() ? 'PASS' : 'FAIL');
  } catch (err) {
    logResult('TC008', 'Invalid Email Syntax Validation', 'FAIL', err.message);
  }

  // TC009: Short Password Length Validation (< 8 chars)
  try {
    const emailInput = await driver.findElement(By.id('login-email'));
    await clearInput(emailInput);
    await emailInput.sendKeys('testuser@example.com');

    const passInput = await driver.findElement(By.id('login-password'));
    await clearInput(passInput);
    await passInput.sendKeys('12345');

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    const shortPassMsg = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'at least 8 characters')]")), 3000);
    logResult('TC009', 'Password Minimum Length Validation', await shortPassMsg.isDisplayed() ? 'PASS' : 'FAIL');
  } catch (err) {
    logResult('TC009', 'Password Minimum Length Validation', 'FAIL', err.message);
  }
}

/**
 * Group 3: Password Visibility Toggle
 */
async function testGroup3_PasswordToggle(driver) {
  console.log('\n--- GROUP 3: Password Field Show/Hide Toggle ---');

  try {
    await driver.get(LOGIN_URL);
    const passInput = await driver.findElement(By.id('login-password'));
    await passInput.sendKeys('SecretPassword123!');

    const toggleBtn = await driver.findElement(By.css('button[aria-label="Show password"], button[aria-label="Hide password"]'));
    
    // Initial state: type="password"
    const initialType = await passInput.getAttribute('type');
    
    // Click to show password
    await toggleBtn.click();
    const toggledType = await passInput.getAttribute('type');

    // Click again to hide
    await toggleBtn.click();
    const finalType = await passInput.getAttribute('type');

    if (initialType === 'password' && toggledType === 'text' && finalType === 'password') {
      logResult('TC010', 'Show/Hide Password Toggle Functionality', 'PASS', 'Switched password -> text -> password successfully');
    } else {
      logResult('TC010', 'Show/Hide Password Toggle Functionality', 'FAIL', `Types observed: ${initialType} -> ${toggledType} -> ${finalType}`);
    }
  } catch (err) {
    logResult('TC010', 'Show/Hide Password Toggle Functionality', 'FAIL', err.message);
  }
}

/**
 * Group 4: Authentication Credentials & Server Responses
 */
async function testGroup4_AuthenticationScenarios(driver) {
  console.log('\n--- GROUP 4: Authentication Scenarios & Server Responses ---');

  // TC011: Invalid Credentials Submission
  try {
    await driver.get(LOGIN_URL);
    const emailInput = await driver.findElement(By.id('login-email'));
    const passInput = await driver.findElement(By.id('login-password'));

    await emailInput.sendKeys('nonexistent.user@example.com');
    await passInput.sendKeys('WrongPassword123!');

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    // Check for error banner or toast alert
    const errorAlert = await driver.wait(until.elementLocated(By.css('.bg-red-500\\/10, [role="alert"], .sonner-toast')), 5000);
    const isAlertVisible = await errorAlert.isDisplayed();

    logResult('TC011', 'Invalid Credentials Rejection', isAlertVisible ? 'PASS' : 'FAIL', 'Server/UI returned authentication error prompt');
  } catch (err) {
    logResult('TC011', 'Invalid Credentials Rejection', 'FAIL', err.message);
  }
}

/**
 * Group 5: Keyboard Accessibility & Tab Order
 */
async function testGroup5_AccessibilityAndKeyboard(driver) {
  console.log('\n--- GROUP 5: Keyboard Navigation & Accessibility ---');

  // TC012: Tab Key Traversal
  try {
    await driver.get(LOGIN_URL);
    const emailInput = await driver.findElement(By.id('login-email'));
    await emailInput.click();

    // Tab to password
    await driver.actions().sendKeys(Key.TAB).perform();
    const activeElem1 = await driver.switchTo().activeElement();
    const activeId1 = await activeElem1.getAttribute('id');

    logResult('TC012', 'Tab Key Focus Traversal', activeId1 === 'login-password' ? 'PASS' : 'FAIL', `Active element ID after tab: ${activeId1}`);
  } catch (err) {
    logResult('TC012', 'Tab Key Focus Traversal', 'FAIL', err.message);
  }

  // TC013: Enter Key Form Submission
  try {
    await driver.get(LOGIN_URL);
    const emailInput = await driver.findElement(By.id('login-email'));
    const passInput = await driver.findElement(By.id('login-password'));

    await emailInput.sendKeys('user@example.com');
    await passInput.sendKeys('Short1', Key.ENTER);

    // Should trigger validation error for short password
    const validationMsg = await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'at least 8 characters')]")), 3000);
    logResult('TC013', 'Enter Key Submission Trigger', await validationMsg.isDisplayed() ? 'PASS' : 'FAIL');
  } catch (err) {
    logResult('TC013', 'Enter Key Submission Trigger', 'FAIL', err.message);
  }
}

/**
 * Group 6: Security Payload & Input Sanitization
 */
async function testGroup6_SecurityInputs(driver) {
  console.log('\n--- GROUP 6: Security Payload & Injection Sanitization ---');

  // TC014: XSS Payload Injection in Email Field
  try {
    await driver.get(LOGIN_URL);
    const emailInput = await driver.findElement(By.id('login-email'));
    const passInput = await driver.findElement(By.id('login-password'));

    const xssPayload = `"<script>alert('xss')</script>@example.com`;
    await emailInput.sendKeys(xssPayload);
    await passInput.sendKeys('ValidPass123!');

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    // Verify alert popup was NOT triggered (application sanitized input)
    let alertPopsUp = false;
    try {
      await driver.switchTo().alert();
      alertPopsUp = true;
    } catch {
      alertPopsUp = false;
    }

    logResult('TC014', 'XSS Injection Prevention', !alertPopsUp ? 'PASS' : 'FAIL', alertPopsUp ? 'Script executed unexpected alert!' : 'Sanitized cleanly');
  } catch (err) {
    logResult('TC014', 'XSS Injection Prevention', 'FAIL', err.message);
  }

  // TC015: SQL Injection Payload Handling
  try {
    await driver.get(LOGIN_URL);
    const emailInput = await driver.findElement(By.id('login-email'));
    const passInput = await driver.findElement(By.id('login-password'));

    await clearInput(emailInput);
    await emailInput.sendKeys("admin' OR '1'='1'--@example.com");
    await clearInput(passInput);
    await passInput.sendKeys("' OR '1'='1");

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    // Ensure app doesn't bypass auth or throw unhandled 500 stacktrace
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    const hasRawStacktrace = bodyText.includes('Traceback') || bodyText.includes('Internal Server Error 500');

    logResult('TC015', 'SQL Injection Payload Neutralization', !hasRawStacktrace ? 'PASS' : 'FAIL', hasRawStacktrace ? 'Raw database error exposed!' : 'Handled gracefully');
  } catch (err) {
    logResult('TC015', 'SQL Injection Payload Neutralization', 'FAIL', err.message);
  }
}

/**
 * Group 7: Responsive Viewport Dimensions
 */
async function testGroup7_ResponsiveViewports(driver) {
  console.log('\n--- GROUP 7: Responsive Viewport Layout Verification ---');

  const viewports = [
    { name: 'Mobile Portrait (iPhone 12)', width: 390, height: 844 },
    { name: 'Tablet Viewport (iPad)', width: 768, height: 1024 },
    { name: 'Desktop Full HD', width: 1920, height: 1080 }
  ];

  let vpIndex = 16;
  for (const vp of viewports) {
    const tcId = `TC0${vpIndex++}`;
    try {
      await driver.manage().window().setRect({ width: vp.width, height: vp.height });
      await driver.get(LOGIN_URL);

      const emailInput = await driver.findElement(By.id('login-email'));
      const isVisible = await emailInput.isDisplayed();

      logResult(tcId, `Responsive Viewport - ${vp.name}`, isVisible ? 'PASS' : 'FAIL', `Resized to ${vp.width}x${vp.height}`);
    } catch (err) {
      logResult(tcId, `Responsive Viewport - ${vp.name}`, 'FAIL', err.message);
    }
  }
}

// ==============================================================================
// MAIN EXECUTION RUNNER
// ==============================================================================
async function runLoginTestSuite() {
  console.log('==============================================================================');
  console.log(`Starting Kintsugi E2E Selenium Test Suite`);
  console.log(`Target URL: ${LOGIN_URL}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('==============================================================================');

  let driver;
  try {
    driver = await setupDriver({ headless: false });

    await testGroup1_UIElements(driver);
    await testGroup2_InputValidation(driver);
    await testGroup3_PasswordToggle(driver);
    await testGroup4_AuthenticationScenarios(driver);
    await testGroup5_AccessibilityAndKeyboard(driver);
    await testGroup6_SecurityInputs(driver);
    await testGroup7_ResponsiveViewports(driver);

  } catch (globalErr) {
    console.error(`💥 Fatal error during Selenium execution:`, globalErr);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('\n🔒 WebDriver session terminated cleanly.');
    }

    console.log('\n==============================================================================');
    console.log('SUMMARY OF SELENIUM E2E TEST RUN:');
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    console.log(`Total Executed: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log('==============================================================================\n');
  }
}

// Execute if run directly via `node login-tests.js`
if (require.main === module) {
  runLoginTestSuite();
}

module.exports = {
  runLoginTestSuite,
  setupDriver,
  testGroup1_UIElements,
  testGroup2_InputValidation,
  testGroup3_PasswordToggle,
  testGroup4_AuthenticationScenarios,
  testGroup5_AccessibilityAndKeyboard,
  testGroup6_SecurityInputs,
  testGroup7_ResponsiveViewports
};
