//
//  ViewController.swift
//  ANUBIS
//
//  Created by Mohammaduvez Payawala on 19/01/26.
//

import GoogleMaps
import GoogleNavigation
import UIKit

class DestinationVC: UIViewController {
    @IBOutlet weak var mapView: GMSMapView!
    @IBOutlet weak var directionType: UISegmentedControl!
    var destination: CLLocationCoordinate2D!
    var marker: GMSMarker!
    private let locationManager = CLLocationManager()

    override func viewDidLoad() {
        super.viewDidLoad()
        mapView.delegate = self
        // Creates a marker in the center of the map.
        marker = GMSMarker()
        marker.position = destination
        marker.snippet =
            "lat/lng: (\(destination.latitude),\(destination.longitude))"
        marker.map = mapView
        mapView.moveCamera(GMSCameraUpdate.setTarget(destination, zoom: 16))
    }

    @IBAction func onStartGuidance() {
        // Show the terms and conditions.
        GMSNavigationServices.showTermsAndConditionsDialogIfNeeded(
            with: GMSNavigationTermsAndConditionsOptions.init(
                companyName: Bundle.main.infoDictionary![
                    kCFBundleNameKey as String
                ] as! String
            )
        ) { termsAccepted in
            if termsAccepted {
                // First check the existing location authorization status, to ensure that an error is
                // printed if the location authorization has already been rejected. In this case, the system
                // dialog won't be displayed and the authorization status will not change.
                self.checkLocationStatusAndGotoNavigation()

            } else {
                // Handle rejection of terms and conditions.
                print("Terms and conditions were not accepted.")
            }
        }
    }
    
    private func checkLocationStatusAndGotoNavigation(){
        var status = CLAuthorizationStatus.notDetermined
        status = self.locationManager.authorizationStatus
        self.logIfLocationStatusNotAuthorized(status)
        switch status {
        case .notDetermined:
            self.locationManager.delegate = self
            self.locationManager.requestAlwaysAuthorization()
        case .authorizedAlways:
            self.gotoNavigationScreen()
        case .authorizedWhenInUse:
            self.gotoNavigationScreen()
        case .restricted:
            self.gotoNavigationScreen()
        case .denied:
            self.showAlertDialog(style: .alert, title: "", message: "Location access is required to continue.")
        @unknown default:
            print(
                "warning: Location authorization status is unknown: \(status.rawValue)"
            )
            self.showAlertDialog(style: .alert, title: "", message: "Location access is required to continue.")
        }
    }
    
    private func gotoNavigationScreen(){
        // Request authorization for alert notifications which deliver guidance instructions
        // in the background.
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert]) {
                (granted, error) in
                // Handle rejection of notification authorization.
                if !granted || error != nil {
                    print(
                        "Authorization to deliver notifications was rejected."
                    )
                }
            }

        let vc = BasicNavigationViewController()
        vc.destination = self.destination
        vc.travelMode =
            self.directionType.selectedSegmentIndex == 1
            ? GMSNavigationTravelMode.walking
            : GMSNavigationTravelMode.driving
        self.navigationController?.pushViewController(
            vc,
            animated: true
        )
    }

    /// Prints an error message if the given authorization status is .denied or .restricted because
    /// NavDemo won't work properly in this case.
    private func logIfLocationStatusNotAuthorized(
        _ status: CLAuthorizationStatus
    ) {
        var statusText = ""
        switch status {
        case .authorizedAlways, .authorizedWhenInUse, .notDetermined:
            return
        case .restricted:
            statusText = "Restricted"
        case .denied:
            statusText = "Denied"
        @unknown default:
            print(
                "warning: Location authorization status is unknown: \(status.rawValue)"
            )
        }
        print(
            "error: Location authorization failed to be granted or was revoked with status: "
                + "\(statusText)"
        )
    }
}

extension DestinationVC: GMSMapViewDelegate {

    func mapView(
        _ mapView: GMSMapView,
        didTapAt coordinate: CLLocationCoordinate2D
    ) {
        self.destination = coordinate
        self.marker.position = coordinate
        self.marker.snippet =
            "lat/lng: (\(destination.latitude),\(destination.longitude))"
    }
}

extension DestinationVC:CLLocationManagerDelegate{
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        self.checkLocationStatusAndGotoNavigation()
    }
}
