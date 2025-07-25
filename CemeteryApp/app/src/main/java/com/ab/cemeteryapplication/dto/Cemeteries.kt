package com.ab.cemeteryapplication.dto

class Cemeteries(
    var address :String?,
    var state :String?,
    var cemetery:String?,
    var pos_lat_lng:String?,
){
    constructor(): this(null,null,null,null)
}