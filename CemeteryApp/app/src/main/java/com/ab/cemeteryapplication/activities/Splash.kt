package com.ab.cemeteryapplication.activities

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.ab.cemeteryapplication.R
import com.ab.cemeteryapplication.onBoarding.OnBoardingActivity

class Splash : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        Handler(Looper.getMainLooper()).postDelayed({
            when {
                OnBoardingActivity.showOnBoard() -> startActivity(
                    Intent(
                        this@Splash,
                        OnBoardingActivity::class.java
                    )
                )
                else -> startActivity(Intent(this@Splash, MainActivity::class.java))
            }
            finish()
        }, 1000)
    }
}