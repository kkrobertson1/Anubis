//
//  BasicNavigationViewController.swift
//  ANUBIS
//

import CoreLocation
import GoogleNavigation
import UIKit

class BasicNavigationViewController: UIViewController {
    var destination: CLLocationCoordinate2D!
    var travelMode = GMSNavigationTravelMode.driving
    private let locationManager = CLLocationManager()
    private var currentCoord: CLLocationCoordinate2D?
    private var hasArrived = false

    private lazy var mapView: GMSMapView = {
        let mapView = GMSMapView()
        mapView.isNavigationEnabled = true
        mapView.settings.compassButton = true
        mapView.settings.myLocationButton = true
        mapView.translatesAutoresizingMaskIntoConstraints = false
        return mapView
    }()

    private lazy var coordsLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.textAlignment = .center
        label.font = .systemFont(ofSize: 14, weight: .semibold)
        label.textColor = .white
        label.backgroundColor = UIColor.black.withAlphaComponent(0.75)
        label.layer.cornerRadius = 8
        label.layer.masksToBounds = true
        label.text = "  📍 Acquiring location...  "
        label.numberOfLines = 0
        return label
    }()

    private lazy var saveFloatingButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Save to ANUBIS Website", for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 16, weight: .bold)
        button.backgroundColor = UIColor(red: 0.79, green: 0.66, blue: 0.30, alpha: 1.0)
        button.setTitleColor(.white, for: .normal)
        button.layer.cornerRadius = 12
        button.layer.shadowColor = UIColor.black.cgColor
        button.layer.shadowOffset = CGSize(width: 0, height: 2)
        button.layer.shadowOpacity = 0.3
        button.layer.shadowRadius = 4
        button.contentEdgeInsets = UIEdgeInsets(top: 14, left: 20, bottom: 14, right: 20)
        button.addTarget(self, action: #selector(onSaveToAnubis), for: .touchUpInside)
        button.isHidden = true  // Hidden until arrival
        return button
    }()

    override func viewDidLoad() {
        super.viewDidLoad()

        view.addSubview(mapView)
        mapView.travelMode = travelMode
        mapView.navigator?.add(self)
        setupConstraints()

        // Set up location manager for live coordinate updates
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.requestWhenInUseAuthorization()
        locationManager.startUpdatingLocation()

        // Show navigation bar with the standard back button + Save button
        navigationController?.setNavigationBarHidden(false, animated: false)

        let saveButton = UIBarButtonItem(
            title: "Save to ANUBIS",
            style: .done,
            target: self,
            action: #selector(onSaveToAnubis)
        )
        saveButton.tintColor = UIColor(red: 0.79, green: 0.66, blue: 0.30, alpha: 1.0)
        navigationItem.rightBarButtonItem = saveButton

        // Add live coordinate display at bottom
        view.addSubview(coordsLabel)
        // Add the prominent save button just above the coords label
        view.addSubview(saveFloatingButton)

        NSLayoutConstraint.activate([
            coordsLabel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            coordsLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            coordsLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            coordsLabel.heightAnchor.constraint(greaterThanOrEqualToConstant: 36),

            saveFloatingButton.bottomAnchor.constraint(equalTo: coordsLabel.topAnchor, constant: -12),
            saveFloatingButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            saveFloatingButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),
            saveFloatingButton.heightAnchor.constraint(equalToConstant: 56),
        ])

        requestRouteToCoordinate(destination)
    }

    @objc private func onSaveToAnubis() {
        let status = locationManager.authorizationStatus
        if status == .denied || status == .restricted {
            let alert = UIAlertController(
                title: "Location access required",
                message: "Please enable location access in Settings to save your current gravesite location.",
                preferredStyle: .alert
            )
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
            return
        }

        guard let coord = currentCoord ?? locationManager.location?.coordinate else {
            let alert = UIAlertController(
                title: "Getting your location...",
                message: "Please wait a moment and try again.",
                preferredStyle: .alert
            )
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
            return
        }

        showSaveDialog(coord: coord)
    }

    private func showSaveDialog(coord: CLLocationCoordinate2D) {
        let formatted = String(format: "%.6f, %.6f", coord.latitude, coord.longitude)
        let alert = UIAlertController(
            title: "Save Gravesite Location",
            message: "Current GPS coordinates:\n\n\(formatted)\n\nTap \"Save to Website\" to save this location to your account, or \"Refresh\" to get an updated GPS reading.",
            preferredStyle: .alert
        )

        alert.addAction(UIAlertAction(title: "Save to Website", style: .default) { _ in
            let urlString = "https://www.anubiskemet2.com/dashboard/gravesite/new?lat=\(coord.latitude)&lng=\(coord.longitude)"
            if let url = URL(string: urlString) {
                UIApplication.shared.open(url)
            }
        })

        alert.addAction(UIAlertAction(title: "Refresh Location", style: .default) { [weak self] _ in
            self?.locationManager.requestLocation()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                self?.onSaveToAnubis()
            }
        })

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    private func setupConstraints() {
        NSLayoutConstraint.activate([
            mapView.topAnchor.constraint(equalTo: view.topAnchor),
            mapView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            mapView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            mapView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])
    }

    private func requestRouteToCoordinate(_ coordinate: CLLocationCoordinate2D) {
        let wayPoint = GMSNavigationMutableWaypoint(
            location: coordinate,
            title: "Destination Point"
        )!
        wayPoint.vehicleStopover = false
        let destinations = [wayPoint]
        mapView.navigator?.setDestinations(destinations) { [weak self] routeStatus in
            guard let self = self else { return }
            self.mapView.navigator?.isGuidanceActive = true
            self.mapView.cameraMode = .following
        }
    }

    private func exitNavigationMode() {
        // Fully release the Google Navigation SDK so the map is freely interactive,
        // the navigation bar is no longer obscured by overlays, and the user can
        // walk around to find the exact gravesite.
        mapView.locationSimulator?.stopSimulation()
        mapView.navigator?.isGuidanceActive = false
        mapView.navigator?.clearDestinations()
        mapView.isNavigationEnabled = false
        mapView.cameraMode = .free
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        // Only fully tear down nav and stop location updates when leaving the screen
        exitNavigationMode()
        locationManager.stopUpdatingLocation()
    }
}

// MARK: - GMSNavigatorListener

extension BasicNavigationViewController: GMSNavigatorListener {
    func navigator(_ navigator: GMSNavigator, didArriveAt waypoint: GMSNavigationWaypoint) {
        guard !hasArrived else { return }
        hasArrived = true

        // Fully exit navigation mode so the map is free to pan/zoom and overlays
        // no longer cover the navigation bar or block touches.
        exitNavigationMode()

        // Re-center the camera on the user's current location
        if let coord = currentCoord ?? locationManager.location?.coordinate {
            let camera = GMSCameraPosition(target: coord, zoom: 19)
            mapView.animate(to: camera)
        }

        // Show the prominent on-screen Save button
        saveFloatingButton.isHidden = false

        // Brief, non-blocking notification — auto-dismisses in 3 seconds
        let alert = UIAlertController(
            title: "You've arrived",
            message: "Walk to the exact gravesite, then tap \"Save to ANUBIS Website\" to save the location.",
            preferredStyle: .alert
        )
        present(alert, animated: true)
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            alert.dismiss(animated: true)
        }
    }
}

// MARK: - CLLocationManagerDelegate

extension BasicNavigationViewController: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }
        currentCoord = loc.coordinate
        coordsLabel.text = String(
            format: "  📍 Current: %.6f, %.6f  ",
            loc.coordinate.latitude,
            loc.coordinate.longitude
        )
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location update failed: \(error.localizedDescription)")
    }
}
