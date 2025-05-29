const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.incrementVisitorCount = functions.https.onCall(async (data, context) => {
  const ref = admin.database().ref("visitorCount");
  const newCount = await ref.transaction(current => (current || 0) + 1);
  return { newCount: newCount.snapshot.val() };
});

exports.incrementMemoryGameWins = functions.https.onCall(async (data, context) => {
  const ref = admin.database().ref("memoryGameWins");
  const newCount = await ref.transaction(current => (current || 0) + 1);
  return { newCount: newCount.snapshot.val() };
});
