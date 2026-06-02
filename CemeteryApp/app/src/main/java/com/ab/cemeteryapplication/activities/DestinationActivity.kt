package com.ab.cemeteryapplication.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.IntentCompat
import com.ab.cemeteryapplication.R
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
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

        findViewById<Button>(R.id.buttonSaveToAnubis).setOnClickListener {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                Toast.makeText(
                    this,
                    "Location permission is required to save your current gravesite location.",
                    Toast.LENGTH_LONG
                ).show()
                return@setOnClickListener
            }

            // Request a FRESH GPS fix at the moment Save is tapped. lastLocation
            // returns whatever cached value is left over from the navigation SDK,
            // which would be the position when guidance ended (~50 ft from the
            // marker) rather than the user's actual position at the gravesite
            // after they walked the remaining distance.
            Toast.makeText(this, "Getting your current location…", Toast.LENGTH_SHORT).show()
            val fusedClient = LocationServices.getFusedLocationProviderClient(this)
            fusedClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
                .addOnSuccessListener { location ->
                    if (location == null) {
                        Toast.makeText(
                            this,
                            "Could not get your current location. Please try again.",
                            Toast.LENGTH_LONG
                        ).show()
                        return@addOnSuccessListener
                    }
                    val url = "https://www.anubiskemet2.com/dashboard/gravesite/new" +
                        "?lat=${location.latitude}&lng=${location.longitude}"
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                }
                .addOnFailureListener {
                    Toast.makeText(
                        this,
                        "Failed to get current location: ${it.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
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