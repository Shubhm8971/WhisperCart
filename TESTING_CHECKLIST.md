# WhisperCart Testing Checklist ✅

## 🎯 Current Status: READY FOR TESTING

### ✅ Backend Tests Completed
- [x] Privacy endpoints working correctly
- [x] Privacy mode transcription functional
- [x] Data management endpoints operational
- [x] MongoDB integration confirmed

### 📱 Mobile App Status
- [x] App running on development server
- [x] Metro bundler active (http://localhost:8081)
- [x] Background audio service integrated
- [x] Privacy settings component added

## 🧪 Manual Testing Steps

### Step 1: Access the App
1. **Open Web Version**: Navigate to http://localhost:8081
2. **Or Use Expo Go**: Scan QR code with Expo Go app
3. **Or Use Android Emulator**: Press 'a' in terminal

### Step 2: Test Privacy Settings
1. Navigate to **Profile** tab
2. Look for **"Background Listening"** toggle
3. **Test Enable**:
   - Toggle ON → Should show consent dialog
   - Accept → Toggle stays ON
4. **Test Disable**:
   - Toggle OFF → Should turn OFF immediately

### Step 3: Test Privacy Settings Modal
1. In Profile, tap **"Privacy Settings"**
2. Verify all settings are visible:
   - Background Listening
   - Only When App Active
   - Delete After Processing
   - Show Listening Indicator
3. Test each toggle
4. Tap **"Clear All Voice Data"** to test deletion

### Step 4: Test Audio Processing
1. Go to main screen (Home tab)
2. Look for microphone/recording button
3. **Test Manual Recording**:
   - Tap microphone
   - Speak: "I want to buy Nike shoes under ₹3000"
   - Stop recording
   - Should see product results

### Step 5: Test Background Listening (Advanced)
1. Enable Background Listening in settings
2. Look for green listening indicator at top
3. Speak shopping intent phrases:
   - "I need a new laptop"
   - "Looking for headphones under ₹2000"
   - "Want to buy winter clothes"
4. Check if notifications appear

### Step 6: Test Privacy Protection
1. Enable Background Listening
2. Speak non-shopping phrases:
   - "Hello, how are you?"
   - "The weather is nice today"
   - "I'm going to the gym"
3. Verify these are NOT stored in history

## 🔍 Expected Behaviors

### Privacy Settings
- ✅ Consent dialog appears on first enable
- ✅ Settings persist after app restart
- ✅ Background listening can be toggled easily
- ✅ Data deletion works properly

### Audio Processing
- ✅ Manual recording works
- ✅ Shopping intent is detected correctly
- ✅ Non-shopping conversations are ignored
- ✅ Results appear in appropriate format

### Visual Indicators
- ✅ Green indicator shows when listening
- ✅ Indicator disappears when stopped
- ✅ Settings are clearly labeled
- ✅ Privacy commitments are visible

## 🐛 Common Issues to Watch For

### Permission Issues
- Microphone permission denied
- Background app refresh disabled
- iOS background permissions missing

### Performance Issues
- High battery usage
- Memory leaks
- Excessive network calls

### Privacy Issues
- Non-shopping data being stored
- Settings not persisting
- Data deletion not working

## 📊 Test Results Template

Copy and fill this template for your testing:

```
## Test Results - [Date]

### Device Information
- Device: [iOS/Android/Emulator/Web]
- OS Version: [e.g., iOS 16.1, Android 13]
- App Version: [Development]

### Privacy Settings Tests
- [ ] Background Listening Enable/Disable: ✅/❌
- [ ] Consent Dialog: ✅/❌
- [ ] Settings Persistence: ✅/❌
- [ ] Data Deletion: ✅/❌

### Audio Processing Tests
- [ ] Manual Recording: ✅/❌
- [ ] Shopping Intent Detection: ✅/❌
- [ ] Non-Shopping Privacy: ✅/❌
- [ ] Background Listening: ✅/❌

### UI/UX Tests
- [ ] Listening Indicator: ✅/❌
- [ ] Settings Navigation: ✅/❌
- [ ] Error Handling: ✅/❌

### Issues Found
1. [Describe any issues]
2. [Include screenshots if possible]
3. [Note any error messages]

### Performance Notes
- Battery Usage: [Low/Medium/High]
- App Responsiveness: [Good/Fair/Poor]
- Network Usage: [Minimal/Moderate/High]
```

## 🚀 Next Steps After Testing

1. **Document all findings** in the template above
2. **Fix any critical issues** before proceeding
3. **Optimize performance** based on observations
4. **Prepare for beta testing** with real users
5. **Finalize privacy features** for market launch

---

## 🎯 Success Metrics

### Must Achieve
- Privacy settings work flawlessly
- Shopping intent detection > 80% accuracy
- Non-shopping conversations are never stored
- User can easily control all features

### Should Achieve
- Battery impact < 5% per hour
- Memory usage stable
- Fast response times (< 2 seconds)

### Nice to Have
- Zero crashes during testing
- Intuitive user interface
- Comprehensive error messages

---

**Ready to test!** The app is running and all endpoints are functional. Start with the basic privacy settings tests and work your way through the checklist.
