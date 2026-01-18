# WhisperCart Background Audio Testing Guide

## 🧪 Testing Overview

This guide provides comprehensive testing steps for the background audio processing implementation with privacy controls.

## 📱 Manual Testing Steps

### 1. Privacy Settings Testing

#### Test 1.1: Privacy Settings Initialization
1. **Fresh Install Test**
   - Delete app and reinstall
   - Navigate to Profile → Privacy Settings
   - **Expected**: All toggles should be in default positions (Background Listening: OFF, Delete After Processing: ON, etc.)

#### Test 1.2: Background Listening Toggle
1. **Enable Background Listening**
   - Go to Profile → Privacy Settings
   - Toggle "Background Listening" to ON
   - **Expected**: Detailed consent dialog appears
   - **Expected**: After accepting, toggle stays ON

2. **Disable Background Listening**
   - Toggle "Background Listening" to OFF
   - **Expected**: Toggle immediately turns OFF
   - **Expected**: Any active listening stops

#### Test 1.3: Granular Privacy Controls
1. **Test Each Setting**
   - Enable Background Listening
   - Toggle each individual setting:
     - "Only When App Active"
     - "Delete After Processing" 
     - "Show Listening Indicator"
   - **Expected**: Each setting persists after app restart

### 2. Audio Recording Testing

#### Test 2.1: Basic Recording
1. **Start Manual Recording**
   - Open app, go to main screen
   - Tap microphone button (if available)
   - Speak: "I want to buy Nike shoes under ₹3000"
   - Stop recording
   - **Expected**: Product search results appear with shoes

#### Test 2.2: Background Listening
1. **Enable Background Listening**
   - Go to Profile → Privacy Settings
   - Enable "Background Listening" with consent
   - **Expected**: Green listening indicator appears at top

2. **Test Intent Detection**
   - With app in background, speak clearly: "I need a new laptop under ₹50000"
   - Return to app
   - **Expected**: Notification about laptop deals appears
   - **Expected**: History shows the detected intent

3. **Test Non-Shopping Conversations**
   - With background listening active, speak: "Hello, how are you today?"
   - **Expected**: No shopping intent detected
   - **Expected**: Conversation not stored in history (privacy protection)

### 3. Privacy Controls Testing

#### Test 3.1: Data Deletion
1. **Clear Voice Data**
   - Go to Profile → Privacy Settings
   - Tap "Clear All Voice Data"
   - Confirm deletion
   - **Expected**: All voice recordings removed from history
   - **Expected**: Shopping intent data remains (if any)

#### Test 3.2: Data Export
1. **Export User Data**
   - Go to Profile → Privacy Settings
   - Look for export option (if implemented)
   - **Expected**: Downloadable JSON with all user data

### 4. Backend Testing

#### Test 4.1: Privacy Mode Processing
1. **Test Privacy Endpoint**
   ```bash
   curl -X POST http://localhost:3002/transcribe \
   -H "Content-Type: application/json" \
   -d '{
     "text": "I want to buy headphones",
     "privacyMode": true
   }'
   ```
   - **Expected**: Response includes `isPrivacyMode: true`

#### Test 4.2: Privacy Management
1. **Test Data Summary**
   ```bash
   curl http://localhost:3002/privacy/summary/test-user-123
   ```
   - **Expected**: JSON with voice recordings count, shopping history count

2. **Test Data Deletion**
   ```bash
   curl -X DELETE http://localhost:3002/privacy/delete-voice/test-user-123
   ```
   - **Expected**: Voice data deleted, shopping history preserved

## 🔧 Automated Testing

### Frontend Tests
```bash
cd WhisperCart
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

## 📊 Performance Testing

### Memory Usage Test
1. Enable background listening
2. Monitor app memory usage for 1 hour
3. **Expected**: Memory usage remains stable (< 100MB increase)

### Battery Usage Test
1. Enable background listening
2. Monitor battery drain for 30 minutes
3. **Expected**: Minimal battery impact (< 5% per hour)

### Network Usage Test
1. Enable background listening
2. Monitor network data usage
3. **Expected**: Only transmits when shopping intent detected

## 🐛 Common Issues & Solutions

### Issue 1: Permission Denied
**Symptoms**: App crashes when trying to record
**Solution**: 
- Check microphone permissions in device settings
- Ensure app has background app refresh permission

### Issue 2: No Intent Detection
**Symptoms**: Background listening active but no intents detected
**Solution**:
- Check internet connection
- Verify backend is running
- Check Deepgram API credentials

### Issue 3: Privacy Settings Not Saving
**Symptoms**: Settings reset after app restart
**Solution**:
- Check AsyncStorage implementation
- Verify no errors in console logs

### Issue 4: High Battery Usage
**Symptoms**: Battery drains quickly with background listening
**Solution**:
- Optimize audio processing intervals
- Implement better voice activity detection

## ✅ Success Criteria

### Must Pass
- [ ] Privacy settings work correctly
- [ ] Background listening detects shopping intent
- [ ] Non-shopping conversations are not stored
- [ ] User can easily enable/disable features
- [ ] Data deletion works properly

### Should Pass
- [ ] Listening indicator appears/disappears correctly
- [ ] App permissions are handled gracefully
- [ ] Performance impact is minimal
- [ ] Backend privacy endpoints work

### Nice to Have
- [ ] Data export functionality works
- [ ] Audit logging is complete
- [ ] Error handling is user-friendly

## 📝 Test Reporting

For each test, document:
1. **Test Date & Time**
2. **Device Used** (iOS/Android, version)
3. **Test Results** (Pass/Fail)
4. **Issues Found**
5. **Screenshots** (if applicable)
6. **Performance Metrics** (memory, battery, network)

## 🚀 Next Steps After Testing

1. **Fix any failing tests**
2. **Optimize performance based on metrics**
3. **Improve user experience based on findings**
4. **Prepare for beta user testing**
5. **Document any known limitations**

---

**Remember**: Privacy is your key differentiator. Ensure all privacy features work flawlessly before proceeding to market launch.
