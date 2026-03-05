from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the frontend
        page.goto("http://localhost:8081")

        # Wait for the login screen to load
        page.wait_for_selector('text="Welcome Back"', timeout=15000)

        # Click on Sign Up
        page.get_by_text("Sign Up").click()

        # Wait for the registration screen
        page.wait_for_selector('text="Create Account"')

        # Fill in the form
        page.get_by_placeholder("Full Name").last.fill("Test User")
        page.get_by_placeholder("Email").last.fill("test@example.com")
        page.get_by_placeholder("Password").last.fill("password123")

        # Select Role
        page.get_by_text("Driver").click()

        # Take a screenshot
        page.screenshot(path="verification.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()