//
//  LiveData.swift
//  ANUBIS
//
//  Created by abdur rehman on 4/2/21.
//

import Foundation
import FirebaseDatabase

class LiveData {
    
    static let shared = LiveData()
    
    var graves = [Grave]()
    var cemeteryModel = [Cemetery]()
    var graveModel = [String: Graves]()
    var states = [String]()
    var cemeteries = [String]()
    
    var filteredStates = [String]()
    var filteredCemeteries = [String]()
    
    func getData(stateName: String, cemeteryName: String, _ callBack: @escaping (_ grave: [Grave]) -> Void) {
        
        DB.ref.child(DB.Graves).queryOrdered(byChild: "state").queryEqual(toValue : "\(stateName)").observe(.value) { (snapshot) in
            
            var graves = [Grave]()
            
            snapshot.children.forEach { (child) in
                let childData = (child as! DataSnapshot).value as! [String: Any?]
                let cemetery = childData["cemetery"] as? String
                if (cemetery != nil) && cemetery == cemeteryName {
                    let grave = Grave(
                        address: childData["address"] as? String,
                        cemetery:  childData["cemetery"] as? String,
                        pos_lat_lng:  childData["pos_lat_lng"] as? String,
                        state:  childData["state"] as? String)
                    if grave.latitude != nil
                        && grave.longitude != nil
                        && (-91...91).contains(grave.latitude!)
                        && (-181...181).contains(grave.longitude!)
                        {
                        graves.append(grave)
                        
                    }
                }
                
            }
            
            callBack(graves)
        }
    }
    
    func getState(_ callBack: @escaping (_ states: [String]) -> Void) {
        
        DB.ref.child(DB.States).observe(.value) { (snapshot) in
            
            var states =  [String]()
            snapshot.children.forEach { (child) in
                let childData = (child as! DataSnapshot).value as! [String: Any?]
                if childData["stateName"] as? String != nil {
                    states.append(childData["stateName"] as! String)
                }
            }
            callBack(states)
        }
    }
    
    func getCemetry(stateName: String, _ callBack: @escaping (_ cemetry: [String]) -> Void) {
        DB.ref.child(DB.Cemetries).queryOrdered(byChild: "state").queryEqual(toValue : "\(stateName)").observe(.value) { (snapshot) in
            
            var cemetry =  [String]()
            snapshot.children.forEach { (child) in
                let childData = (child as! DataSnapshot).value as! [String: Any?]
                if childData["cemetery"] as? String != nil {
                    cemetry.append(childData["cemetery"] as! String)
                }
            }
            
            callBack(cemetry)
        }
    }
    
    
//    let ref = FIRDatabase.database().reference().child("users/90384m590v834dfgok34")
//
//    ref.updateChildValues([
//        "values": [
//            "test3",
//            "test4"
//        ]
//    ])
    
    
//    func updateGrave() {
//        let ref =  DB.ref.child(DB.Graves)
////        ref.child("247").updateChildValues(["cemetery":"Adams Cemetery (Clackamas)"])
//        ref.observe(.value) { snapshot in
//            if snapshot.exists(){
//                for child in snapshot.children{
//                    let childData = (child as! DataSnapshot).value as! [String: Any?]
//                    let childID = (child as! DataSnapshot).key
//                    let address = childData["address"] as? String
//                    let cemetery = childData["cemetery"] as? String
//                    print(childData)
//                    if address == " " {
//                        ref.child(childID).updateChildValues(["cemetery":"\(cemetery ?? "")"])
//                    }else{
//                        ref.child(childID).updateChildValues(["cemetery":"\(cemetery ?? "") (\(address ?? ""))"])
//                    }
//
//                    print(childID)
//                }
//            }
//        }
//    }
    
    
    
//    func getDataFromJaosn(){
//
//        let user = Bundle.main.decode(JSONReader.self, from: "new_properties.json")
//
//        var i = 1
//
//        let graves = user.graves.sorted(by: {($0.value.cemetery < $1.value.cemetery)})
//        graves.forEach { graves in
//
//            let newGrave = Cemetery.init(cemetery: graves.value.cemetery, state: graves.value.state ?? "")
//
//
//            if !cemeteryModel.contains(where: {($0.cemetery == newGrave.cemetery)})
//            {
//                cemeteryModel.append(newGrave)
////            let new = [graves.key: newGrave]
////            print(new)
////            graveModel[]
////            cemeteryModel.updateValue(newGrave, forKey: graves.key)
////            graveModel[graves.key]?.cemetery = newGrave.cemetery
////            graveModel[graves.key]?.address = newGrave.address
////            graveModel[graves.key]?.state = newGrave.state
////            graveModel[graves.key]?.posLatLng = newGrave.posLatLng
////            print(graveModel[graves.key])
//                i+=1
//                print(i)
//            }
//        }
//        print(cemeteryModel[0])
//
//        let encoder = JSONEncoder()
//        encoder.outputFormatting = .prettyPrinted
//        let data = try! encoder.encode(cemeteryModel)
////        print(String(data: data, encoding: .utf8)!)
//
//
//
//        do {
//            let fileURL = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
//                .appendingPathComponent("properties1.json")
//
//            try? data.write(to: fileURL)
//        } catch {
//            print(error.localizedDescription)
//        }
//
//
//
//
//
//    }
//
//    func writeJson(){
//        if let documentDirectory = FileManager.default.urls(for: .documentDirectory,
//                                                            in: .userDomainMask).first {
//            let pathWithFilename = documentDirectory.appendingPathComponent("myJsonString.json")
//            do {
//                try jsonString.write(to: pathWithFilename,
//                                     atomically: true,
//                                     encoding: .utf8)
//            } catch {
//                // Handle error
//            }
//        }
//    }
    
        
    
    
    
    
}



struct finalData:Codable {
    var graves = [readGraves]()
    var states = [String]()
    var cemeteries = [String]()
    
}



class DB {
    static var ref: DatabaseReference = Database.database().reference()
    static var Graves = "graves"
    static var States = "states"
    static var Cemetries = "cemeteries"
}




struct Grave {
    
    var address: String?
    var cemetery: String?
    var pos_lat_lng: String?
    var state: String?

    var latitude: Double? {
        get {
            if let pos_lat_lng = pos_lat_lng {
                if pos_lat_lng.contains(",") {
                    let data = pos_lat_lng.split(separator: ",")
                    if data.count > 0 {
                        return Double(data[0].trimmingCharacters(in: .whitespacesAndNewlines))
                    }
                }
            }
            return nil
        }
    }
    var longitude: Double? {
        get {
            if let pos_lat_lng = pos_lat_lng {
                if pos_lat_lng.contains(",") {
                    let data = pos_lat_lng.split(separator: ",")
                    if data.count > 1 {
                        return Double(data[1].trimmingCharacters(in: .whitespacesAndNewlines))
                    }
                }
            }
            return nil
        }
    }
}


struct readGraves: Codable{
    
    var address: String?
    var cemetery: String?
    var pos_lat_lng: String?
    var state: String?

    var latitude: Double? {
        get {
            if let pos_lat_lng = pos_lat_lng {
                if pos_lat_lng.contains(",") {
                    let data = pos_lat_lng.split(separator: ",")
                    if data.count > 0 {
                        return Double(data[0].trimmingCharacters(in: .whitespacesAndNewlines))
                    }
                }
            }
            return nil
        }
    }
    var longitude: Double? {
        get {
            if let pos_lat_lng = pos_lat_lng {
                if pos_lat_lng.contains(",") {
                    let data = pos_lat_lng.split(separator: ",")
                    if data.count > 1 {
                        return Double(data[1].trimmingCharacters(in: .whitespacesAndNewlines))
                    }
                }
            }
            return nil
        }
    }
}


extension Bundle {
    func decode<T: Decodable>(_ type: T.Type, from file: String, dateDecodingStrategy: JSONDecoder.DateDecodingStrategy = .deferredToDate, keyDecodingStrategy: JSONDecoder.KeyDecodingStrategy = .useDefaultKeys) -> T {
        guard let url = self.url(forResource: file, withExtension: nil) else {
            fatalError("Failed to locate \(file) in bundle.")
        }

        guard let data = try? Data(contentsOf: url) else {
            fatalError("Failed to load \(file) from bundle.")
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = dateDecodingStrategy
        decoder.keyDecodingStrategy = keyDecodingStrategy

        do {
            return try decoder.decode(T.self, from: data)
        } catch DecodingError.keyNotFound(let key, let context) {
            fatalError("Failed to decode \(file) from bundle due to missing key '\(key.stringValue)' not found – \(context.debugDescription)")
        } catch DecodingError.typeMismatch(_, let context) {
            fatalError("Failed to decode \(file) from bundle due to type mismatch – \(context.debugDescription)")
        } catch DecodingError.valueNotFound(let type, let context) {
            fatalError("Failed to decode \(file) from bundle due to missing \(type) value – \(context.debugDescription)")
        } catch DecodingError.dataCorrupted(_) {
            fatalError("Failed to decode \(file) from bundle because it appears to be invalid JSON")
        } catch {
            fatalError("Failed to decode \(file) from bundle: \(error.localizedDescription)")
        }
    }
}








//extension Bundle {
//
//    func decode<x: Decodable>(_ type: x.Type, from filename: String) -> x? {
//        guard let json = url(forResource: filename, withExtension: nil) else {
//            print("Failed to locate \(filename) in app bundle.")
//            return nil
//        }
//        do {
//            let jsonData = try Data(contentsOf: json)
//            let decoder = JSONDecoder()
//            let result = try decoder.decode(x.self, from: jsonData)
//            return result
//        } catch {
//            print("Failed to load and decode JSON \(error)")
//            return nil
//        }
//    }
//}





//
//extension Bundle{
//    func decode<T: Codable>(_ file: String) -> T {
//
//    // 1. Locate Josn file
//
//    guard let url = self.url(forResource: file, withExtension: nil) else {             fatalError("Faild to locate json \(file ) in bundle.")
//    }
//
//        // 2. Create Property for data
//    guard let data = try? Data(contentsOf: url) else {
//        fatalError("Faild to load \(file ) from bundle.")
//
//    }
//
//    // 3. Create Decoder
//    let decoder = JSONDecoder()
//
//
//    // 4. Create Property for decoded data
//    guard let loaded = try? decoder.decode(T.self, from: data)  else {             fatalError("Faild to decode \(file) from bundle.")
//
//    }
//    // Return Ready-to-use  data
//    return loaded
//
//    }
//
//}








