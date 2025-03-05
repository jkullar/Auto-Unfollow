// ==UserScript==
// @name         LinkedIn Unfollow All Companies (Background)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Unfollow all LinkedIn companies even when in the background.
// @author       You
// @match        https://www.linkedin.com/mynetwork/network-manager/company/
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    async function unfollowVisibleCompanies() {
        let buttons = Array.from(document.querySelectorAll('button')).filter(btn => btn.innerText.trim() === "Following");

        if (buttons.length === 0) return false; // No more companies to unfollow

        console.log(`Found ${buttons.length} companies to unfollow on the current page.`);

        for (let btn of buttons) {
            btn.click(); // Click "Following" button
            console.log("Clicked 'Following' button");

            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for popup

            // Target the "Unfollow" button using the full class name
            let unfollowBtn = document.querySelector('button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view.artdeco-modal__confirm-dialog-btn');

            if (unfollowBtn) {
                unfollowBtn.click();
                console.log("Clicked 'Unfollow' button.");
                await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for UI update
            }
        }

        return true; // Companies were unfollowed
    }

    async function scrollDown() {
        console.log("Scrolling down...");
        let lastHeight = document.body.scrollHeight;

        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for elements to load

        return document.body.scrollHeight > lastHeight; // Return true if new content loaded
    }

    async function startUnfollowing() {
        console.log("Starting the LinkedIn unfollow process...");

        while (true) {
            if (document.hidden) {
                console.log("Tab is in the background. Waiting...");
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait before retrying
                continue;
            }

            let unfollowed = await unfollowVisibleCompanies();
            let scrolled = await scrollDown();

            if (!unfollowed && !scrolled) {
                console.log("No more companies to unfollow. Process complete.");
                break;
            }
        }

        console.log("Finished unfollowing all companies.");
    }

    function keepAlive() {
        if (document.hidden) {
            console.log("Keeping script alive in the background...");
            startUnfollowing();
        }
    }

    document.addEventListener("visibilitychange", keepAlive); // Runs when tab is switched
    setTimeout(startUnfollowing, 3000); // Start after 3 seconds
})();
