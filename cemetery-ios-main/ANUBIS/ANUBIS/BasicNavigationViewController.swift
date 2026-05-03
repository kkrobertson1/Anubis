//
//  BasicNavigationViewController.swift
//  ANUBIS
//
//  Created by Mohammaduvez Payawala on 19/01/26.
//

/// Copyright 2020 Google LLC. All rights reserved.
///
///
/// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
/// file except in compliance with the License. You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software distributed under
/// the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
/// ANY KIND, either express or implied. See the License for the specific language governing
/// permissions and limitations under the License.

import CoreLocation
import GoogleNavigation
import UIKit

class BasicNavigationViewController: UIViewController {
    var destination: CLLocationCoordinate2D!
    var travelMode = GMSNavigationTravelMode.driving
    private let locationManager = CLLocationManager()
    private var currentCoord: CLLocationCoordinate2D?

    private lazy var mapView: GMSMapView = {
        let mapView = GMSMapView()
        mapView.isNavigationEnabled = true
        mapView.settings.compassButton = true
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

        // Show navigation bar with Done (left) and Save (right) buttons
        navigationController?.setNavigationBarHidden(false, animated: false)
        title = "Navigation"

        let doneButton = UIBarButtonItem(
            title: "Done",
            style: .plain,
            target: self,
            action: #selector(onDone)
        )
        navigationItem.leftBarButtonItem = doneButton

        let saveButton = UIBarButtonItem(
            title: "Save to ANUBIS",
            style: .done,
            target: self,
            action: #selector(onSaveToAnubis)
        )
        saveButton.tintColor = UIColor(red: 0.79, green: 0.66, blue: 0.30, alpha: 1.0)
        navigationItem.rightBarButtonItem = saveButton

        // Add live coordinate display at bottom of screen
        view.addSubview(coordsLabel)
        NSLayoutConstraint.activate([
            coordsLabel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            coordsLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            coordsLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            coordsLabel.heightAnchor.constraint(greaterThanOrEqualToConstant: 36)
        ])

        requestRouteToCoordinate(destination)
    }

    @objc private func onDone() {
        navigationController?.popToRootViewController(animated: true)
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
            // Re-open dialog with fresh coords after brief delay
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

    private func requestRouteToCoordinate(_ coordinate: CLLocationCoordinate2D)
    {
        // This force-unwrap is safe because GMSNavigationWaypoint initializer returns a valid non-nil
        // object when a valid CLLocationCoordinate2D object is passed in. Validity of
        // CLLocationCoordinate2D is ensured by its own initializer.
        let wayPoint = GMSNavigationMutableWaypoint(
            location: coordinate,
            title: "Destination Point"
        )!
        wayPoint.vehicleStopover = false
        let destinations = [wayPoint]
        mapView.navigator?.setDestinations(destinations) {
            [weak self] routeStatus in
            guard let self = self else {
                let alert = UIAlertController(
                    title: "No route found",
                    message: "No route found for the destination",
                    preferredStyle: .alert
                )
                alert.addAction(UIAlertAction(title: "OK", style: .default))
                self?.present(alert, animated: true, completion: nil)
                return
            }
            self.mapView.navigator?.isGuidanceActive = true
//            self.mapView.locationSimulator?
//                .simulateLocationsAlongExistingRoute()
            self.mapView.cameraMode = .following
        }
    }

    @objc private func stopNavigation() {
        mapView.locationSimulator?.stopSimulation()
        mapView.navigator?.isGuidanceActive = false
        mapView.navigator?.clearDestinations()
        locationManager.stopUpdatingLocation()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopNavigation()
    }
}

// MARK: - GMSNavigatorListener

extension BasicNavigationViewController: GMSNavigatorListener {

    func navigator(
        _ navigator: GMSNavigator,
        didArriveAt waypoint: GMSNavigationWaypoint
    ) {
        // Stop guidance but keep the user on the navigation screen so they can
        // walk around to find the exact gravesite, then tap "Save to ANUBIS"
        // when they've reached it.
        mapView.navigator?.isGuidanceActive = false
        mapView.cameraMode = .free

        let alert = UIAlertController(
            title: "You've arrived",
            message: "You've reached the cemetery. Walk to the exact gravesite, then tap \"Save to ANUBIS\" in the top-right to save that location to your account.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
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
        // Silent fail — we'll keep showing the last known coords
        print("Location update failed: \(error.localizedDescription)")
    }
}
