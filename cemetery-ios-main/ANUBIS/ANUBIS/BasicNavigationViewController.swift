//
//  BasicNavigationViewController.swift
//  ANUBIS
//

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

    private func requestRouteToCoordinate(_ coordinate: CLLocationCoordinate2D) {
        let wayPoint = GMSNavigationMutableWaypoint(
            location: coordinate,
            title: "Destination Point"
        )!
        wayPoint.vehicleStopover = false
        let destinations = [wayPoint]
        mapView.navigator?.setDestinations(destinations) { [weak self] _ in
            guard let self = self else { return }
            self.mapView.navigator?.isGuidanceActive = true
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
    func navigator(_ navigator: GMSNavigator, didArriveAt waypoint: GMSNavigationWaypoint) {
        // Original Jan app behavior — pop back to the destination screen on arrival.
        // The user can then tap "Save to ANUBIS Website" on that screen to save their
        // current GPS location, matching the Android app integration pattern.
        self.navigationController?.popViewController(animated: true)
    }
}
