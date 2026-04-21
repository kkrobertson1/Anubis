package com.ab.cemeteryapplication.activities

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Bitmap
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebStorage
import android.webkit.WebView
import android.widget.ProgressBar
import androidx.activity.addCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresPermission
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.IntentCompat
import androidx.core.view.isVisible
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewClientCompat
import androidx.webkit.WebViewFeature
import com.ab.cemeteryapplication.R
import com.google.android.gms.maps.model.LatLng
import com.google.android.material.snackbar.Snackbar
import java.io.UnsupportedEncodingException
import java.net.URLDecoder
import java.util.concurrent.TimeUnit


class NavWebViewActivity : AppCompatActivity() {
    private lateinit var dest: LatLng
    private lateinit var navWebView: WebView
    private var mapsWebSettings: WebSettings? = null
    private var mapsCookieManager: CookieManager? = null
    private var locationManager: LocationManager? = null
    private var locationListenerImpl: LocationListenerImpl? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_nav_web_view)

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

        navWebView = findViewById(R.id.navWebView)

        val permissions =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.POST_NOTIFICATIONS
                )
            } else {
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
            }

        if (permissions.any { !checkPermissionGranted(it) }) {

            if (permissions.any { shouldShowRequestPermissionRationaleFix(it) }) {
                // Display a dialogue explaining the required permissions.
                showPermissionSnackBar(window.decorView, permissions, false)
            }

            fireRequestPermissionAction(window.decorView, permissions)
        } else {
            window?.decorView?.postDelayed(
                {
                    if (ContextCompat.checkSelfPermission(
                            this,
                            Manifest.permission.ACCESS_FINE_LOCATION
                        )
                        == PackageManager.PERMISSION_GRANTED
                    ) {
                        onLocationPermissionGranted()
                    }
                },
                TimeUnit.SECONDS.toMillis(2)
            )
        }

        if (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        onBackPressedDispatcher.addCallback(this) {
            if (navWebView.canGoBack() && navWebView.url != "about:blank") {
                navWebView.goBack()
            } else {
                finish()
            }
        }

        //Set cookie options
        mapsCookieManager = CookieManager.getInstance()
        resetWebView(false)
        mapsCookieManager?.setAcceptCookie(true)
        mapsCookieManager?.setAcceptThirdPartyCookies(navWebView, false)
        mapsCookieManager?.setCookie(".google.com", "SOCS=CAI;")

        //Give location access
        navWebView.setWebChromeClient(NavWebChromeClient())

        navWebView.setWebViewClient(NavWebViewClient())

        //Set more options
        mapsWebSettings = navWebView.getSettings().apply {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING) && Build.VERSION.SDK_INT >= 29) {
                val nightMode =
                    resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK == Configuration.UI_MODE_NIGHT_YES
                WebSettingsCompat.setAlgorithmicDarkeningAllowed(this, nightMode)
            }
            //Enable some WebView features
            javaScriptEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            setGeolocationEnabled(true)
            //Disable some WebView features
            allowContentAccess = false
            allowFileAccess = false
            builtInZoomControls = false
            databaseEnabled = false
            displayZoomControls = false
            domStorageEnabled = false
            saveFormData = false
            //Change the User-Agent
            setUserAgentString("Mozilla/5.0 (Linux; Unspecified Device) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36")
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING) && Build.VERSION.SDK_INT >= 29) {
            val nightMode =
                (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
            mapsWebSettings?.let {
                WebSettingsCompat.setAlgorithmicDarkeningAllowed(it, nightMode)
            }
        }
    }

    override fun onDestroy() {
        resetWebView(true)
        super.onDestroy()
        locationManager?.apply {
            locationListenerImpl?.let {
                removeUpdates(it)
            }
        }

        locationListenerImpl = null
        locationManager = null
    }

    private fun checkPermissionGranted(permissionToCheck: String): Boolean =
        ContextCompat.checkSelfPermission(
            this,
            permissionToCheck
        ) == PackageManager.PERMISSION_GRANTED

    /**
     * Fixes a known memory leak that occurs in Android 12 in [shouldShowRequestPermissionRationale].
     *
     * Alternatively, you may update androidx.core to 1.10.0+ and use
     * [androidx.core.app.ActivityCompat.shouldShowRequestPermissionRationale] directly to avoid this workaround.
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
            PackageManager::class
                .java
                .getMethod("shouldShowRequestPermissionRationale", String::class.java)
                .invoke(application.packageManager, permission) as? Boolean
                ?: handleShouldShowRequestPermissionRationaleFixFailure(permission)
        } else {
            // This would leak SplashScreenActivity if called in Android 12 (VERSION_CODES.S).
            shouldShowRequestPermissionRationale(permission)
        }

    /** Update this method to control the outcome when the workaround is unsuccessful. */
    private fun handleShouldShowRequestPermissionRationaleFixFailure(permission: String) = true

    @RequiresPermission(Manifest.permission.ACCESS_FINE_LOCATION)
    private fun onLocationPermissionGranted() {
        locationManager = ContextCompat.getSystemService(this, LocationManager::class.java)

        locationListenerImpl = LocationListenerImpl().also {
            locationManager?.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                1000L,
                0f,
                it
            )
        }

        navWebView.loadUrl("https://www.google.com/maps/search/?api=1&query=${dest.latitude},${dest.longitude}")
    }

    private fun fireRequestPermissionAction(view: View?, permissions: Array<String>) {
        val permissionsLauncher =
            registerForActivityResult(
                ActivityResultContracts.RequestMultiplePermissions(),
                { permissionResults ->
                    val locationPermission = Manifest.permission.ACCESS_FINE_LOCATION
                    if (permissionResults.getOrDefault(
                            locationPermission,
                            false
                        ) && ContextCompat.checkSelfPermission(
                            this,
                            locationPermission
                        ) == PackageManager.PERMISSION_GRANTED
                    ) {
                        onLocationPermissionGranted()
                    } else {
                        showPermissionSnackBar(view, permissions, true)
                    }
                },
            )

        permissionsLauncher.launch(permissions)
    }

    private fun showPermissionSnackBar(
        view: View?,
        permissions: Array<String>,
        openSettings: Boolean
    ) {
        if (view == null) {
            return
        }

        Snackbar.make(view, R.string.permissions_required, Snackbar.LENGTH_LONG)
            .apply {
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

    private fun resetWebView(exit: Boolean) {
        navWebView.apply {
            clearFormData()
            clearHistory()
            clearMatches()
            clearCache(true)

        }
        mapsCookieManager?.removeSessionCookie()
        mapsCookieManager?.removeAllCookie()
        CookieManager.getInstance().removeAllCookies(null)
        CookieManager.getInstance().flush()
        WebStorage.getInstance().deleteAllData()
        if (exit) {
            navWebView.apply {
                loadUrl("about:blank")
                mapsWebSettings?.javaScriptEnabled = false
                removeAllViews()
                destroyDrawingCache()
                destroy()
            }
        }
    }

    class LocationListenerImpl : LocationListener {
        override fun onLocationChanged(location: Location) {
            //no-op
        }
    }

    /**
     * WebViewClient subclass loads all hyperlinks in the existing WebView
     */
    class NavWebViewClient() : WebViewClientCompat() {
        override fun shouldInterceptRequest(
            view: WebView?,
            request: WebResourceRequest?
        ): WebResourceResponse? {
            val urlString = request?.url?.toString() ?: return null
            if (urlString == "about:blank") {
                return null
            }
            if (urlString?.startsWith("https://") != true) {
                Log.d(TAG, "[shouldInterceptRequest][NON-HTTPS] Blocked access to $urlString")
                return WebResourceResponse(
                    "text/javascript",
                    "UTF-8",
                    null
                ) //Deny URLs that aren't HTTPS
            }
            var allowed = allowedDomains.any { url ->
                request.url.host?.equals(url, true) == true
            } || allowedDomainsStart.any { url ->
                request.url.host?.startsWith(url, true) == true
            } || allowedDomainsEnd.any { url ->
                request.url.host?.endsWith(url, true) == true
            }

            if ("gstatic.com".equals(
                    request.url.host,
                    true
                ) && (request.url.path?.startsWith("/local/placeinfo/") == true)
            ) {
                allowed = true
            }

            if (!allowed) {
                Log.d(
                    TAG,
                    "[shouldInterceptRequest][NOT ON ALLOWLIST] Blocked access to ${request.url.host.orEmpty()}"
                )
                return WebResourceResponse(
                    "text/javascript",
                    "UTF-8",
                    null
                ) //Deny URLs not on ALLOWLIST
            }

            blockedURLs.forEach { url ->
                if (request.url?.toString()?.contains(url, true) == true) {
                    if (request.url?.toString()?.contains("/log204?") == true) {
                        Log.d(
                            TAG,
                            "[shouldInterceptRequest][ON DENYLIST] Blocked access to a log204 request"
                        )
                    } else {
                        Log.d(
                            TAG,
                            "[shouldInterceptRequest][ON DENYLIST] Blocked access to ${
                                request.url?.toString().orEmpty()
                            }"
                        )
                    }
                    return WebResourceResponse(
                        "text/javascript",
                        "UTF-8",
                        null
                    ) //Deny URLs on DENYLIST
                }
            }
            return null
        }

        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            if ("about:blank".equals(request.url?.toString(), true)) {
                return false
            }
            if (request.url?.toString()?.startsWith("tel:", true) == true) {
                view.context?.startActivity(Intent(Intent.ACTION_DIAL, request.url))
                return true
            }
            if (request.url?.toString()?.startsWith("https://", true) != true) {
                Log.d(
                    TAG,
                    "[shouldOverrideUrlLoading][NON-HTTPS] Blocked access to ${
                        request.url?.toString().orEmpty()
                    }"
                )
                if (request.url?.toString()
                        ?.startsWith("intent://maps.app.goo.gl/?link=", true) == true
                ) {
                    val url = request.url?.toString()
                    val encodedURL =
                        url?.split("intent://maps\\.app\\.goo\\.gl/\\?link=", ignoreCase = true)[1]
                    try {
                        view.loadUrl(URLDecoder.decode(encodedURL, "UTF-8"))
                    } catch (e: UnsupportedEncodingException) {
                        Log.e(TAG, e.message, e)
                        return true
                    }
                }
                return true //Deny URLs that aren't HTTPS
            }
            val allowed = allowedDomains.any { url ->
                request.url.host?.equals(url, true) == true
            } || allowedDomainsStart.any { url ->
                request.url.host?.startsWith(url, true) == true
            } || allowedDomainsEnd.any { url ->
                request.url.host?.endsWith(url, true) == true
            }

            if (!allowed) {
                Log.d(
                    TAG,
                    "[shouldOverrideUrlLoading][NOT ON ALLOWLIST] Blocked access to ${request.url?.host.orEmpty()}"
                )
                return true //Deny URLs not on ALLOWLIST
            }
            blockedURLs.forEach { url ->
                if (request.url?.toString()?.contains(url, true) == true) {
                    Log.d(
                        TAG,
                        "[shouldOverrideUrlLoading][ON DENYLIST] Blocked access to " + request.url
                            .toString()
                    )
                    return true //Deny URLs on DENYLIST
                }
            }
            return false
        }

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
            super.onPageStarted(view, url, favicon)
            (view?.parent as? ViewGroup?)?.findViewById<ProgressBar>(R.id.navProgressBar)
                ?.isVisible = true
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            (view?.parent as? ViewGroup?)?.findViewById<ProgressBar>(R.id.navProgressBar)
                ?.isVisible = false
            //Remove Banner
            view?.evaluateJavascript(
                "var head = document.getElementsByTagName('head');\n" +
                        "if (head.length > 0) {\n" +
                        "    var style = document.createElement('style');\n" +
                        "    style.setAttribute('type', 'text/css');\n" +
                        "    style.textContent = `.ml-persistent-promo-banner {\n" +
                        "        display: none !important;\n" +
                        "    }\n" +
                        "    #app {\n" +
                        "        top: 0 !important\n" +
                        "    }`;\n" +
                        "    head[0].appendChild(style);\n" +
                        "}", null
            )
        }
    }

    /**
     * WebChromeClient subclass handles UI-related calls
     * Note: think chrome as in decoration, not the Chrome browser
     */
    class NavWebChromeClient : WebChromeClient() {
        override fun onGeolocationPermissionsShowPrompt(
            origin: String?,
            callback: GeolocationPermissions.Callback
        ) {
            // Always grant permission since the app itself requires location
            // permission and the user has therefore already granted it
            callback.invoke(origin, true, true)
        }
    }

    companion object {
        private const val TAG = "NavWebViewActivity"
        const val EXTRA_DEST = "EXTRA_DEST"

        val allowedDomains = listOf(
            //Allowed Domains
            "apis.google.com",
            "consent.google.com",
            "fonts.gstatic.com",
            "google.com",
            "khms0.google.com",
            "khms1.google.com",
            "khms2.google.com",
            "khms3.google.com",
            "maps.app.goo.gl",
            "maps.google.com",
            "maps.gstatic.com",
            "ssl.gstatic.com",
            "streetviewpixels-pa.googleapis.com",
            "www.google.com",
            "www.gstatic.com"
        )

        val allowedDomainsStart = listOf("consent.google.")
        val allowedDomainsEnd = listOf(".googleusercontent.com")

        val blockedURLs = listOf(
            //Blocked Domains
            "analytics.google.com",
            "clientmetrics-pa.googleapis.com",
            "doubleclick.com",
            "doubleclick.net",
            "googleadservices.com",
            "google-analytics.com",
            "googlesyndication.com",
            "tpc.googlesyndication.com",
            "pagead.l.google.com",
            "partnerad.l.google.com",
            "video-stats.video.google.com",
            "wintricksbanner.googlepages.com",
            "www-google-analytics.l.google.com",
            "gstaticadssl.l.google.com",
            "csp.withgoogle.com",

            //Blocked URLs
            "google.com/maps/preview/log204",
            "google.com/gen_204",
            "play.google.com/log",
            "/gen_204?",
            "/log204?",
        )
    }
}