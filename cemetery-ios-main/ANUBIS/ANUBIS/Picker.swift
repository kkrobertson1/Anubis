//
//  Picker.swift
//  ANUBIS
//
//  Created by abdur rehman on 4/2/21.
//

import Foundation
import UIKit

class Picker: NSObject {
    
    var vc: UIViewController!
    var originalData: [String]!
    var tempData: [String]!
    var callBack: ((String) -> Void)!
    
    ///UI Overlay Elements
    var toolBar: UIView!
    var picker: UIPickerView!
    var searchBar: UISearchBar!
    var selectedIndex = 0
    
    init(vcc: UIViewController, dataa: [String], selected: String, callbackk: @escaping (String) -> Void) {
        super.init()
        vc = vcc
        originalData = dataa
        tempData = dataa
        selectedIndex = tempData.firstIndex(of: selected) ?? 0
        callBack = callbackk
        initUIData()
    }
    
    func initUIData() {
        let buttonWidth = CGFloat(80)
        
        picker = UIPickerView.init()
        picker!.delegate = self
        picker!.backgroundColor = UIColor.white
        picker!.setValue(UIColor.black, forKey: "textColor")
        picker!.autoresizingMask = .flexibleWidth
        picker!.contentMode = .center
        picker!.frame = CGRect.init(x: 0.0, y: UIScreen.main.bounds.size.height - 300, width: UIScreen.main.bounds.size.width, height: 300)
        picker!.selectRow(selectedIndex, inComponent: 0, animated: true)
        vc.view.addSubview(picker!)
        
        searchBar = UISearchBar.init(frame: CGRect.init(x: 0.0, y: 0.0, width: UIScreen.main.bounds.size.width - buttonWidth, height: 50))
        searchBar!.barStyle = .default
        searchBar!.delegate = self
        
        let button = UIButton.init()
        button.setTitle("Done", for: .normal)
        button.frame = CGRect(x: UIScreen.main.bounds.size.width - buttonWidth, y: (searchBar!.frame.height/2) - 20, width: buttonWidth, height: 40)
        button.setTitleColor(.black, for: .normal)
        button.addAction(UIAction.init(handler: { (action) in
            self.onDoneButtonTapped()
        }), for: .touchUpInside)
        
        toolBar = UIView.init(frame: CGRect.init(x: 0.0, y: UIScreen.main.bounds.size.height - 300, width: UIScreen.main.bounds.size.width, height: 50))
        toolBar!.addSubview(searchBar!)
        toolBar!.addSubview(button)
        vc.view.addSubview(toolBar!)
    }
    
    func onDoneButtonTapped() {
       
        callBack(tempData[picker.selectedRow(inComponent: 0)])
        toolBar?.removeFromSuperview()
        picker?.removeFromSuperview()
    }
}

extension Picker: UIPickerViewDelegate, UIPickerViewDataSource {
    
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }
    
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return tempData.count
    }
    
    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        return tempData[row]
    }
}

extension Picker: UISearchBarDelegate {
    func searchBarShouldEndEditing(_ searchBar: UISearchBar) -> Bool {
        searchBar.resignFirstResponder()
    }
    
    func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
        if searchBar.text?.count ?? 0 > 0 {
            tempData = originalData.filter({ (state) -> Bool in
                return state.lowercased().contains(searchBar.text!.lowercased())
            })
        } else {
            tempData = originalData
        }
        picker?.reloadAllComponents()
    }
    
    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
    }
    
}
