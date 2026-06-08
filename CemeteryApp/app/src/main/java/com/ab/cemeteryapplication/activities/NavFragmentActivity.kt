package com.ab.cemeteryapplication.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.IntentCompat
import com.ab.cemeteryapplication.R
import com.ab.cemeteryapplication.Utils.EdgeToEdgeUtil
import com.ab.cemeteryapplication.Utils.InitializedMapScope
import com.ab.cemeteryapplication.Utils.InitializedNavRunnable
import com.ab.cemeteryapplication.Utils.InitializedNavScope
import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.navigation.ForceNightMode
import com.google.android.libraries.navigation.NavigationApi
import com.google.android.libraries.navigation.Navigator
import com.google.android.libraries.navigation.RoutingOptions
import com.google.android.libraries.navigation.SupportNavigationFragment
import com.google.android.libraries.navigation.Waypoint
import com.google.android.material.snackbar.Snackbar
import java.util.concurrent.TimeUnit

/**
 * This activity shows a simple Navigation API implementation using a Navigation fragment and using
 * the Google Places API for destination selection.
 */
class NavFragmentActivity : AppCompatActivity() {
    private lateinit var dest: LatLng

    @RoutingOptions.TravelMode
    private var travelMode: Int? = null

    private var navigatorScope: InitializedNavScope? = null
    private var arrivalListener: Navigator.ArrivalListener? = null

    // TODO: Update to be lifecycle aware.
    private var pendingNavActions = mutableListOf<InitializedNavRunnable>()

    private lateinit var navFragment: SupportNavigationFragment
    private lateinit var buttonToggleGuidance: Button

    // Pre-registered at class init so it is available before STARTED.
    // Activity Result Contracts forbid calling registerForActivityResult()
    // from a later callback (e.g. a button click), so we store the launcher
    // and the requested permissions array as members.
    private var pendingPermissions: Array<String> = emptyArray()
    private val permissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissionResults ->
        if (permissionResults.getOrDefault(
                Manifest.permission.ACCESS_FINE_LOCATION, false
            )
        ) {
            onLocationPermissionGranted()
        } else {
            showPermissionSnackBar(window.decorView, pendingPermissions, true)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_nav_fragment)
        travelMode = intent?.takeIf { it.hasExtra(EXTRA_TYPE) }?.getIntExtra(
            EXTRA_TYPE, RoutingOptions.TravelMode.DRIVING
        )?.takeIf { it != RoutingOptions.TravelMode.DRIVING }
        val d = intent?.let { i ->
            IntentCompat.getParcelableExtra(
                i, EXTRA_DEST, LatLng::class.java
            )
        }
        if (d == null) {
            finish()
            return
        } else {
            dest = d
        }

        // Margins are only set if the edge-to-edge mode is enabled, it's enabled by default for Android
        // V+ devices.
        // No margins are set for pre-Android V devices.
        EdgeToEdgeUtil.setMarginForEdgeToEdgeSupport(
            listOf(EdgeToEdgeUtil.EdgeToEdgeMarginConfig(view = findViewById(R.id.nav_fragment_layout_container)))
        )

        // Obtain a reference to the NavigationFragment
        navFragment =
            supportFragmentManager.findFragmentById(R.id.navigation_fragment) as SupportNavigationFragment
        buttonToggleGuidance = findViewById(R.id.buttonToggleGuidance)

        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.POST_NOTIFICATIONS
            )
        } else {
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
        }

        if (permissions.any { !checkPermissionGranted(it) }) {
            // Per Google Play's Prominent Disclosure and Consent Requirement,
            // the user must be shown an in-app disclosure of what location data
            // is collected and how it's used immediately before the runtime
            // permission request. Only after explicit consent do we proceed
            // with the system permission dialog.
            showLocationDisclosureThenRequestPermissions(permissions)
        } else {
            window?.decorView?.postDelayed(
                { onLocationPermissionGranted() }, TimeUnit.SECONDS.toMillis(2)
            )
        }

        buttonToggleGuidance.setOnClickListener {
            finish()
        }
    }

    /**
     * Runs [block] once map is initialized. Block is ignored if map is never initialized.
     *
     * This ensures that calls using the map before the map is initialized gets executed after the map
     * has been initialized.
     */
    private fun withMapAsync(block: InitializedMapScope.() -> Unit) {
        navFragment.getMapAsync { map ->
            object : InitializedMapScope {
                override val map = map
            }.block()
        }
    }

    /**
     * Runs [block] once navigator is initialized. Block is ignored if the navigator is never
     * initialized (error, etc.).
     *
     * This ensures that calls using the navigator before the navigator is initialized gets executed
     * after the navigator has been initialized.
     */
    private fun withNavigatorAsync(block: InitializedNavRunnable) {
        val navigatorScope = navigatorScope
        if (navigatorScope != null) {
            navigatorScope.block()
        } else {
            pendingNavActions.add(block)
        }
    }

    /** Starts the Navigation API, saving a reference to the ready Navigator instance. */
    private fun initializeNavigationApi() {
        NavigationApi.getNavigator(
            this,
            object : NavigationApi.NavigatorListener {
                override fun onNavigatorReady(navigator: Navigator) {
                    val scope = InitializedNavScope(navigator)
                    navigatorScope = scope
                    pendingNavActions.forEach { block -> scope.block() }
                    pendingNavActions.clear()
                }

                override fun onError(@NavigationApi.ErrorCode errorCode: Int) {
                    when (errorCode) {
                        NavigationApi.ErrorCode.NOT_AUTHORIZED -> {
                            // Note: If this message is displayed, you may need to check that
                            // your API_KEY is specified correctly in AndroidManifest.xml
                            // and is been enabled to access the Navigation API
                            showToast(
                                "Error loading Navigation API: Your API key is " + "invalid or not authorized to use Navigation."
                            )
                        }

                        NavigationApi.ErrorCode.TERMS_NOT_ACCEPTED -> {
                            showToast(
                                "Error loading Navigation API: User did not " + "accept the Navigation Terms of Use."
                            )
                        }

                        else -> showToast("Error loading Navigation API: $errorCode")
                    }
                }
            },
        )

    }

    private fun navigateToDest() {
        val waypoint = Waypoint.builder().setVehicleStopover(false).setPreferSameSideOfRoad(false)
            .setLatLng(dest.latitude, dest.longitude).build()

        withNavigatorAsync {
            val t = travelMode
            val pendingRoute = if (t == null) {
                navigator.setDestination(waypoint)
            } else {
                navigator.setDestination(
                    waypoint, RoutingOptions().travelMode(t)
                )
            }

            // Set an action to perform when a route is determined to the destination
            pendingRoute.setOnResultListener { code ->
                when (code) {
                    Navigator.RouteStatus.OK -> {
                        // Hide the toolbar to maximize the navigation UI
                        actionBar?.hide()

                        // Enable voice audio guidance (through the device speaker)
                        navigator.setAudioGuidance(Navigator.AudioGuidance.VOICE_ALERTS_AND_GUIDANCE)

                        navigator.startGuidance()
                    }

                    Navigator.RouteStatus.ROUTE_CANCELED -> {
                        // Return to top-down perspective
                        showToast("Route guidance cancelled.")
                    }

                    Navigator.RouteStatus.NO_ROUTE_FOUND, Navigator.RouteStatus.NETWORK_ERROR -> {
                        // TODO: Add logic to handle when a route could not be determined
                        showToast("Error starting guidance: $code")
                    }

                    else -> {
                        showToast("Error starting guidance: $code")
                    }
                }
            }
        }
    }

    /**
     * Registers a number of example event listeners that show an on screen message when certain
     * navigation events occur (e.g. the driver's route changes or the destination is reached).
     */
    private fun registerNavigationListeners() {
        withNavigatorAsync {
            arrivalListener = Navigator.ArrivalListener {

                // Show an onscreen message
                showToast("You have arrived. Walk to the marker and tap Stop Guidance to save your exact location.")

                // Stop turn-by-turn guidance and return to TOP_DOWN perspective of the map
                navigator.stopGuidance()

                // Stop simulating vehicle movement.
                navigator.simulator.unsetUserLocation()

                // Intentionally do NOT call finish() here.
                // The SDK's arrival threshold (~50 ft) is wider than the precision
                // needed to save a gravesite GPS. Keeping the activity alive lets the
                // user keep walking visually toward the pin on the map after guidance
                // ends. They exit via the Stop Guidance button when physically at the
                // marker, then tap Save to ANUBIS on the destination screen to capture
                // their true position.
            }
            navigator.addArrivalListener(arrivalListener)
        }
    }

    private fun showToast(errorMessage: String) {
        Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show()
    }

    override fun onDestroy() {
        // Clean up THIS session's state without destroying the Navigator singleton.
        //
        // The Google Navigation SDK's Navigator is documented as a singleton. Calling
        // navigator.cleanup() releases its internal state, which sounds harmless until
        // the user starts a second navigation session in the same app process: the
        // next NavigationApi.getNavigator() call returns the same singleton in a
        // broken state, and route calculation / guidance silently fail to start.
        // This matches the "first try works, second try doesn't" symptom we hit.
        //
        // Per Google's "Best Practices for the Navigation SDK," cleanup() should be
        // called only when navigation is truly no longer needed for the lifetime of
        // the process, not on every activity destruction. We therefore omit the
        // cleanup() call and rely on process termination for final teardown.
        withNavigatorAsync {
            arrivalListener?.let {
                navigator.removeArrivalListener(it)
            }
            navigator.stopGuidance()
            navigator.clearDestinations()
        }
        super.onDestroy()
    }

    private fun checkPermissionGranted(permissionToCheck: String): Boolean =
        ContextCompat.checkSelfPermission(
            this, permissionToCheck
        ) == PackageManager.PERMISSION_GRANTED

    /**
     * Fixes a known memory leak that occurs in Android 12 in [shouldShowRequestPermissionRationale].
     *
     * Alternatively, you may update androidx.core to 1.10.0+ and use
     * [ActivityCompat.shouldShowRequestPermissionRationale] directly to avoid this workaround.
     * However, there are still edge cases that will fail and still default to the method that leaks.
     * Consider updating [handleShouldShowRequestPermissionRationaleFixFailure] to control what
     * happens in this scenario.
     */
    private fun shouldShowRequestPermissionRationaleFix(permission: String): Boolean =
    // This is very close to the fix you would get from upgrading to androidx.core 1.10.0 (see
    // https://github.com/androidx/androidx/pull/435). However, there are still some edge case
    // where the 1.10.0 fix will fall through and still produce the memory leak. Implement
    // #handleWorkPermissionsAroundFailure to control what happens when it would normally fall
        // through.
        if (Build.VERSION.SDK_INT == Build.VERSION_CODES.S) {
            PackageManager::class.java.getMethod(
                "shouldShowRequestPermissionRationale",
                String::class.java
            ).invoke(application.packageManager, permission) as Boolean
                ?: handleShouldShowRequestPermissionRationaleFixFailure(permission)
        } else {
            // This would leak SplashScreenActivity if called in Android 12 (VERSION_CODES.S).
            shouldShowRequestPermissionRationale(permission)
        }

    /** Update this method to control the outcome when the workaround is unsuccessful. */
    private fun handleShouldShowRequestPermissionRationaleFixFailure(permission: String) = true

    private fun onLocationPermissionGranted() {
        // Let the SDK auto-detect day/night based on actual location + local time.
        // The pristine source forced FORCE_NIGHT (sample/demo code) which caused the
        // map to start in night mode during daytime; the SDK then mid-navigation
        // tried to correct to day mode and the transition produced a bug where
        // navigation could not be resumed. AUTO is the SDK's documented default
        // and recommended setting.
        navFragment.setForceNightMode(ForceNightMode.AUTO)
        // Ensure the screen stays on during nav.
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Register some example listeners for navigation events.
        registerNavigationListeners()

        initializeNavigationApi()
        navigateToDest()
    }

    private fun showLocationDisclosureThenRequestPermissions(permissions: Array<String>) {
        AlertDialog.Builder(this)
            .setTitle(R.string.location_disclosure_title)
            .setMessage(R.string.location_disclosure_message)
            .setCancelable(false)
            .setPositiveButton(R.string.location_disclosure_agree) { dialog, _ ->
                dialog.dismiss()
                if (permissions.any { shouldShowRequestPermissionRationaleFix(it) }) {
                    showPermissionSnackBar(window.decorView, permissions, false)
                }
                fireRequestPermissionAction(window.decorView, permissions)
            }
            .setNegativeButton(R.string.location_disclosure_cancel) { dialog, _ ->
                dialog.dismiss()
                finish()
            }
            .show()
    }

    private fun fireRequestPermissionAction(view: View?, permissions: Array<String>) {
        pendingPermissions = permissions
        permissionsLauncher.launch(permissions)
    }

    private fun showPermissionSnackBar(
        view: View?, permissions: Array<String>, openSettings: Boolean
    ) {
        if (view == null) {
            return
        }

        Snackbar.make(view, R.string.permissions_required, Snackbar.LENGTH_LONG).apply {
            setAction(R.string.grant) {
                if (openSettings) {
                    runCatching {
                        startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS))
                    }
                } else {
                    fireRequestPermissionAction(view, permissions)
                }
            }
            show()
        }
    }

    companion object {
        const val EXTRA_DEST = "EXTRA_DEST"
        const val EXTRA_TYPE = "EXTRA_TYPE"
    }
}
