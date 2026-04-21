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

import GoogleNavigation
import UIKit

class BasicNavigationViewController: UIViewController {
    var destination: CLLocationCoordinate2D!
    var travelMode = GMSNavigationTravelMode.driving

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

//           mapView.locationSimulator?.simulateLocation(
//            at: CLLocationCoordinate2D(latitude:37.799640034838895,longitude: -122.4622902939138))

        requestRouteToCoordinate(destination)
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
        self.navigationController?.popViewController(animated: true)
    }
}
