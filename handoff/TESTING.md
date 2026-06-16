# Everyday â€?Testing Guide

Everything you need to test Everyday, from "see it on my laptop in 10 seconds" to
"my testers are running it on real phones via TestFlight / Play Store."

---

## 0. The fastest look (no tools)

Double-click:
- **macOS:** `start.command`  (first time: right-click â†?**Open**)
- **Windows:** `start.bat`

A browser opens at `http://localhost:8080/index.html?app=1` running the full app.
Or, with no server at all, just open `www/index.html` directly in a browser.

> Needs Python or Node installed for the launcher. Most Macs already have Python.

---

## 1. Test it on YOUR phone (no Xcode, ~2 min)

1. Run the launcher above on your computer (keep the window open).
2. Find your computer's local IP:
   - macOS: **System Settings â†?Wi-Fi â†?Details â†?IP Address** (e.g. `192.168.1.20`)
   - Windows: run `ipconfig`, use the **IPv4 Address**
3. On your phone (same Wi-Fi) open: `http://YOUR-IP:8080/index.html?app=1`
4. Browser menu â†?**Add to Home Screen**. It installs as a Everyday icon and opens
   full-screen, just like a store app. Great for quick demos.

---

## 2. Test on real devices via the stores (the "proper" beta)

This is how you give the app to other people to test. Cross-platform â€?do iOS,
Android, or both.

### Accounts & tools you'll need
| For | You need | Cost |
|-----|----------|------|
| iOS / TestFlight | Apple Developer Program + a Mac with Xcode | $99 / year |
| Android / Play testing | Google Play Developer account + Android Studio | $25 once |

Run the `README.md` build steps first so `ios/` and `android/` projects exist.

### iOS â†?TestFlight
1. Open the project: `npx cap open ios`
2. In Xcode: pick your **Team** under Signing, set **version** (1.0) + **build** (1).
3. **Product â†?Archive** â†?**Distribute App â†?App Store Connect â†?Upload**.
4. Go to **appstoreconnect.apple.com â†?your app â†?TestFlight**.
5. **Internal testers** (up to 100, people on your team): add by email, they get the
   build immediately.
   **External testers** (up to 10,000, public link): submit the build for a short
   beta review (~1 day), then share the invite link.
6. Testers install the **TestFlight** app from the App Store and tap your invite.

### Android â†?Play Internal Testing
1. Open the project: `npx cap open android`
2. **Build â†?Generate Signed Bundle / APK â†?Android App Bundle (.aab)**. Create a
   keystore and **save it + its passwords** (you reuse it for every update).
3. Go to **play.google.com/console â†?your app â†?Testing â†?Internal testing â†?   Create release**, upload the `.aab`.
4. Add testers (an email list), copy the **opt-in link**, share it.
5. Testers open the link, accept, and install from the Play Store.

> Mock data is fine for TestFlight and Play internal testing. (Public release is a
> bigger step â€?see section 4.)

---

## 3. QA checklist â€?what to actually test in the app

Walk through these on each device:

**Lock / auth**
- [ ] First launch shows **Create a passcode**; entering 4 digits â†?**Confirm** â†?same
      4 digits unlocks to Capital home.
- [ ] Wrong confirm digits â†?shake + restart. 
- [ ] Close & reopen the app (cold start) â†?asks to **Enter passcode**; correct code
      unlocks; **Face ID** icon unlocks instantly (mock).
- [ ] Profile â†?**Sign out** â†?returns to the lock screen.

**Capital home**
- [ ] Balance shows; eye icon hides/reveals amounts.
- [ ] **Top up**: enter amount â†?choose source (bank / mobile money) â†?review â†?green
      success â†?**Back to Capital**.
- [ ] **Withdraw** and **Move funds** complete the same way.

**Ventures**
- [ ] Three funds appear: **Manufacturing & Operations**, **Services & Consumer
      Brands**, **REIT Fund**.
- [ ] Tapping a fund **expands in place** (no new page) showing: Invest in the fund /
      Invest with an expert / the member companies / View full report.
- [ ] Company membership is right (Mfg&Ops: Blessed Dairy, Great Lakes Logistics â€?      Services: Maran Design, TPNN, EXP.AFRICA â€?REIT: Shine Group, Heza Estate,
      Savannah Creek).
- [ ] **Invest in the fund** / **with an expert** / a **single company** each open
      checkout with the matching banner, reach the green confirmation.

**Native behaviour**
- [ ] App fills the screen â€?no simulated phone frame, content clears the notch and
      home indicator.
- [ ] **Offline test:** enable Airplane Mode and relaunch â€?the app still opens and
      works (data is bundled).
- [ ] **Persistence:** navigate somewhere, force-quit, reopen â†?returns to where you
      were; passcode still set.
- [ ] Portrait orientation throughout; buttons reachable with a thumb.

**Push (only after you wire it â€?see README)**
- [ ] App asks for notification permission after unlock.
- [ ] A test push from APNs/FCM is received.

---

## 4. Before PUBLIC store release (not needed for testing)

Public release of an **investment** app is a bigger gate than beta testing. Reviewers
(Apple 3.2.1 / Google financial-services policy) typically expect:

- [ ] The app published by a **registered/licensed financial entity** (often with docs).
- [ ] **Real backend + KYC/AML**, not mock data (see README "Going to production").
- [ ] **Real payment rails** for top-ups/withdrawals/investing.
- [ ] Privacy policy + Apple privacy labels / Google Data Safety form.
- [ ] Support URL and accurate listing screenshots.

Keep beta (TestFlight / internal) running with mock data while that work happens.

---

## Quick reference

| I want toâ€?| Do this |
|---|---|
| See it on my computer | Double-click `start.command` / `start.bat` |
| See it on my phone now | Section 1 (Add to Home Screen) |
| Give it to testers, iOS | Section 2 â†?TestFlight |
| Give it to testers, Android | Section 2 â†?Play Internal Testing |
| Know what to test | Section 3 checklist |
| Go live publicly | Section 4 + README production steps |
