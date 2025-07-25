package com.ab.cemeteryapplication.activities

import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.ab.cemeteryapplication.R
import com.ab.cemeteryapplication.Utils.CustomInfoWindowAdapter
import com.ab.cemeteryapplication.Utils.SpinnerDialog
import com.ab.cemeteryapplication.Utils.copy
import com.ab.cemeteryapplication.dto.Cemeteries
import com.ab.cemeteryapplication.dto.Cemetery
import com.ab.cemeteryapplication.dto.State
import com.google.android.gms.ads.*
import com.google.android.libraries.maps.*
import com.google.android.libraries.maps.model.*
import com.google.firebase.FirebaseApp
import com.google.firebase.database.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlin.collections.ArrayList


class MainActivity : AppCompatActivity(), OnMapReadyCallback {
    private lateinit var map: GoogleMap
    lateinit var mapFragment: SupportMapFragment

    var states = mutableListOf<State?>()

    var gravesList = mutableListOf<Cemeteries>()
    var cemeteriesList = arrayListOf<String>()
    var statesList = arrayListOf<String>()

    lateinit var cemeteriesDialog: SpinnerDialog
    lateinit var statesDialog: SpinnerDialog
    var notSave: Boolean = false

    var selectedState = ""
    var selectedCemetery = ""
    private lateinit var adView: AdView
    var adRequest: AdRequest? = null

    override fun onSaveInstanceState(savedInstanceState: Bundle) {
        super.onSaveInstanceState(savedInstanceState)
        if (!notSave) {
            savedInstanceState.putString("selectedstate", selectedState)
            savedInstanceState.putString("selectedcemetery", selectedCemetery)
            savedInstanceState.putStringArrayList("statelist", statesList)
            savedInstanceState.putStringArrayList("cemeterieslist", cemeteriesList)
            savedInstanceState.putString("cemetery", findViewById<TextView>(R.id.cemetery).text.toString())
            savedInstanceState.putString("state", findViewById<TextView>(R.id.state).text.toString())
            savedInstanceState.putString("graveslist", Gson().toJson(gravesList))
        }
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)

        if (!notSave) {
            selectedState = savedInstanceState.getString("selectedstate").toString()
            selectedCemetery = savedInstanceState.getString("selectedcemetery").toString()
            statesList = savedInstanceState.getStringArrayList("statelist")!!
            cemeteriesList = savedInstanceState.getStringArrayList("cemeterieslist")!!
            findViewById<TextView>(R.id.cemetery).setText(savedInstanceState.getString("cemetery").toString())
            findViewById<TextView>(R.id.state).setText(savedInstanceState.getString("state").toString())
            gravesList = Gson().fromJson(
                savedInstanceState.getString("graveslist"),
                object : TypeToken<ArrayList<Cemeteries>>() {}.type
            )
            cemeteriesDialog = SpinnerDialog(
                this@MainActivity,
                cemeteriesList,
                "Select or Search Cemetery",
                "Close"
            )
            cemeteriesDialog!!.bindOnSpinerListener { item, position ->
                findViewById<TextView>(R.id.cemetery).setText("$item")
                selectedCemetery = item
            }
            statesDialog = SpinnerDialog(
                this@MainActivity,
                statesList,
                "Select or Search State",
                "Close"
            )
            statesDialog!!.bindOnSpinerListener { item, position ->
                findViewById<TextView>(R.id.state).setText("$item")
                selectedState = item
                findViewById<TextView>(R.id.cemetery).setText("Select Cemetery")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        var orientation: Int = this.getResources().getConfiguration().orientation;
        if (orientation == Configuration.ORIENTATION_PORTRAIT) {
            setContentView(R.layout.activity_main)
        } else {
            setContentView(R.layout.activity_main_landscape)
        }
        MobileAds.initialize(this) {}

        adView = findViewById(R.id.ad_view)
        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)

        /*MobileAds.initialize(this) {
            adView = findViewById<AdView>(R.id.ad_view)
            adRequest = AdRequest.Builder().build()
            adView.loadAd(adRequest)
            adView.adListener = object : AdListener() {
                override fun onAdLoaded() {
                    print("")
                    // Code to be executed when an ad finishes loading.
                }

                override fun onAdFailedToLoad(adError: LoadAdError) {
                    print("")
                    // Code to be executed when an ad request fails.
                }

                override fun onAdOpened() {
                    // Code to be executed when an ad opens an overlay that
                    // covers the screen.
                }

                override fun onAdClicked() {
                    // Code to be executed when the user clicks on an ad.
                }

                override fun onAdLeftApplication() {
                    // Code to be executed when the user has left the app.
                }

                override fun onAdClosed() {
                    // Code to be executed when the user is about to return
                    // to the app after tapping on an ad.
                }
            }
        }*/

        mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        getStates()

        cemeteriesDialog = SpinnerDialog(
            this@MainActivity,
            cemeteriesList,
            "Select or Search Cemetery",
            "Close"
        )
        cemeteriesDialog!!.bindOnSpinerListener { item, position ->
            findViewById<TextView>(R.id.cemetery).setText("$item")
            selectedCemetery = item
        }
        findViewById<TextView>(R.id.cemetery).setOnClickListener {

            if (findViewById<TextView>(R.id.state).text == "Select State") {
                Toast.makeText(this, "Select State", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if(cemeteriesList.isEmpty()){


                findViewById<ProgressBar>(R.id.progress_bar).visibility = View.VISIBLE
                cemeteriesList.clear()

                val ref = FirebaseDatabase.getInstance().reference.child("cemeteries")
                ref.orderByChild("state").equalTo(selectedState)
                    .addListenerForSingleValueEvent(
                        object : ValueEventListener {
                            override fun onDataChange(dataSnapshot: DataSnapshot) {
                                dataSnapshot.value
                                try {
                                    var hashMap =
                                        (dataSnapshot.value as ArrayList<HashMap<String, String>>)

                                    hashMap =
                                        hashMap.filter { it != null } as ArrayList<HashMap<String, String>>
                                    hashMap.forEach {
                                        cemeteriesList.add(it["cemetery"].toString())
                                    }
                                    //cemeteriesList = cemeteriesList.distinctBy { it } as ArrayList<String>
                                    cemeteriesList.sortBy { it }
                                    findViewById<ProgressBar>(R.id.progress_bar).visibility = View.GONE
                                    cemeteriesDialog!!.showSpinerDialog()
                                } catch (e: ClassCastException) {
                                    var hashMap =
                                        (dataSnapshot.value as HashMap<String, HashMap<String, String>>)

                                    hashMap =
                                        hashMap.filter { it != null } as HashMap<String, HashMap<String, String>>
                                    hashMap.forEach {
                                        cemeteriesList.add(it.value["cemetery"].toString())
                                    }
                                    //cemeteriesList = cemeteriesList.distinctBy { it } as ArrayList<String>
                                    cemeteriesList.sortBy { it }
                                    findViewById<ProgressBar>(R.id.progress_bar).visibility = View.GONE
                                    cemeteriesDialog!!.showSpinerDialog()
                                }
                            }

                            override fun onCancelled(databaseError: DatabaseError) {
                                findViewById<ProgressBar>(R.id.progress_bar).visibility = View.GONE
                            }
                        })
            }else{
                cemeteriesDialog!!.showSpinerDialog()
            }

        }

        findViewById<TextView>(R.id.state).setOnClickListener {
            if (states.isNotEmpty()) {
                statesList = states.map { it?.stateName } as ArrayList<String>
                statesList.sortBy { it }
            }
            statesDialog = SpinnerDialog(
                this@MainActivity,
                statesList,
                "Select or Search State",
                "Close"
            )
            statesDialog!!.bindOnSpinerListener { item, position ->
                findViewById<TextView>(R.id.state).setText("$item")
                selectedState = item
                findViewById<TextView>(R.id.cemetery).setText("Select Cemetery")
                cemeteriesList.clear()
            }

            statesDialog!!.showSpinerDialog()
        }

        findViewById<Button>(R.id.search).setOnClickListener {
            if (findViewById<TextView>(R.id.state).text == "Select State") {
                Toast.makeText(this, "Select State", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (findViewById<TextView>(R.id.cemetery).text == "Select Cemetery") {
                Toast.makeText(this, "Select Cemetery", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            gravesList.clear()
            findViewById<ProgressBar>(R.id.progress_bar).visibility = View.VISIBLE
            map.clear()
            val ref = FirebaseDatabase.getInstance().reference.child("graves")
            ref.orderByChild("cemetery").equalTo(selectedCemetery)
                .addListenerForSingleValueEvent(
                    object : ValueEventListener {
                        override fun onDataChange(dataSnapshot: DataSnapshot) {
                            try {
                                var hashMap =
                                    (dataSnapshot.value as HashMap<String, HashMap<String, String>>)
                                hashMap =
                                    hashMap.filter { it != null } as HashMap<String, HashMap<String, String>>
                                hashMap.forEach {
                                    val cemeteries = Cemeteries()
                                    cemeteries.state = it.value["state"].toString()
                                    cemeteries.cemetery = it.value["cemetery"].toString()
                                    cemeteries.pos_lat_lng = it.value["pos_lat_lng"].toString()
                                    cemeteries.address = it.value["address"].toString()
                                    gravesList.add(cemeteries)
                                }
                                gravesList = gravesList.filter {
                                    it.pos_lat_lng != null && it.pos_lat_lng != "" && it.pos_lat_lng != "null" && !it.pos_lat_lng!!.contains(
                                        "@39.428059"
                                    )
                                } as ArrayList<Cemeteries>
                                gravesList = gravesList.filter {
                                    it.state == selectedState && it.cemetery == selectedCemetery
                                } as ArrayList<Cemeteries>
                                findViewById<ProgressBar>(R.id.progress_bar).visibility = View.GONE
                                if (gravesList.size > 1) {
                                    val builder: LatLngBounds.Builder = LatLngBounds.Builder()
                                    gravesList.forEach {
                                        var lat_lng = it.pos_lat_lng
                                        var array = arrayOf<String>()
                                        array = lat_lng!!.split(",").toTypedArray()
                                        val postion = LatLng(array[0].toDouble(), array[1].toDouble())
                                        var address = if(it.address!="null") it.address else "N/A"
                                        map.addMarker(
                                            MarkerOptions()
                                                .position(postion)
                                                .title(it.cemetery)
                                                .snippet(address)
                                                .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_angel_50))
                                        )
                                        builder.include(postion)
                                    }
                                    map.animateCamera(CameraUpdateFactory.newLatLngBounds(builder.build(), 20))
                                } else {
                                    gravesList.forEach {
                                        var lat_lng = it.pos_lat_lng
                                        var array = arrayOf<String>()
                                        array = lat_lng!!.split(",").toTypedArray()
                                        val position = LatLng(array[0].toDouble(), array[1].toDouble())
                                        map.addMarker(
                                            MarkerOptions()
                                                .position(position)
                                                .title(it.cemetery)
                                                .snippet(it.address)
                                                .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_angel_50))
                                        )
                                        map.moveCamera(CameraUpdateFactory.newLatLngZoom(position, 16f))
                                    }
                                }
                            } catch (e: ClassCastException) {
                                var hashMap =
                                    (dataSnapshot.value as ArrayList<HashMap<String, String>>)
                                hashMap =
                                    hashMap.filter { it != null } as ArrayList<HashMap<String, String>>
                                hashMap.forEach {
                                    val cemeteries = Cemeteries()
                                    cemeteries.state = it["state"].toString()
                                    cemeteries.cemetery = it["cemetery"].toString()
                                    cemeteries.pos_lat_lng = it["pos_lat_lng"].toString()
                                    cemeteries.state = it["address"].toString()
                                    gravesList.add(cemeteries)
                                }
                                gravesList = gravesList.filter {
                                    it.pos_lat_lng != null && it.pos_lat_lng != "" && !it.pos_lat_lng!!.contains(
                                        "@39.428059"
                                    )
                                } as ArrayList<Cemeteries>
                                gravesList = gravesList.filter {
                                    it.state == selectedState && it.cemetery == selectedCemetery
                                } as ArrayList<Cemeteries>
                                findViewById<ProgressBar>(R.id.progress_bar).visibility = View.GONE
                                if (gravesList.size > 1) {
                                    val builder: LatLngBounds.Builder = LatLngBounds.Builder()
                                    gravesList.forEach {
                                        var lat_lng = it.pos_lat_lng
                                        var array = arrayOf<String>()
                                        array = lat_lng!!.split(",").toTypedArray()
                                        val postion = LatLng(array[0].toDouble(), array[1].toDouble())
                                        map.addMarker(
                                            MarkerOptions()
                                                .position(postion)
                                                .title(it.cemetery)
                                                .snippet(it.address)
                                                .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_angel_50))
                                        )
                                        builder.include(postion)
                                    }
                                    map.animateCamera(CameraUpdateFactory.newLatLngBounds(builder.build(), 20))
                                } else {
                                    gravesList.forEach {
                                        var lat_lng = it.pos_lat_lng
                                        var array = arrayOf<String>()
                                        array = lat_lng!!.split(",").toTypedArray()
                                        val position = LatLng(array[0].toDouble(), array[1].toDouble())
                                        map.addMarker(
                                            MarkerOptions()
                                                .position(position)
                                                .title(it.cemetery)
                                                .snippet(it.address)
                                                .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_angel_50))
                                        )
                                        map.moveCamera(CameraUpdateFactory.newLatLngZoom(position, 16f))
                                    }
                                }
                            }
                        }

                        override fun onCancelled(databaseError: DatabaseError) {
                            findViewById<ProgressBar>(R.id.progress_bar).visibility = View.GONE
                        }
                    })
        }
    }

    private fun getStates() {
        findViewById<ProgressBar>(R.id.progress_bar).visibility = View.VISIBLE

        val firebaseDatabase = FirebaseDatabase.getInstance(FirebaseApp.getInstance())
        val ref = firebaseDatabase.getReference("states")
        ref.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(dataSnapshot: DataSnapshot) {
                for (graves in dataSnapshot.children) {
                    graves.getValue(State::class.java)?.let { states.add(it) }
                }
                findViewById<ProgressBar>(R.id.progress_bar).visibility = View.GONE
            }

            override fun onCancelled(databaseError: DatabaseError) {
                println("The read failed: " + databaseError.code)
            }
        })
    }

    override fun onResume() {
        super.onResume()
        notSave = false
    }

    override fun onMapReady(mMap: GoogleMap) {
        map = mMap
        map.mapType = GoogleMap.MAP_TYPE_SATELLITE
        map.setOnMarkerClickListener { arg0 ->
            val point = arg0.position
            map.moveCamera(CameraUpdateFactory.newLatLngZoom(point, 16f))
            map.setInfoWindowAdapter(CustomInfoWindowAdapter(this, point, selectedState))
            false
        }
        map.setOnInfoWindowClickListener { latlng ->
            val point = latlng.position
            val gmmIntentUri =
                Uri.parse("https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}")
            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
            startActivity(mapIntent)
            notSave = true
        }
        if(gravesList.isNotEmpty()){
            if (gravesList.size > 1) {
                val builder: LatLngBounds.Builder = LatLngBounds.Builder()
                gravesList.forEach {
                    var lat_lng = it.pos_lat_lng
                    var array = arrayOf<String>()
                    array = lat_lng!!.split(",").toTypedArray()
                    val postion = LatLng(array[0].toDouble(), array[1].toDouble())
                    var address = if(it.address!="null") it.address else "N/A"
                    map.addMarker(
                        MarkerOptions()
                            .position(postion)
                            .title(it.cemetery)
                            .snippet(address)
                            .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_angel_50))
                    )
                    builder.include(postion)
                }
                map.animateCamera(CameraUpdateFactory.newLatLngBounds(builder.build(), 20))
            } else {
                gravesList.forEach {
                    var lat_lng = it.pos_lat_lng
                    var array = arrayOf<String>()
                    array = lat_lng!!.split(",").toTypedArray()
                    val position = LatLng(array[0].toDouble(), array[1].toDouble())
                    map.addMarker(
                        MarkerOptions()
                            .position(position)
                            .title(it.cemetery)
                            .snippet(it.address)
                            .icon(BitmapDescriptorFactory.fromResource(R.drawable.ic_angel_50))
                    )
                    map.moveCamera(CameraUpdateFactory.newLatLngZoom(position, 16f))
                }
            }
        }
    }

    private fun getData(){
        gravesList.clear()
        val firebaseDatabase = FirebaseDatabase.getInstance(FirebaseApp.getInstance())
        val ref = firebaseDatabase.getReference("graves")
        ref.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(dataSnapshot: DataSnapshot) {
                for (graves in dataSnapshot.children) {
                    graves.getValue(Cemeteries::class.java)?.let { gravesList.add(it) }
                }
                if (gravesList.isNotEmpty()) {
                    gravesList = gravesList.filter {
                        it.pos_lat_lng != null && it.pos_lat_lng != "" && !it.pos_lat_lng!!.contains(
                            "@39.428059"
                        )
                    } as ArrayList<Cemeteries>
//

                    var filteredCemeteries = mutableListOf<Cemetery?>()
                    gravesList.forEach {
                        var cemetery = Cemetery()
                        cemetery.cemetery = it.cemetery
                        cemetery.state = it.state
                        filteredCemeteries.add(cemetery)
                    }
                    println(filteredCemeteries)
                    var updatedList = mutableListOf<Cemetery>()
                        for (i in filteredCemeteries.indices) {
                            var state = Cemetery()
                            state.cemetery = filteredCemeteries[i]?.cemetery
                            state.state = filteredCemeteries[i]?.state
                            updatedList.add(state)
                        }
                        FirebaseDatabase.getInstance()
                            .getReference("cemeteries")
                            .setValue(updatedList)
                            .addOnCompleteListener {
                                Toast.makeText(
                                    this@MainActivity,
                                    "Success",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }.addOnFailureListener { e ->
                                Toast.makeText(
                                    this@MainActivity,
                                    "" + e.message,
                                    Toast.LENGTH_SHORT
                                ).show()
                            }

//                    var list = gravesList.map { it.state }
//
//                    var filteredStates = mutableListOf<String?>()
//                    for (i in list.indices){
//                        if(!filteredStates.contains(list[i])){
//                            filteredStates.add(list[i])
//                        }
//                    }
//                    filteredStates.removeAt(0)
////
//                    val statesReference = firebaseDatabase.getReference("states")
//                    for (i in filteredStates.indices){
//                        var state = State()
//                        state.stateName = filteredStates[i]
//                        statesReference.addValueEventListener(object :ValueEventListener{
//                            override fun onDataChange(snapshot: DataSnapshot) {
//                                statesReference.child(state.stateName!!).setValue(state)
//                            }
//                            override fun onCancelled(error: DatabaseError) {
//                                println()
//                            }
//                        })
//                    }

                }
            }

            override fun onCancelled(databaseError: DatabaseError) {
                println("The read failed: " + databaseError.code)
            }
        })
    }
}