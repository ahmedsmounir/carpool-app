from playwright.sync_api import sync_playwright
import time
import os

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to frontend
        page.goto("http://localhost:8081")

        # Wait for app to load
        page.wait_for_selector("text=Welcome Back", timeout=5000)

        # Click Sign Up link
        page.locator("text='Sign Up'").click()

        # Wait for Register screen
        page.wait_for_selector("text=Create Account")
        page.wait_for_timeout(1000)

        # Fill in valid email
        page.locator("input[placeholder='Full Name']").last.fill("Test User")
        page.locator("input[placeholder='Email']").last.fill("test43@giu-uni.de")
        page.locator("input[placeholder='Password']").last.fill("password")

        # Click Sign Up button
        page.locator("text='Sign Up'").last.click()

        # Wait for Verify Email screen
        try:
            page.wait_for_selector("text=Verify Email", timeout=5000)
            print("Successfully entered OTP screen.")

            # Find the generated OTP in the server log
            time.sleep(1) # wait for log to be written
            otp_code = None
            with open("server_output.log", "r") as f:
                lines = f.readlines()
                for line in lines:
                    if "Generated OTP for test43@giu-uni.de" in line:
                        otp_code = line.strip().split(":")[-1].strip()

            if otp_code:
                # Type the OTP code
                page.locator("input[placeholder='000000']").fill(otp_code)
                page.locator("text='Verify'").click()

                # Wait for navigation to PartnerSearch or DriverDashboard (which has 'Logout' header or 'College Carpool App')
                # Wait for partner search text or whatever is rendered for the authenticated state
                page.wait_for_selector("text=Partner Search", timeout=5000)
                page.screenshot(path="verification.png")
                print("Successfully logged in after verification.")
            else:
                print("OTP not found in log")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_debug24.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()