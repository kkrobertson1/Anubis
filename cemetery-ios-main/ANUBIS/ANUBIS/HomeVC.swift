//
//  ViewController.swift
//  ANUBIS
//
//  Created by abdur rehman on 4/2/21.
//

import UIKit
import GoogleMaps
import GoogleMobileAds

class HomeVC: UIViewController {
    
    @IBOutlet weak var mapView: GMSMapView!
    @IBOutlet weak var stateButton: UIButton!
    @IBOutlet weak var cemeteryButton: UIButton!
    @IBOutlet weak var bottomConstraint: NSLayoutConstraint!
    var bannerView: GADBannerView!
    
    var selectedState: String?
    var selectedCemetery: String?
    var currentMarkers = [Grave]()
    
    let markerImage = UIImageView(image: UIImage(named: "angel")!.resizeImage(targetSize: CGSize(width: 40, height: 40)))
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        mapView.mapType = .satellite
        mapView.delegate = self
        
        bannerView = GADBannerView(adSize: kGADAdSizeBanner)
        bannerView.rootViewController = self
        bannerView.isHidden = true
//        bannerView.adUnitID = "ca-app-pub-3940256099942544/2934735716"
        bannerView.adUnitID = "ca-app-pub-2240572702544337/8585886043"
        bannerView.load(GADRequest())
        bannerView.delegate = self
        addBannerViewToView(bannerView)
        
       // LiveData.shared.getDataFromJaosn()
        
    }
    
    func addBannerViewToView(_ bannerView: GADBannerView) {
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(bannerView)
        view.addConstraints(
            [NSLayoutConstraint(item: bannerView,
                                attribute: .bottom,
                                relatedBy: .equal,
                                toItem: bottomLayoutGuide,
                                attribute: .top,
                                multiplier: 1,
                                constant: 0),
             NSLayoutConstraint(item: bannerView,
                                attribute: .centerX,
                                relatedBy: .equal,
                                toItem: view,
                                attribute: .centerX,
                                multiplier: 1,
                                constant: 0)
            ])
    }
    
    func addMarkers(graveList: [Grave]) {

        func addMarker(grave: Grave) -> Void {
            currentMarkers.append(grave)
            let position = CLLocationCoordinate2DMake(grave.latitude!, grave.longitude!)
            let marker = GMSMarker(position: position)
            marker.title = grave.cemetery
            marker.iconView = markerImage
            marker.map = mapView
            marker.userData = grave
        }

        mapView.clear()
        currentMarkers.removeAll()

        var lats = [Double]()
        var lngs = [Double]()

        let bounds = GMSCoordinateBounds()
        graveList.forEach { (grave) in
            let point = CLLocationCoordinate2D(latitude: grave.latitude!, longitude: grave.longitude!)
            lats.append(point.latitude)
            lngs.append(point.longitude)
            bounds.includingCoordinate(point)
            addMarker(grave: grave)
        }

        if graveList.count == 1 {
            let update = GMSCameraPosition.init(target: CLLocationCoordinate2D(latitude: graveList[0].latitude!,
                                                                               longitude: graveList[0].longitude!),
                                                zoom: 16)
            mapView.animate(to: update)
        } else {
            let bounds = GMSCoordinateBounds.init(coordinate: CLLocationCoordinate2D(latitude: lats.min()!,
                                                                                     longitude: lngs.min()!),
                                                  coordinate: CLLocationCoordinate2D(latitude: lats.max()!,
                                                                                     longitude: lngs.max()!))
            let update = GMSCameraUpdate.fit(bounds, withPadding: 50)
            mapView.animate(with: update)
        }
    }
    
    @IBAction func onSelectState() {
        
        showLoading()
        LiveData.shared.getState { stateList in
            self.hideLoading()
            let sortedState = stateList.sorted()
            _ = Picker.init(vcc: self, dataa: sortedState, selected: self.selectedState ?? "Select State", callbackk: { (state) in
               self.selectedState = state
               self.selectedCemetery = nil
               self.stateButton.setTitle(self.selectedState, for: .normal)
               self.cemeteryButton.setTitle("Select Cemetery", for: .normal)
           })
        }
    }
    
    @IBAction func onSelectCemetery() {
        
        if selectedState == nil || selectedState == "Select State" {
            showAlertDialog(style: .alert, title: "", message: "Please select state first.")
            return
        }
        showLoading()
        LiveData.shared.getCemetry(stateName: self.selectedState!) { cemetries in
            self.hideLoading()
            let cemetriesState = cemetries.sorted()
            _ = Picker.init(vcc: self, dataa: cemetriesState, selected: self.selectedCemetery ?? "Select Cemetery", callbackk: { (cemetery) in
                self.selectedCemetery = cemetery
                self.cemeteryButton.setTitle(self.selectedCemetery, for: .normal)
            })
        }
    }
    
    @IBAction func onSearch() {
        
        if selectedState == nil || selectedState == "Select State" {
            showAlertDialog(style: .alert, title: "", message: "Please select state.")
            return
        }
        if selectedCemetery == nil || selectedCemetery == "Select Cemetery" {
            showAlertDialog(style: .alert, title: "", message: "Please select cemetery.")
            return
        }
        showLoading()
        LiveData.shared.getData(stateName: selectedState!, cemeteryName: selectedCemetery!) {
            gravesList in
            self.hideLoading()
            self.addMarkers(graveList: gravesList)
        }
       
    }
}

extension HomeVC : GMSMapViewDelegate {
    
    func mapView(_ mapView: GMSMapView, markerInfoContents marker: GMSMarker) -> UIView? {
        
        let placeMarker = marker
        let infoView = MarkerInfoView(frame: CGRect(x: 0,y: 0,width: 200,height: 130))
        let grave = placeMarker.userData as! Grave
        
        let link = NSAttributedString(string: "GPS - Click to GO", attributes: [NSAttributedString.Key.underlineStyle: NSUnderlineStyle.single.rawValue])
        
        infoView.label1.text = grave.cemetery
        infoView.label2.text = "Address: " + (grave.address ?? "")
        infoView.label3.text = "State: " + (grave.state ?? "")
        infoView.label4.attributedText = link
        
        let update = GMSCameraPosition.init(target: CLLocationCoordinate2D(latitude:grave.latitude!,
                                                                           longitude: grave.longitude!),
                                            zoom: 16)
        mapView.animate(to: update)
        
        return infoView
    }
    
    func mapView(_ mapView: GMSMapView, didTapInfoWindowOf marker: GMSMarker) {
        let grave = marker.userData as! Grave
        if (UIApplication.shared.canOpenURL(NSURL(string:"comgooglemaps://")! as URL)) {
            let url = "comgooglemaps://?q=\(grave.latitude!),\(grave.longitude!)&center=\(grave.latitude!),\(grave.longitude!)&zoom=18"
            UIApplication.shared.open(NSURL(string:url)! as URL, options: [:]) { (success) in }
        } else {
            NSLog("Can't use comgooglemaps://");
            print("Can't use comgooglemaps://")
            
            if let url = URL(string: "https://www.google.com/maps/search/?api=1&query=\(grave.latitude!),\(grave.longitude!)") {
                UIApplication.shared.open(url)
            } else {
                print("invalid url")
            }
        }
    }
}

extension HomeVC: GADBannerViewDelegate {
    
    func bannerViewDidReceiveAd(_ bannerView: GADBannerView) {
        bottomConstraint.constant = bannerView.frame.height
        bannerView.isHidden = false
        view.layoutIfNeeded()
    }
    
    func bannerView(_ bannerView: GADBannerView, didFailToReceiveAdWithError error: Error) {
        bottomConstraint.constant = 0
        bannerView.isHidden = true
        view.layoutIfNeeded()
    }
}
