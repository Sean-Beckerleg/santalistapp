# Release checklist

## Ready now
- [x] Package ID `com.sean.santalist`, versionCode managed by EAS (`appVersionSource: remote`, production `autoIncrement`)
- [x] Typecheck and expo-doctor clean
- [x] Privacy policy draft: `privacy-policy.md`
- [x] Store listing text: `play-listing.md`

## To do before the Play Console is verified
- [ ] Host the privacy policy at a public URL and add it to `play-listing.md`
- [ ] Create the 1024x500 feature graphic
- [ ] Take 2-8 phone screenshots from the emulator
- [ ] Make the 512x512 icon (resize `assets/icon.png`)
- [ ] Run `npx eas-cli@latest build -p android --profile production` (produces the .aab; EAS creates the signing key)
- [ ] Test the preview APK / production build on a real phone

## After verification
1. Create the app in Play Console (name, language, free app).
2. Complete the App content forms (privacy policy, ads, app access, content rating, target audience, data safety).
3. **Closed testing:** new personal developer accounts need 12+ testers opted in for 14 continuous days before applying for production access.
4. Upload the .aab with `npx eas-cli@latest submit -p android` (first upload may need to be done manually in the console and a Google service account key set up for later uploads).
5. After the 14-day test, apply for production access, then roll out.
