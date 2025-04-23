// firebase-init.js

const firebaseConfig = {
    apiKey: "AIzaSyDaXzPtn5D3g9aR-pG3tkTJ5iwNz6t4QUY",
    authDomain: "davinityyy-site.firebaseapp.com",
    databaseURL: "https://davinityyy-site-default-rtdb.firebaseio.com",
    projectId: "davinityyy-site",
    storageBucket: "davinityyy-site.appspot.com",
    messagingSenderId: "997814757597",
    appId: "1:997814757597:web:116e0497395196939c1334",
    measurementId: "G-3BTBLBMRM5"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  window.db = firebase.database();
  window.incrementVisitorCount = firebase
    .app()
    .functions("us-central1")
    .httpsCallable("incrementVisitorCount");
  