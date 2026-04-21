package com.ab.cemeteryapplication.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.IntentCompat
import com.ab.cemeteryapplication.R
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.libraries.navigation.RoutingOptions
import com.google.android.material.button.MaterialButtonToggleGroup

class DestinationActivity : AppCompatActivity() {
    private lateinit var dest: LatLng
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_destination)
        val d = intent?.let { i ->
            IntentCompat.getParcelableExtra(
                i,
                EXTRA_DEST,
                LatLng::class.java
            )
        }
        if (d == null) {
            finish()
            return
        } else {
            dest = d
        }

        val toggleButtonType = findViewById<MaterialButtonToggleGroup>(R.id.toggleButtonType)

        findViewById<Button>(R.id.buttonStartGuidance).setOnClickListener {
            startActivity(
                Intent(this, NavFragmentActivity::class.java)
                    .putExtra(
                        NavFragmentActivity.EXTRA_DEST,
                        dest
                    ).also {
                        if (toggleButtonType.checkedButtonId == R.id.buttonWalk) {
                            it.putExtra(
                                NavFragmentActivity.EXTRA_TYPE,
                                RoutingOptions.TravelMode.WALKING
                            )
                        }
                    }
            )
        }

        val mapDestination =
            supportFragmentManager.findFragmentById(R.id.mapDestination) as SupportMapFragment

        mapDestination.getMapAsync { map ->
            if (ContextCompat.checkSelfPermission(
                    this@DestinationActivity,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                map.isMyLocationEnabled = true
            }
            val marker = map.addMarker(
                MarkerOptions()
                    .position(dest)
                    .title(getString(R.string.destination))
                    .snippet(dest.toString())
            )
            map.moveCamera(
                CameraUpdateFactory.newLatLngZoom(
                    dest, 16f
                )
            )
            map.setOnMapClickListener {
                dest = it
                marker?.apply {
                    position = it
                    snippet = it.toString()
                }
            }
        }
    }

    companion object {
        const val EXTRA_DEST = "EXTRA_DEST"
    }
}