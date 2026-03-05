import time
from playwright.sync_api import sync_playwright

def test_driver_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Wait for the frontend to be ready
        time.sleep(5)

        try:
            # Go to the local expo web server
            page.goto("http://localhost:8081")
            time.sleep(5)

            # Click "Sign Up" link
            page.get_by_text("Sign Up").first.click()
            time.sleep(2)

            # Fill registration
            page.locator('input[placeholder="Full Name"]').fill("Test Driver 4")
            page.locator('input[placeholder="Email"]').nth(1).fill("driver4@test.com")
            page.locator('input[placeholder="Password"]').nth(1).fill("password")

            # Click Driver role button
            page.get_by_text("Driver").click()
            time.sleep(1)

            # Find elements with text Sign Up
            for locator in page.get_by_text("Sign Up").all():
                try:
                    locator.click(timeout=1000)
                except Exception:
                    pass
            time.sleep(2)

            # We should be on the Driver Dashboard now
            # Handle standard JS alert which React Native Alert uses on web
            page.on("dialog", lambda dialog: dialog.accept())

            # Fill the new form
            page.locator('input[placeholder="e.g. Monday"]').fill("Monday")
            page.locator('input[placeholder="e.g. 8:00 AM"]').fill("8:00 AM")
            page.locator('input[placeholder="Enter starting location"]').fill("Downtown")
            page.locator('input[placeholder="Enter destination"]').fill("Campus")
            page.locator('input[placeholder="e.g. 3"]').fill("3")
            page.locator('input[placeholder="e.g. 15.00"]').fill("15.00")

            page.get_by_text("Post Ride").click()
            time.sleep(4)

            # Use mouse wheel to scroll in the scrollview directly
            page.mouse.wheel(0, 500)
            time.sleep(2)

            # Take screenshot of the result showing the form and the new list item
            page.screenshot(path="verification.png")

        finally:
            browser.close()

if __name__ == "__main__":
    test_driver_dashboard()
