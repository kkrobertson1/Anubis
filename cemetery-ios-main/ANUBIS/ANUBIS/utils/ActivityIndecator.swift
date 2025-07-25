//
//  ActivityIndecator.swift
//  Dropryde-Client
//
//  Created by Tayyab Ali on 09/07/2020.
//  Copyright © 2020 Fantech Labs. All rights reserved.
//

import UIKit

class ActivityIndecator: UIView {
    
    fileprivate static let _sharedManager = ActivityIndecator()
    
    class var instance : ActivityIndecator {
        return _sharedManager
    }
    
    //MARK: - Enums
    enum Mode {
        case light
        case dark
        
        var indicatorColor: UIColor {
            switch self {
            case .dark:
                return UIColor.white
            default:
                return UIColor.black
            }
        }
        
        var loadingViewColor: UIColor {
            switch self {
            case .dark:
                return UIColor.black.withAlphaComponent(0.7)
            case .light:
                return UIColor.white.withAlphaComponent(0.7)
            }
        }
    }
    
    func showActivityIndicatory(on vc: UIViewController, mode: Mode? = .light) {
        DispatchQueue.main.async {
        self.frame = vc.view.frame
        self.center = vc.view.center
        self.backgroundColor = UIColor(white: 0, alpha: 0.3)
        
        let loadingView: UIView = UIView()
        loadingView.frame = CGRect(x: 0, y: 0, width: 80, height: 80)
        loadingView.center = vc.view.center
        loadingView.backgroundColor = mode?.loadingViewColor //UIColor.black.withAlphaComponent(0.7)
        loadingView.clipsToBounds = true
        loadingView.layer.cornerRadius = 10
        
        let actInd: UIActivityIndicatorView = UIActivityIndicatorView()
        actInd.frame = CGRect(x: 0, y: 0, width: 40, height: 40)
        if #available(iOS 13.0, *) {
            actInd.style = .large
        } else {
            actInd.style = .gray
        }
        actInd.color = mode?.indicatorColor
        actInd.center = CGPoint(x: loadingView.frame.size.width / 2, y: loadingView.frame.size.height / 2)
        loadingView.addSubview(actInd)
        self.addSubview(loadingView)
        self.isHidden = false
        
        if let navigation = vc.navigationController {
            navigation.view.addSubview(self)
            self.frame = vc.view.bounds
            actInd.startAnimating()
            return
        }
        
        vc.view.addSubview(self)
        actInd.startAnimating()
        }
    }
    
    func hideActivityIndecator() {
        
        if self.isHidden == false {
            self.isHidden = true
        }
    }
}
