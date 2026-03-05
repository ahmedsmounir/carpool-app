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
            time.sleep(10)

            page.screenshot(path="verification_debug.png", full_page=True)

        finally:
            browser.close()

if __name__ == "__main__":
    test_driver_dashboard()
