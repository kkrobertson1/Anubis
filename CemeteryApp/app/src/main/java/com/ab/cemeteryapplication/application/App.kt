package com.ab.cemeteryapplication.application

import android.app.Application
import com.ab.cemeteryapplication.Utils.Prefs
import com.google.android.gms.ads.MobileAds
import com.google.firebase.FirebaseApp

class App : Application() {

    override fun onCreate() {
        super.onCreate()
        // Initialize FirebaseApp
        FirebaseApp.initializeApp(this)
        Prefs.Builder().setContext(this).setMode(MODE_PRIVATE).build()

    }
}