package com.ab.cemeteryapplication.activities

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import com.ab.cemeteryapplication.R
import com.ab.cemeteryapplication.Utils.CustomInfoWindowAdapter
import com.ab.cemeteryapplication.Utils.SpinnerDialog
import com.ab.cemeteryapplication.dto.Cemeteries
import com.ab.cemeteryapplication.viewmodels.MainViewModel
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.MarkerOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch


class MainActivity : AppCompatActivity(), OnMapReadyCallback {
    private val mainViewModel: MainViewModel by viewModels()
    private var map: GoogleMap? = null
    private lateinit var mapFragment: SupportMapFragment

    private lateinit var cemeteriesDialog: SpinnerDialog
    private lateinit var statesDialog: SpinnerDialog

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        CoroutineScope(Dispatchers.IO).launch {
            // Initialize the Google Mobile Ads SDK on a background thread.
            MobileAds.initialize(this@MainActivity) {}

            runOnUiThread {
                val adView = findViewById<AdView>(R.id.ad_view)
                val adRequest = AdRequest.Builder().build()
                adView.loadAd(adRequest)
            }
        }

        mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)


        val cemeteryButton = findViewById<TextView>(R.id.cemetery)
        val stateButton = findViewById<TextView>(R.id.state)
        val progressBar = findViewById<ProgressBar>(R.id.progress_bar)
        val searchButton = findViewById<Button>(R.id.search)

        statesDialog = SpinnerDialog(
            this@MainActivity,
            mainViewModel.states.value.orEmpty(),
            "Select or Search State",
            "Close"
        )
        cemeteriesDialog = SpinnerDialog(
            this@MainActivity,
            mainViewModel.cemeteries.value.orEmpty(),
            "Select or Search Cemetery",
            "Close"
        )

        mainViewModel.loadStates()
        mainViewModel.loading.apply {
            val setProgress: (Boolean?) -> Unit = {
                progressBar.isVisible = it == true
            }
            setProgress(value)
            observe(this@MainActivity, setProgress)
        }

        mainViewModel.states.apply {
            val setStates: (List<String>?) -> Unit = {
                statesDialog.items = it.orEmpty()
            }
            setStates(value)
            observe(this@MainActivity, setStates)
        }
        mainViewModel.cemeteries.apply {
            val setItems: (List<String>?) -> Unit = {
                cemeteriesDialog.items = it
                if (mainViewModel.showCemeteryDialog && !it.isNullOrEmpty() && !cemeteriesDialog.isShowing) {
                    cemeteriesDialog.showSpinerDialog()
                    mainViewModel.showCemeteryDialog = false
                }
            }
            setItems(value)
            observe(this@MainActivity, setItems)
        }

        mainViewModel.graves.apply {
            setGrave(value)
            observe(this@MainActivity, ::setGrave)
        }

        mainViewModel.selectedState.apply {
            val setSelectedState: (String?) -> Unit = {
                stateButton.apply {
                    if (it.isNullOrEmpty()) {
                        setText(R.string.select_state)
                    } else {
                        text = it
                    }
                }
            }
            setSelectedState(value)
            observe(this@MainActivity, setSelectedState)
        }
        mainViewModel.selectedCemetery.apply {
            val setCemetery: (String?) -> Unit = {
                cemeteryButton.apply {
                    if (it.isNullOrEmpty()) {
                        setText(R.string.select_cemetery)
                    } else {
                        text = it
                    }
                }
            }
            setCemetery(value)
            observe(this@MainActivity, setCemetery)
        }

        statesDialog.bindOnSpinerListener { item, _ ->
            if (mainViewModel.loading.value == true) {
                return@bindOnSpinerListener
            }
            mainViewModel.setState(item)
        }


        cemeteriesDialog.bindOnSpinerListener { item, _ ->
            if (mainViewModel.loading.value == true) {
                return@bindOnSpinerListener
            }
            mainViewModel.setCemetery(item)
        }

        cemeteryButton.setOnClickListener {
            if (mainViewModel.loading.value == true) {
                return@setOnClickListener
            }

            if (mainViewModel.selectedState.value.isNullOrEmpty()) {
                Toast.makeText(this, "Select State", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (mainViewModel.cemeteries.value.isNullOrEmpty()) {
                mainViewModel.loadCemeteries()
            } else {
                cemeteriesDialog.showSpinerDialog()
            }
        }

        stateButton.setOnClickListener {
            if (mainViewModel.loading.value == true) {
                return@setOnClickListener
            }

            statesDialog.items = mainViewModel.states.value.orEmpty()
            statesDialog.showSpinerDialog()
        }

        searchButton.setOnClickListener {
            if (mainViewModel.loading.value == true) {
                return@setOnClickListener
            }

            if (mainViewModel.selectedState.value.isNullOrEmpty()) {
                Toast.makeText(this, "Select State", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (mainViewModel.selectedCemetery.value.isNullOrEmpty()) {
                Toast.makeText(this, "Select Cemetery", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            mainViewModel.loadGraves()
        }
    }

    override fun onMapReady(mMap: GoogleMap) {
        map = mMap
        map?.mapType = GoogleMap.MAP_TYPE_SATELLITE
        map?.setOnMarkerClickListener { arg0 ->
            if (mainViewModel.loading.value == true) {
                return@setOnMarkerClickListener true
            }
            val selectedState = mainViewModel.selectedState.value
            if (selectedState.isNullOrEmpty()) {
                return@setOnMarkerClickListener true
            }

            val point = arg0.position
            map?.moveCamera(CameraUpdateFactory.newLatLngZoom(point, 16f))
            map?.setInfoWindowAdapter(CustomInfoWindowAdapter(this, point, selectedState))
            false
        }
        map?.setOnInfoWindowClickListener { marker ->
            if (mainViewModel.loading.value == true) {
                return@setOnInfoWindowClickListener
            }

            val options = arrayOf("Get Directions", "Save to ANUBIS Website")
            AlertDialog.Builder(this)
                .setTitle("Gravesite Options")
                .setItems(options) { _, which ->
                    when (which) {
                        0 -> {
                            startActivity(
                                Intent(this, DestinationActivity::class.java)
                                    .putExtra(DestinationActivity.EXTRA_DEST, marker.position)
                            )
                        }
                        1 -> {
                            val url = "https://www.anubiskemet2.com/dashboard/gravesite/new" +
                                "?lat=${marker.position.latitude}&lng=${marker.position.longitude}"
                            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        }
                    }
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
        setGrave(mainViewModel.graves.value)
    }

    private fun setGrave(graves: List<Cemeteries>?) {
        if (graves.isNullOrEmpty()) {
            map?.clear()
        } else {
            val builder: LatLngBounds.Builder = LatLngBounds.Builder()
            val markers = graves.mapNotNull { item ->
                item.pos_lat_lng?.split(",")?.takeIf {
                    it.count() == 2
                }?.let {
                    val lat = it.first().toDoubleOrNull()
                    val lng = it[1].toDoubleOrNull()
                    if (lat != null && lng != null) {
                        LatLng(lat, lng)
                    } else {
                        null
                    }
                }?.let { position ->
                    MarkerOptions()
                        .position(position)
                        .title(item.cemetery)
                        .snippet(item.address)
                        .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_angel_50))
                }
            }
            markers.forEach {
                builder.include(it.position)
                map?.addMarker(it)
            }

            if (markers.count() == 1) {
                map?.moveCamera(CameraUpdateFactory.newLatLngZoom(markers.first().position, 16f))
                return
            }
            map?.animateCamera(CameraUpdateFactory.newLatLngBounds(builder.build(), 20))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        map?.clear()
        map = null
    }
}