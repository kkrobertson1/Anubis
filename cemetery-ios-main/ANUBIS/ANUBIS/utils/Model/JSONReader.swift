//
//  JSONReader.swift
//  ANUBIS
//
//  Created by TecSpine on 08/09/2022.
//

// MARK: - CemetryAppFirebaseBackup3
struct JSONReader: Codable {
    let cemeteries: [Cemetery]
    let graves: [String: Graves]
    let properties: [String: Property]
    let states: [String: StateValue]
}
// MARK: - Cemetery
struct Cemetery: Codable {
    let cemetery: String
    let state: String
    
    init(cemetery: String, state: String){
        self.cemetery = cemetery
        self.state = state
    }
    
}
enum StateEnum: String, Codable {
    case ak = "AK"
    case al = "AL"
    case ar = "AR"
    case az = "AZ"
    case ca = "CA"
    case co = "CO"
    case ct = "CT"
    case dc = "DC"
    case de = "DE"
    case empty = " "
    case fl = "FL"
    case ga = "GA"
    case hi = "HI"
    case ia = "IA"
    case id = "ID"
    case il = "IL"
    case ks = "KS"
    case ky = "KY"
    case la = "LA"
    case ma = "MA"
    case md = "MD"
    case me = "ME"
    case mi = "MI"
    case mn = "MN"
    case mo = "MO"
    case ms = "MS"
    case mt = "MT"
    case nc = "NC"
    case nd = "ND"
    case ne = "NE"
    case nh = "NH"
    case nj = "NJ"
    case nm = "NM"
    case nv = "NV"
    case ny = "NY"
    case oh = "OH"
    case ok = "OK"
    case or = "OR"
    case pa = "PA"
    case pr = "PR"
    case ri = "RI"
    case sc = "SC"
    case sd = "SD"
    case stateIN = "IN"
    case tn = "TN"
    case tx = "TX"
    case ut = "UT"
    case va = "VA"
    case vi = "VI"
    case vt = "VT"
    case wa = "WA"
    case wi = "WI"
    case wv = "WV"
    case wy = "WY"
}
// MARK: - Grave
struct Graves: Codable {
    var address: String?
    var cemetery: String
    var posLatLng: String?
    var state: String?
    enum CodingKeys: String, CodingKey {
        case address, cemetery
        case posLatLng = "pos_lat_lng"
        case state
    }
    
    init(cemetery: String, state: String, address: String, posLatLng: String ){
        self.cemetery = cemetery
        self.state = state
        self.posLatLng = posLatLng
        self.address = address
    }
}
// MARK: - Property
struct Property: Codable {
    let flPlan0LL, flPlan0UR: String
    let flPlan0URL: String
    let posLatLng, propAddress: String
    let flPlan1LL: String?
    enum CodingKeys: String, CodingKey {
        case flPlan0LL = "flPlan0_LL"
        case flPlan0UR = "flPlan0_UR"
        case flPlan0URL = "flPlan0_URL"
        case posLatLng = "pos_lat_lng"
        case propAddress = "prop_Address"
        case flPlan1LL = "flPlan1_LL"
    }
}
// MARK: - StateValue
struct StateValue: Codable {
    let stateName: String
}









