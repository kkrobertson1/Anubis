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

    private lazy var mapView: GMSMapView = {
        let mapView = GMSMapView()
        mapView.isNavigationEnabled = true
        mapView.settings.compassButton = true
        mapView.translatesAutoresizingMaskIntoConstraints = false
        return mapView
    }()

    override func viewDidLoad() {
        super.viewDidLoad()

        view.addSubview(mapView)
        mapView.travelMode = travelMode
        mapView.navigator?.add(self)
        setupConstraints()

        // Add "Save to ANUBIS" button as a top-right navigation bar item
        let saveButton = UIBarButtonItem(
            title: "Save to ANUBIS",
            style: .done,
            target: self,
            action: #selector(onSaveToAnubis)
        )
        saveButton.tintColor = UIColor(red: 0.79, green: 0.66, blue: 0.30, alpha: 1.0)
        navigationItem.rightBarButtonItem = saveButton
        navigationController?.setNavigationBarHidden(false, animated: false)

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
        guard let currentLocation = locationManager.location else {
            locationManager.startUpdatingLocation()
            let alert = UIAlertController(
                title: "Getting your location...",
                message: "Please wait a moment and try again.",
                preferredStyle: .alert
            )
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
            return
        }
        let lat = currentLocation.coordinate.latitude
        let lng = currentLocation.coordinate.longitude
        let urlString = "https://www.anubiskemet2.com/dashboard/gravesite/new?lat=\(lat)&lng=\(lng)"
        if let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        }
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

        navigationItem.rightBarButtonItem = nil
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
