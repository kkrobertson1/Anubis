package com.ab.cemeteryapplication.Utils

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.widget.TextView
import android.widget.Toast
import com.ab.cemeteryapplication.R
import com.google.android.libraries.maps.GoogleMap
import com.google.android.libraries.maps.model.LatLng
import com.google.android.libraries.maps.model.Marker

class CustomInfoWindowAdapter(context: Context, latLng: LatLng, state: String) :
    GoogleMap.InfoWindowAdapter {
    var mView: View
    var mContext: Context
    var mlatLng: LatLng
    var mstate: String

    init {
        mContext = context
        mView = LayoutInflater.from(mContext).inflate(R.layout.cutom_info_window, null)
        mlatLng = latLng
        mstate = state
    }

    fun renderWindowText(marker: Marker, view: View) {
        var title = view.findViewById<TextView>(R.id.title)
        var address = view.findViewById<TextView>(R.id.address)
        var state = view.findViewById<TextView>(R.id.state)
        var link = view.findViewById<TextView>(R.id.link)


        if (!title.equals("")) {
            title.setText(marker.title)
        }
        if (!address.equals("")) {
            address.setText(marker.snippet)
        }
        if (!mstate.equals("")) {
            state.setText(mstate)
        }

        link.setOnClickListener {
            Toast.makeText(mContext, "Link", Toast.LENGTH_SHORT).show()
//            val gmmIntentUri = Uri.parse("google.streetview:cbll=46.414382,10.013988")
//            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
//            startActivity(mapIntent)
        }
    }

    override fun getInfoWindow(p0: Marker): View? {
        renderWindowText(p0, mView)
        return mView
    }

    override fun getInfoContents(p0: Marker): View? {
        renderWindowText(p0, mView)
        return mView
    }
}