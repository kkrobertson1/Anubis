package com.ab.cemeteryapplication.viewmodels

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.map
import androidx.lifecycle.viewModelScope
import com.ab.cemeteryapplication.dto.Cemeteries
import com.ab.cemeteryapplication.dto.State
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class MainViewModel : ViewModel() {

    private val loadingLiveData by lazy {
        MutableLiveData<Boolean?>()
    }
    val loading: LiveData<Boolean?> = loadingLiveData

    private val statesLiveData by lazy {
        MutableLiveData<List<State>?>()
    }

    val states: LiveData<List<String>?> = statesLiveData.map {
        it?.map { item -> item.stateName.orEmpty() }.orEmpty()
    }

    var showCemeteryDialog = false
    private val cemeteriesLiveData by lazy {
        MutableLiveData<List<String>?>()
    }

    val cemeteries: LiveData<List<String>?> = cemeteriesLiveData

    private val gravesLiveData by lazy {
        MutableLiveData<List<Cemeteries>?>()
    }
    val graves: LiveData<List<Cemeteries>?> = gravesLiveData

    private val selectedStateLiveData by lazy {
        MutableLiveData<String?>()
    }
    val selectedState: LiveData<String?> = selectedStateLiveData
    private val selectedCemeteryLiveData by lazy {
        MutableLiveData<String?>()
    }
    val selectedCemetery: LiveData<String?> = selectedCemeteryLiveData

    fun setState(state: String?) {
        val currentState = selectedState.value
        if (!currentState.isNullOrEmpty() && currentState == state) {
            return
        }

        selectedStateLiveData.postValue(state)
        selectedCemeteryLiveData.postValue(null)
        cemeteriesLiveData.postValue(null)
    }

    fun setCemetery(cemetery: String?) {
        selectedCemeteryLiveData.postValue(cemetery)
    }

    fun loadStates() {
        loadingLiveData.postValue(true)
        viewModelScope.launch {
            runCatching {
                FirebaseDatabase.getInstance().getReference("states")
                    .orderByChild("stateName")
                    .ref
                    .get().await()
                    .children
                    .mapNotNull { it.getValue(State::class.java) }
            }.onSuccess {
                statesLiveData.postValue(it)
            }.onFailure { e ->
                Log.e(TAG, e.message, e)
            }

            loadingLiveData.postValue(false)
        }
    }

    fun loadCemeteries() {
        val stateValue = selectedState.value
        if (stateValue.isNullOrEmpty()) {
            return
        }

        loadingLiveData.postValue(true)
        viewModelScope.launch {
            cemeteriesLiveData.postValue(emptyList())
            runCatching {
                callbackFlow {
                    val listener = object : ValueEventListener {
                        override fun onDataChange(dataSnapshot: DataSnapshot) {
                            trySend(
                                ((dataSnapshot.value as? List<*>)
                                    ?: (dataSnapshot.value as? Map<*, *>)?.values)
                                    .orEmpty().mapNotNull { item ->
                                        if (item != null && item is Map<*, *>) {
                                            item["cemetery"]?.toString()
                                                .takeUnless { it.isNullOrEmpty() }
                                        } else {
                                            null
                                        }
                                    }.sorted()
                            )
                        }

                        override fun onCancelled(databaseError: DatabaseError) {
                            // Handle error if needed
                            Log.e(TAG, databaseError.message, databaseError.toException())
                        }
                    }

                    val ref = FirebaseDatabase.getInstance().reference.child("cemeteries")
                        .orderByChild("state").equalTo(stateValue)
                    ref.addListenerForSingleValueEvent(listener)

                    awaitClose {
                        ref.removeEventListener(listener) // Clean up listener
                    }
                }.firstOrNull()
            }.onSuccess {
                showCemeteryDialog = true
                cemeteriesLiveData.postValue(it)
            }.onFailure { e ->
                Log.e(TAG, e.message, e)
            }
            loadingLiveData.postValue(false)
        }
    }

    fun loadGraves() {
        val stateValue = selectedState.value
        val cemeteryValue = selectedCemetery.value
        if (stateValue.isNullOrEmpty() || cemeteryValue.isNullOrEmpty()) {
            return
        }

        loadingLiveData.postValue(true)
        viewModelScope.launch {
            gravesLiveData.postValue(emptyList())
            runCatching {
                callbackFlow {
                    val listener = object : ValueEventListener {
                        override fun onDataChange(dataSnapshot: DataSnapshot) {
                            val dataValue = dataSnapshot.value
                            trySend(
                                ((dataValue as? Map<*, *>)?.values
                                    ?: dataValue as? List<*>)
                                    .orEmpty().mapNotNull { item ->
                                        if (item != null && item is Map<*, *>) {
                                            val posLatLng = item["pos_lat_lng"]?.toString()
                                            if (posLatLng.isNullOrEmpty() || posLatLng == "null" || posLatLng.contains(
                                                    "@39.428059"
                                                )
                                            ) {
                                                null
                                            } else {
                                                Cemeteries(
                                                    address = item["address"]?.toString(),
                                                    state = item["state"]?.toString(),
                                                    cemetery = item["cemetery"]?.toString(),
                                                    pos_lat_lng = posLatLng,
                                                )
                                            }
                                        } else {
                                            null
                                        }
                                    })
                        }

                        override fun onCancelled(databaseError: DatabaseError) {
                            // Handle error if needed
                            Log.e(TAG, databaseError.message, databaseError.toException())
                        }
                    }

                    val ref = FirebaseDatabase.getInstance().reference.child("graves")
                        .orderByChild("cemetery").equalTo(cemeteryValue)
                    ref.addListenerForSingleValueEvent(listener)

                    awaitClose {
                        ref.removeEventListener(listener) // Clean up listener
                    }
                }.firstOrNull()
            }.onSuccess {
                gravesLiveData.postValue(it)
            }.onFailure { e ->
                Log.e(TAG, e.message, e)
            }
            loadingLiveData.postValue(false)
        }
    }

    companion object {
        private const val TAG = "MainViewModel"
    }
}